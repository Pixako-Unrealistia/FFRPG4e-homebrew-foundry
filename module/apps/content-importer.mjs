import { buildWorldContent, CONTENT_VERSION, getPackSourceCounts, importActorPackSourcesToWorld, importPackSourcesToWorld, seedWorldContent } from "../content.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class FFRPGContentImporter extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "ffrpg4e-content-importer",
    tag: "form",
    classes: ["ffrpg4e-importer-app"],
    position: {
      width: 460
    },
    window: {
      title: "FFRPG 4e Content Importer",
      resizable: true
    }
  };

  static PARTS = {
    form: {
      template: "systems/ffrpg4e-homebrew-foundry/templates/apps/content-importer.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const items = buildWorldContent();
    const counts = items.reduce((result, item) => {
      if (!result[item.type]) result[item.type] = 0;
      result[item.type] += 1;
      return result;
    }, {});
    const packCounts = await getPackSourceCounts();
    return {
      ...context,
      contentVersion: CONTENT_VERSION,
      worldVersion: game.settings.get("ffrpg4e-homebrew-foundry", "contentVersion"),
      total: items.length,
      counts,
      packCounts
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
    try {
      if (action === "import-content") await this.importContent();
      if (action === "import-actors") await this.importActors();
      if (action === "import-packs") await this.importPacks();
    } catch (error) {
      console.error(error);
      ui.notifications.error(error.message);
    }
  }

  async importContent() {
    ui.notifications.info("Importing FFRPG item seeds.");
    const result = await seedWorldContent({ force: true, actors: false, macros: false });
    if (result) ui.notifications.info(`Imported ${result.total} item seeds.`);
    await this.render();
  }

  async importPacks() {
    ui.notifications.info("Importing FFRPG pack sources.");
    const result = await importPackSourcesToWorld();
    if (result) ui.notifications.info("Imported FFRPG pack sources.");
    await this.render();
  }

  async importActors() {
    ui.notifications.info("Importing FFRPG actors.");
    const result = await importActorPackSourcesToWorld();
    if (result) ui.notifications.info("Imported FFRPG actors.");
    await this.render();
  }
}
