export class FFRPGActor extends Actor {
  prepareDerivedData() {
    super.prepareDerivedData();
    const system = this.system;
    const primary = CONFIG.FFRPG4E.jobs[system.jobs.primary];
    const secondary = CONFIG.FFRPG4E.jobs[system.jobs.secondary];
    const stats = {};
    let level = 0;
    for (const [key, stat] of Object.entries(system.stats)) {
      const statLevel = Math.floor(stat.value / 10);
      stats[key] = {
        label: CONFIG.FFRPG4E.stats[key],
        value: stat.value,
        level: statLevel
      };
      level += statLevel;
    }
    const equipment = this.items.filter((item) => item.type === "equipment" && item.system.equipped);
    const arm = equipment.reduce((total, item) => total + item.system.arm, system.combat.arm);
    const marm = equipment.reduce((total, item) => total + item.system.marm, system.combat.marm);
    let hpMax = 0;
    let mpMax = 0;
    if (primary && secondary) {
      hpMax = 10 + level * primary.hp + Math.floor(level * secondary.hp / 2);
      mpMax = 5 + level * primary.mp + Math.floor(level * secondary.mp / 2);
    }
    this.derived = {
      level,
      stats,
      primaryJob: primary,
      secondaryJob: secondary,
      arm,
      marm,
      hpMax,
      mpMax
    };
  }

