import { FFRPG4E } from "./module/config.mjs";
import { registerContentSettings, seedWorldContent } from "./module/content.mjs";
import { CharacterDataModel, NpcDataModel, JobDataModel, AbilityDataModel, SpellDataModel, EquipmentDataModel } from "./module/data-models.mjs";
import { FFRPGActor, FFRPGItem } from "./module/documents.mjs";
import { FFRPGActorSheet } from "./module/sheets/actor-sheet.mjs";
import { FFRPGItemSheet } from "./module/sheets/item-sheet.mjs";

Hooks.once("init", () => {
  registerContentSettings();
  CONFIG.FFRPG4E = FFRPG4E;
  CONFIG.Actor.documentClass = FFRPGActor;
  CONFIG.Item.documentClass = FFRPGItem;
  CONFIG.Actor.dataModels.character = CharacterDataModel;
  CONFIG.Actor.dataModels.npc = NpcDataModel;
  CONFIG.Item.dataModels.job = JobDataModel;
  CONFIG.Item.dataModels.ability = AbilityDataModel;
  CONFIG.Item.dataModels.spell = SpellDataModel;
  CONFIG.Item.dataModels.equipment = EquipmentDataModel;
  CONFIG.Actor.trackableAttributes = {
    character: {
      bar: ["resources.hp", "resources.mp"],
      value: ["level", "stats.earth.value", "stats.air.value", "stats.fire.value", "stats.water.value", "combat.arm", "combat.marm"]
    },
    npc: {
      bar: ["resources.hp", "resources.mp"],
      value: ["level", "stats.earth.value", "stats.air.value", "stats.fire.value", "stats.water.value", "combat.arm", "combat.marm"]
    }
  };
  foundry.documents.collections.Actors.registerSheet("ffrpg4e-homebrew-foundry", FFRPGActorSheet, {
    types: ["character", "npc"],
    makeDefault: true
  });
  foundry.documents.collections.Items.registerSheet("ffrpg4e-homebrew-foundry", FFRPGItemSheet, {
    types: ["job", "ability", "spell", "equipment"],
    makeDefault: true
  });
});

Hooks.once("ready", async () => {
  await seedWorldContent();
});
