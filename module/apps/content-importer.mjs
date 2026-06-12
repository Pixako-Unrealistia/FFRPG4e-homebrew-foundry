import { buildWorldContent, CONTENT_VERSION, getPackSourceCounts, importPackSourcesToWorld, seedWorldContent } from "../content.mjs";

export class FFRPGContentImporter extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "ffrpg4e-content-importer",
      title: "FFRPG 4e Content Importer",
      template: "systems/ffrpg4e-homebrew-foundry/templates/apps/content-importer.hbs",
      width: 420,
      closeOnSubmit: false,
      submitOnChange: false,
      submitOnClose: false
    });
  }

  async getData(options) {
    const items = buildWorldContent();
    const counts = items.reduce((result, item) => {
      if (!result[item.type]) result[item.type] = 0;
      result[item.type] += 1;
      return result;
    }, {});
    const packCounts = await getPackSourceCounts();
    return {
      contentVersion: CONTENT_VERSION,
      worldVersion: game.settings.get("ffrpg4e-homebrew-foundry", "contentVersion"),
      total: items.length,
      counts,
      packCounts
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find("[data-action='import-content']").on("click", this.importContent.bind(this));
    html.find("[data-action='import-packs']").on("click", this.importPacks.bind(this));
  }

  async importContent(event) {
    event.preventDefault();
    const result = await seedWorldContent({ force: true });
    if (result) this.render();
  }

  async importPacks(event) {
    event.preventDefault();
    const result = await importPackSourcesToWorld();
    if (result) this.render();
  }

  async _updateObject(event, formData) {}
}
