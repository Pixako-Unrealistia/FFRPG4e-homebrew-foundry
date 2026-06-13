const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class FFRPGItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["ffrpg4e", "sheet", "item"],
    position: {
      width: 620,
      height: 640
    },
    window: {
      resizable: true
    },
    form: {
      handler: FFRPGItemSheet.onSubmit,
      submitOnChange: true,
      closeOnSubmit: false
    }
  };

  static PARTS = {
    form: {
      template: "systems/ffrpg4e-homebrew-foundry/templates/item/item-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = this.item.system;
    const jobOptions = Object.entries(CONFIG.FFRPG4E.jobs).map(([key, job]) => ({
      key,
      ...job,
      selected: key === system.job
    }));
    const categoryOptions = Object.entries(CONFIG.FFRPG4E.jobCategories).map(([key, label]) => ({
      key,
      label,
      selected: key === system.category
    }));
    const selectOptions = (source, selected) => Object.entries(source).map(([key, label]) => ({ key, label, selected: key === selected }));
    return {
      ...context,
      system,
      jobOptions,
      categoryOptions,
      statOptions: selectOptions(CONFIG.FFRPG4E.stats, system.stat),
      weaponStatOptions: selectOptions(CONFIG.FFRPG4E.stats, system.weaponStat),
      defenseStatOptions: selectOptions(CONFIG.FFRPG4E.stats, system.defenseStat),
      offensiveStatOptions: selectOptions(CONFIG.FFRPG4E.stats, system.offensiveStat),
      defensiveStatOptions: selectOptions(CONFIG.FFRPG4E.stats, system.defensiveStat),
      damageStatOptions: selectOptions(CONFIG.FFRPG4E.stats, system.damageStat),
      actionTypeOptions: selectOptions(CONFIG.FFRPG4E.actionTypes, system.actionType),
      effectOptions: selectOptions(CONFIG.FFRPG4E.effects, system.effect),
      damageTypeOptions: selectOptions(CONFIG.FFRPG4E.damageTypes, system.damageType),
      elementOptions: selectOptions(CONFIG.FFRPG4E.elements, system.element),
      equipmentSlotOptions: selectOptions(CONFIG.FFRPG4E.equipmentSlots, system.slot),
      isJob: this.item.type === "job",
      isAbility: this.item.type === "ability",
      isSpell: this.item.type === "spell",
      isEquipment: this.item.type === "equipment"
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
    const action = event.currentTarget.dataset.action;
    if (action === "roll-item") await this.item.roll();
  }

  static async onSubmit(event, form, formData) {
    const data = foundry.utils.flattenObject(formData.object);
    for (const key of Object.keys(data)) {
      if (!key || key === "undefined") delete data[key];
    }
    if (this.document.type === "equipment" && !Object.hasOwn(data, "system.equipped")) data["system.equipped"] = false;
    await this.document.update(data);
  }
}
