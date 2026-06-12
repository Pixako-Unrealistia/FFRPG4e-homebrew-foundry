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
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: "Initiative"
    });
    return roll;
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
      await this.rollCombatAction({ name: item.name, data: item.system });
      return;
    }
    if (item.type === "ability") {
      await this.rollCombatAction({ name: item.name, data: item.system });
      return;
    }
    if (item.type === "spell") await this.rollCombatAction({ name: item.name, data: item.system });
  }

  async rollCombatAction(action) {
    const data = action.data;
    const spent = await this.spendResources(data);
    if (!spent) return;
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
          finalDamage = this.calculateFinalDamage(targetActor, rawDamage, data.damageType);
          await targetActor.applyDamage(finalDamage);
        }
      }
      results.push({
        name: target.name,
        defense,
        threshold,
        hit,
        finalDamage,
        finalHealing,
        effect: data.effect
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
      damageTypes: CONFIG.FFRPG4E.damageTypes
    });
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: action.name,
      content
    });
  }

  calculateFinalDamage(targetActor, rawDamage, damageType) {
    let mitigation = 0;
    if (damageType === "physical") mitigation = targetActor.derived.arm;
    if (damageType === "magical") mitigation = targetActor.derived.marm;
    const damage = rawDamage - mitigation;
    if (damage < 1 && rawDamage > 0) return 1;
    if (damage < 0) return 0;
    return damage;
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
    await this.update({ "system.resources.hp.value": hp });
  }

  async heal(amount) {
    const hp = Math.min(this.system.resources.hp.max, this.system.resources.hp.value + amount);
    await this.update({ "system.resources.hp.value": hp });
  }

  async restoreHp(amount) {
    const hp = Math.min(this.system.resources.hp.max, Math.max(1, amount));
    await this.update({ "system.resources.hp.value": hp });
  }
}

export class FFRPGItem extends Item {
  async roll() {
    const actor = this.actor;
    if (!actor) return;
    await actor.rollItem(this.id);
  }
}
