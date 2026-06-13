const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class FFRPGActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["ffrpg4e", "sheet", "actor"],
    position: {
      width: 760,
      height: 720
    },
    window: {
      resizable: true
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    }
  };

  static PARTS = {
    form: {
      template: "systems/ffrpg4e-homebrew-foundry/templates/actor/actor-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = this.actor.system;
    const derived = this.actor.derived;
    const jobOptions = Object.entries(CONFIG.FFRPG4E.jobs).map(([key, job]) => ({
      key,
      ...job,
      categoryLabel: CONFIG.FFRPG4E.jobCategories[job.category],
      selectedPrimary: key === system.jobs.primary,
      selectedSecondary: key === system.jobs.secondary
    }));
    const statEntries = Object.entries(CONFIG.FFRPG4E.stats).map(([key, label]) => ({
      key,
      label,
      value: system.stats[key].value,
      level: derived.stats[key].level
    }));
    const skillOptions = Object.entries(CONFIG.FFRPG4E.skills).map(([key, skill]) => ({
      key,
      ...skill,
      statLabel: CONFIG.FFRPG4E.stats[skill.stat],
      value: system.skills[key]
    }));
    const aiOptions = Object.entries(CONFIG.FFRPG4E.aiTypes).map(([key, label]) => ({
      key,
      label,
      selected: key === system.combat.ai
    }));
    const affinityOptions = Object.entries(CONFIG.FFRPG4E.elementAffinities).map(([key, label]) => ({
      key,
      label
    }));
    const elementEntries = Object.entries(CONFIG.FFRPG4E.elements).map(([key, label]) => ({
      key,
      label,
      value: system.elements[key],
      options: affinityOptions.map((option) => ({
        ...option,
        selected: option.key === system.elements[key]
      }))
    }));
    const primaryJob = CONFIG.FFRPG4E.jobs[system.jobs.primary];
    const secondaryJob = CONFIG.FFRPG4E.jobs[system.jobs.secondary];
    const summary = {
      primaryJob: primaryJob ? `${primaryJob.label} - ${CONFIG.FFRPG4E.jobCategories[primaryJob.category]}` : "None",
      secondaryJob: secondaryJob ? `${secondaryJob.label} - ${CONFIG.FFRPG4E.jobCategories[secondaryJob.category]}` : "None",
      ai: CONFIG.FFRPG4E.aiTypes[system.combat.ai],
      quickAction: system.combat.actions.quickUsed ? "Used" : "Ready",
      slowAction: system.combat.actions.slowUsed ? "Used" : "Ready",
      reaction: system.combat.actions.reactionUsed ? "Used" : "Ready",
      status: system.combat.defeated ? "KO" : "Active"
    };
    const itemTypeLabels = {
      job: "Job",
      ability: "Ability",
      spell: "Spell",
      equipment: "Equipment"
    };
    const itemRows = this.actor.items.map((item) => ({
      id: item.id,
      name: item.name,
      img: item.img,
      type: item.type,
      typeLabel: itemTypeLabels[item.type] || item.type,
      system: item.system,
      rollLabel: item.type === "spell" ? "Cast" : item.type === "ability" ? "Roll" : "Use",
      canRoll: ["ability", "spell"].includes(item.type) || (item.type === "equipment" && item.system.slot === "weapon"),
      canEquip: item.type === "equipment",
      equipped: item.type === "equipment" && item.system.equipped
    }));
    const itemOrder = {
      spell: 1,
      ability: 2,
      equipment: 3,
      job: 4
    };
    const availableItems = game.items
      .filter((item) => ["spell", "ability", "equipment", "job"].includes(item.type))
      .map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        label: `${itemTypeLabels[item.type] || item.type} - ${item.name}`
      }))
      .sort((a, b) => (itemOrder[a.type] - itemOrder[b.type]) || a.name.localeCompare(b.name));
    const items = {
      jobs: itemRows.filter((item) => item.type === "job"),
      abilities: itemRows.filter((item) => item.type === "ability"),
      spells: itemRows.filter((item) => item.type === "spell"),
      equipment: itemRows.filter((item) => item.type === "equipment"),
      other: itemRows.filter((item) => !["job", "ability", "spell", "equipment"].includes(item.type)),
      all: itemRows
    };
    return {
      ...context,
      actor: this.actor,
      system,
      derived,
      jobOptions,
      statEntries,
      skillOptions,
      aiOptions,
      elementEntries,
      summary,
      items,
      availableItems,
      canManageItems: game.user.isGM
    };
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    for (const element of this.element.querySelectorAll("[data-action]")) {
      element.addEventListener("click", this.onAction.bind(this));
    }
  }

  async onAction(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const action = button.dataset.action;
    if (action === "roll-challenge") {
      const skill = this.element.querySelector("[data-roll-skill]").value;
      const difficulty = Number(this.element.querySelector("[data-roll-difficulty]").value);
      await this.actor.rollChallenge(skill, difficulty);
    }
    if (action === "roll-initiative") await this.actor.rollInitiativeDice();
    if (action === "basic-attack") await this.actor.rollBasicAttack();
    if (action === "reset-actions") await this.actor.resetTurnActions();
    if (action === "apply-job-resources") await this.actor.applyJobResources();
    if (action === "roll-item") await this.actor.rollItem(button.dataset.itemId);
    if (action === "add-owned-item") {
      const itemId = this.element.querySelector("[data-add-owned-item]").value;
      if (!itemId) return;
      const source = game.items.get(itemId);
      const data = source.toObject();
      delete data._id;
      await this.actor.createEmbeddedDocuments("Item", [data]);
    }
    if (action === "remove-owned-item") {
      await this.actor.deleteEmbeddedDocuments("Item", [button.dataset.itemId]);
    }
    if (action === "toggle-equipped") {
      const item = this.actor.items.get(button.dataset.itemId);
      await item.update({ "system.equipped": !item.system.equipped });
    }
  }

  _processFormData(event, form, formData) {
    const data = { ...formData.object };
    for (const key of Object.keys(data)) {
      if (!key || key === "undefined" || key.startsWith("roll.") || key.startsWith("manage.")) delete data[key];
    }
    const submitData = foundry.utils.expandObject(data);
    submitData.system ??= {};
    submitData.system.combat ??= {};
    submitData.system.combat.actions ??= {};
    if (!("defeated" in submitData.system.combat)) submitData.system.combat.defeated = false;
    if (!("quickUsed" in submitData.system.combat.actions)) submitData.system.combat.actions.quickUsed = false;
    if (!("slowUsed" in submitData.system.combat.actions)) submitData.system.combat.actions.slowUsed = false;
    if (!("reactionUsed" in submitData.system.combat.actions)) submitData.system.combat.actions.reactionUsed = false;
    return submitData;
  }
}
