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
      handler: FFRPGActorSheet.onSubmit,
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
    const categories = Object.entries(CONFIG.FFRPG4E.jobCategories).map(([key, label]) => ({
      key,
      label,
      jobs: jobOptions.filter((job) => job.category === key)
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
    const items = {
      abilities: this.actor.items.filter((item) => item.type === "ability"),
      spells: this.actor.items.filter((item) => item.type === "spell"),
      equipment: this.actor.items.filter((item) => item.type === "equipment")
    };
    return {
      ...context,
      system,
      derived,
      jobOptions,
      categories,
      statEntries,
      skillOptions,
      aiOptions,
      elementEntries,
      items
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
      const skill = this.element.querySelector("[name='roll.skill']").value;
      const difficulty = Number(this.element.querySelector("[name='roll.difficulty']").value);
      await this.actor.rollChallenge(skill, difficulty);
    }
    if (action === "roll-initiative") await this.actor.rollInitiativeDice();
    if (action === "basic-attack") await this.actor.rollBasicAttack();
    if (action === "reset-actions") await this.actor.resetTurnActions();
    if (action === "apply-job-resources") await this.actor.applyJobResources();
    if (action === "roll-item") await this.actor.rollItem(button.dataset.itemId);
    if (action === "toggle-equipped") {
      const item = this.actor.items.get(button.dataset.itemId);
      await item.update({ "system.equipped": !item.system.equipped });
    }
  }

  static async onSubmit(event, form, formData) {
    const data = foundry.utils.flattenObject(formData.object);
    for (const key of Object.keys(data)) {
      if (!key || key === "undefined" || key.startsWith("roll.")) delete data[key];
    }
    for (const key of ["system.combat.defeated", "system.combat.actions.quickUsed", "system.combat.actions.slowUsed", "system.combat.actions.reactionUsed"]) {
      if (!Object.hasOwn(data, key)) data[key] = false;
    }
    await this.document.update(data);
  }
}