  async rollChallenge(skillKey, difficulty) {
    const skill = CONFIG.FFRPG4E.skills[skillKey];
    const skillLevel = this.system.skills[skillKey];
    const dice = skillLevel + 1;
    let formula = "1d100";
    if (skillLevel > 0) formula = `${dice}d100kh`;
    const roll = await new Roll(formula).evaluate();
    const total = roll.total;
    const success = total > difficulty;
    const content = await renderTemplate("systems/ffrpg4e-homebrew-foundry/templates/chat/challenge-roll.hbs", {
      actor: this,
      skill,
      skillLevel,
      difficulty,
      total,
      success
    });
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${skill.label} Challenge`,
      content
    });
    return { roll, success };
  }

  async rollInitiativeDice() {
    const roll = await new Roll("3d10").evaluate();
    await this.updateCombatInitiative(roll.total);
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: "Initiative"
    });
    return roll;
  }

  async updateCombatInitiative(total) {
    const token = canvas.tokens.controlled.find((token) => token.actor?.id === this.id);
    if (!token) {
      ui.notifications.warn("Select this actor's token first.");
      return;
    }
    let combat = game.combat;
    if (!combat) combat = await Combat.create({ scene: canvas.scene.id, active: true });
    let combatant = combat.combatants.find((combatant) => combatant.tokenId === token.id);
    if (!combatant) {
      const created = await combat.createEmbeddedDocuments("Combatant", [{
        tokenId: token.id,
        sceneId: canvas.scene.id,
        actorId: this.id,
        hidden: token.document.hidden
      }]);
      combatant = created[0];
    }
    await combatant.update({ initiative: total });
  }

  async rollBasicAttack() {
    const weapon = this.items.find((item) => item.type === "equipment" && item.system.equipped && item.system.slot === "weapon");
    if (!weapon) {
      ui.notifications.warn("Equip a weapon first.");
      return;
    }
    await this.rollCombatAction({
      name: weapon.name,
      data: weapon.system
    });
  }

  async rollItem(itemId) {
    const item = this.items.get(itemId);
    if (!item) return;
    if (item.type === "equipment" && item.system.slot === "weapon") {
      await this.rollCombatAction({ name: item.name, data: item.system, item });
      return;
    }
    if (item.type === "ability") {
      await this.rollCombatAction({ name: item.name, data: item.system, item });
      return;
    }
    if (item.type === "spell") await this.rollCombatAction({ name: item.name, data: item.system, item });
  }

  async rollCombatAction(action) {
    const data = action.data;
    if (this.system.combat.defeated) {
      ui.notifications.warn("This actor is KO.");
      return;
    }
    if (!this.canUseAction(data.actionType)) return;
    const spent = await this.spendResources(data);
    if (!spent) return;
    await this.spendAction(data.actionType);
    const offensive = this.system.stats[data.offensiveStat].value;
    const roll = await new Roll(`1d100 + ${offensive}`).evaluate();
    const die = roll.dice[0].total;
    let digit = die % 10;
    if (digit === 0) digit = 10;
    const damageStatLevel = this.derived.stats[data.damageStat].level;
    const baseDamage = Math.floor(damageStatLevel * data.damageFactor);
    const rawDamage = baseDamage + digit;
    const targets = Array.from(game.user.targets);
    const results = [];
    for (const target of targets) {
      const targetActor = target.actor;
      const defense = targetActor.system.stats[data.defensiveStat].value;
      const threshold = data.difficulty + defense;
      let hit = roll.total > threshold;
      if (data.effect === "heal") hit = true;
      if (data.effect === "revive") hit = true;
      let finalDamage = 0;
      let finalHealing = 0;
      let appliedEffects = [];
      let elementResult = "normal";
      if (hit) {
        if (data.effect === "heal") {
          finalHealing = rawDamage;
          await targetActor.heal(finalHealing);
        }
        if (data.effect === "revive") {
          finalHealing = rawDamage;
          await targetActor.restoreHp(finalHealing);
        }
        if (data.effect === "damage") {
          const resolved = this.resolveDamage(targetActor, rawDamage, data.damageType, data.element);
          finalDamage = resolved.damage;
          finalHealing = resolved.healing;
          elementResult = resolved.elementResult;
          if (finalDamage > 0) await targetActor.applyDamage(finalDamage);
          if (finalHealing > 0) await targetActor.heal(finalHealing);
        }
        if (action.item) {
          appliedEffects = await targetActor.applyItemEffects(action.item);
        }
      }
      results.push({
        actorId: targetActor.id,
        tokenId: target.id,
        name: target.name,
        defense,
        threshold,
        hit,
        finalDamage,
        finalHealing,
        effect: data.effect,
        appliedEffects,
        elementResult
      });
    }
    const content = await renderTemplate("systems/ffrpg4e-homebrew-foundry/templates/chat/combat-roll.hbs", {
      actor: this,
      action,
      rollTotal: roll.total,
      die,
      digit,
      baseDamage,
      rawDamage,
      targets: results,
      data,
      stats: CONFIG.FFRPG4E.stats,
      elements: CONFIG.FFRPG4E.elements,
      damageTypes: CONFIG.FFRPG4E.damageTypes,
      elementAffinities: CONFIG.FFRPG4E.elementAffinities,
      effectButton: action.item && action.item.effects.size > 0,
      rewardButton: targets.length > 0
    });
    const message = await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: action.name,
      content,
      flags: {
        "ffrpg4e-homebrew-foundry": {
          combatAction: {
            actorId: this.id,
            itemUuid: action.item?.uuid,
            targets: results,
            reward: this.combatReward()
          }
        }
      }
    });
    return message;
  }

  resolveDamage(targetActor, rawDamage, damageType, element) {
    const elementResult = targetActor.system.elements[element];
    if (elementResult === "absorb") return { damage: 0, healing: rawDamage, elementResult };
    if (elementResult === "immune") return { damage: 0, healing: 0, elementResult };
    let mitigation = 0;
    if (damageType === "physical") mitigation = targetActor.derived.arm;
    if (damageType === "magical") mitigation = targetActor.derived.marm;
    let damage = rawDamage - mitigation;
    if (elementResult === "weak") damage = Math.ceil(damage * 1.5);
    if (elementResult === "resist") damage = Math.floor(damage / 2);
    if (damage < 1 && rawDamage > 0) damage = 1;
    if (damage < 0) damage = 0;
    return { damage, healing: 0, elementResult };
  }

  calculateFinalDamage(targetActor, rawDamage, damageType) {
    return this.resolveDamage(targetActor, rawDamage, damageType, "cut").damage;
  }

  async spendAction(actionType) {
    const actions = this.system.combat.actions;
    const updates = {};
    if (actionType === "free") return true;
    if (actionType === "reaction") {
      updates["system.combat.actions.reactionUsed"] = true;
    }
    if (actionType === "quick") {
      updates["system.combat.actions.quickUsed"] = true;
    }
    if (actionType === "slow") {
      updates["system.combat.actions.quickUsed"] = true;
      updates["system.combat.actions.slowUsed"] = true;
    }
    if (Object.keys(updates).length > 0) await this.update(updates);
    return true;
  }

  canUseAction(actionType) {
    const actions = this.system.combat.actions;
    if (actionType === "free") return true;
    if (actionType === "reaction" && actions.reactionUsed) {
      ui.notifications.warn("Reaction already used.");
      return false;
    }
    if (actionType === "quick" && actions.quickUsed) {
      ui.notifications.warn("Quick action already used.");
      return false;
    }
    if (actionType === "slow" && (actions.quickUsed || actions.slowUsed)) {
      ui.notifications.warn("Slow action requires unused quick and slow actions.");
      return false;
    }
    return true;
  }

  async resetTurnActions() {
    await this.update({
      "system.combat.actions.quickUsed": false,
      "system.combat.actions.slowUsed": false,
      "system.combat.actions.reactionUsed": false
    });
  }

  async spendResources(data) {
    if (data.hpCost > this.system.resources.hp.value) {
      ui.notifications.warn("Not enough HP.");
      return false;
    }
    if (data.mpCost > this.system.resources.mp.value) {
      ui.notifications.warn("Not enough MP.");
      return false;
    }
    const updates = {};
    if (data.hpCost > 0) updates["system.resources.hp.value"] = Math.max(0, this.system.resources.hp.value - data.hpCost);
    if (data.mpCost > 0) updates["system.resources.mp.value"] = Math.max(0, this.system.resources.mp.value - data.mpCost);
    if (Object.keys(updates).length > 0) await this.update(updates);
    return true;
  }

  async applyJobResources() {
    if (!this.derived.primaryJob) {
      ui.notifications.warn("Choose a primary job first.");
      return;
    }
    if (!this.derived.secondaryJob) {
      ui.notifications.warn("Choose a secondary job first.");
      return;
    }
    await this.update({
      "system.resources.hp.max": this.derived.hpMax,
      "system.resources.hp.value": this.derived.hpMax,
      "system.resources.mp.max": this.derived.mpMax,
      "system.resources.mp.value": this.derived.mpMax
    });
  }

  async applyDamage(amount) {
    const hp = Math.max(0, this.system.resources.hp.value - amount);
    const updates = { "system.resources.hp.value": hp };
    if (hp === 0) updates["system.combat.defeated"] = true;
    await this.update(updates);
    if (hp === 0) await this.setCombatDefeated(true);
  }

  async heal(amount) {
    const hp = Math.min(this.system.resources.hp.max, this.system.resources.hp.value + amount);
    const updates = { "system.resources.hp.value": hp };
    if (hp > 0) updates["system.combat.defeated"] = false;
    await this.update(updates);
    if (hp > 0) await this.setCombatDefeated(false);
  }

  async restoreHp(amount) {
    const hp = Math.min(this.system.resources.hp.max, Math.max(1, amount));
    await this.update({
      "system.resources.hp.value": hp,
      "system.combat.defeated": false
    });
    await this.setCombatDefeated(false);
  }

  async setCombatDefeated(defeated) {
    const combatants = game.combat?.combatants.filter((combatant) => combatant.actor?.id === this.id) || [];
    for (const combatant of combatants) {
      await combatant.update({ defeated });
    }
  }

  async applyItemEffects(item) {
    const effects = Array.from(item.effects).map((effect) => effect.toObject());
    const applied = [];
    for (const effect of effects) {
      const sourceKey = effect.flags?.["ffrpg4e-homebrew-foundry"]?.sourceKey;
      const existing = this.effects.find((candidate) => candidate.getFlag("ffrpg4e-homebrew-foundry", "sourceKey") === sourceKey);
      effect.origin = item.uuid;
      if (existing) {
        delete effect._id;
        await existing.update(effect);
      } else {
        await this.createEmbeddedDocuments("ActiveEffect", [effect]);
      }
      applied.push(effect.name);
    }
    return applied;
  }

  combatReward() {
    return {
      gil: this.system.gil,
      exp: this.system.combat.rewards.exp,
      ap: this.system.combat.rewards.ap
    };
  }

  async runAiTurn() {
    const targets = canvas.tokens.placeables.filter((token) => token.actor?.type === "character" && !token.actor.system.combat.defeated);
    const target = targets[0];
    if (!target) return;
    game.user.updateTokenTargets([target.id]);
    const usable = this.items.find((item) => ["ability", "spell"].includes(item.type)) || this.items.find((item) => item.type === "equipment" && item.system.slot === "weapon");
    if (usable) await this.rollItem(usable.id);
    if (!usable) {
      await this.rollCombatAction({
        name: "Natural Attack",
        data: {
          actionType: "quick",
          offensiveStat: "earth",
          defensiveStat: "earth",
          difficulty: 40,
          effect: "damage",
          mpCost: 0,
          hpCost: 0,
          damageFactor: Math.max(1, Math.floor(this.derived.level / 2)),
          damageStat: "earth",
          damageType: "physical",
          element: "crush"
        }
      });
    }
  }

  static async collectCombatRewards(message) {
    const data = message.getFlag("ffrpg4e-homebrew-foundry", "combatAction");
    if (data.rewardsCollected) {
      ui.notifications.warn("Rewards already collected.");
      return;
    }
    const targets = data.targets.filter((target) => target.hit);
    const rewards = targets.reduce((total, target) => {
      const actor = game.actors.get(target.actorId);
      if (!actor?.system.combat.defeated) return total;
      total.gil += actor.system.gil;
      total.exp += actor.system.combat.rewards.exp;
      total.ap += actor.system.combat.rewards.ap;
      return total;
    }, { gil: 0, exp: 0, ap: 0 });
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker(),
      content: `<div class="ffrpg4e-chat"><h2>Combat Rewards</h2><p>${rewards.gil} gil, ${rewards.exp} EXP, ${rewards.ap} AP.</p></div>`
    });
    await message.setFlag("ffrpg4e-homebrew-foundry", "combatAction", { ...data, rewardsCollected: true });
  }

  static async applyMessageEffects(message) {
    const data = message.getFlag("ffrpg4e-homebrew-foundry", "combatAction");
    const item = await fromUuid(data.itemUuid);
    const targets = data.targets.filter((target) => target.hit);
    for (const target of targets) {
      const actor = game.actors.get(target.actorId);
      await actor.applyItemEffects(item);
    }
    ui.notifications.info("Applied combat effects.");
  }
}

export class FFRPGItem extends Item {
  async roll() {
    const actor = this.actor;
    if (!actor) return;
    await actor.rollItem(this.id);
  }
}
