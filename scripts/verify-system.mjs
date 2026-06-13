import fs from "node:fs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function flattenObject(object) {
  const result = {};
  function visit(value, path) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [key, child] of Object.entries(value)) visit(child, path ? `${path}.${key}` : key);
      return;
    }
    result[path] = value;
  }
  visit(object, "");
  return result;
}

globalThis.foundry = {
  applications: {
    sheets: {
      ActorSheetV2: class {},
      ItemSheetV2: class {}
    },
    api: {
      HandlebarsApplicationMixin: Base => class extends Base {}
    }
  },
  utils: {
    flattenObject,
    expandObject(object) {
      const expanded = {};
      for (const [key, value] of Object.entries(object)) {
        if (!key) continue;
        const parts = key.split(".");
        let target = expanded;
        while (parts.length > 1) {
          const part = parts.shift();
          target = target[part] ??= {};
        }
        target[parts[0]] = value;
      }
      return expanded;
    }
  }
};

async function verifySheetSubmits() {
  const { FFRPGActorSheet } = await import("../module/sheets/actor-sheet.mjs");
  const { FFRPGItemSheet } = await import("../module/sheets/item-sheet.mjs");
  const createdItems = [];
  const deletedItems = [];
  const itemUpdates = [];
  globalThis.game = {
    items: {
      filter() {
        return [];
      }
    },
    packs: {
      get(key) {
        const entries = {
          "ffrpg4e-homebrew-foundry.ff6-spells": [{ _id: "fire", name: "Fire", type: "spell" }],
          "ffrpg4e-homebrew-foundry.homebrew-abilities": [{ _id: "jump", name: "Jump", type: "ability" }],
          "ffrpg4e-homebrew-foundry.ff6-equipment": [{ _id: "dirk", name: "Dirk", type: "equipment" }],
          "ffrpg4e-homebrew-foundry.homebrew-jobs": [{ _id: "warrior", name: "Warrior", type: "job" }]
        };
        return {
          collection: key,
          async getIndex() {
            return entries[key];
          }
        };
      }
    },
    user: {
      isGM: true
    }
  };
  globalThis.fromUuid = async (uuid) => ({
    uuid,
    toObject() {
      return {
        _id: "world-spell",
        name: "Fire",
        type: "spell",
        system: {}
      };
    }
  });
  const actorSubmit = FFRPGActorSheet.prototype._processFormData.call({
    document: {
      type: "character"
    }
  }, null, null, {
    object: {
      name: "Zane Greyford",
      "roll.skill": "acrobatics",
      "roll.difficulty": 30,
      "system.level": 7,
      "system.gil": 25,
      "system.combat.actions.quickUsed": true,
      "manage.itemId": "abc123",
      undefined: "invalid"
    }
  });
  const itemSubmit = FFRPGItemSheet.prototype._processFormData.call({
    document: {
      type: "equipment"
    }
  }, null, null, {
    object: {
      name: "Dagger",
      "system.cost": 150,
      undefined: "invalid"
    }
  });
  const availableItems = await FFRPGActorSheet.prototype.getAvailableItems({
    job: "Job",
    ability: "Ability",
    spell: "Spell",
    equipment: "Equipment"
  });
  await FFRPGActorSheet.prototype.onAction.call({
    element: {
      querySelector() {
        return { value: "Compendium.ffrpg4e-homebrew-foundry.ff6-spells.fire" };
      }
    },
    actor: {
      createEmbeddedDocuments(type, items) {
        createdItems.push({ type, items });
      },
      deleteEmbeddedDocuments(type, ids) {
        deletedItems.push({ type, ids });
      }
    }
  }, {
    preventDefault() {},
    currentTarget: {
      dataset: {
        action: "add-owned-item",
        itemType: "spell"
      }
    }
  });
  await FFRPGActorSheet.prototype.onAction.call({
    element: {},
    actor: {
      items: {
        get() {
          return {
            system: { quantity: 2 },
            update(update) {
              itemUpdates.push(update);
            }
          };
        }
      }
    }
  }, {
    preventDefault() {},
    currentTarget: {
      dataset: {
        action: "increase-owned-item",
        itemId: "owned-spell"
      }
    }
  });
  await FFRPGActorSheet.prototype.onAction.call({
    element: {},
    actor: {
      items: {
        get() {
          return {
            system: { quantity: 2 },
            update(update) {
              itemUpdates.push(update);
            }
          };
        }
      }
    }
  }, {
    preventDefault() {},
    currentTarget: {
      dataset: {
        action: "decrease-owned-item",
        itemId: "owned-spell"
      }
    }
  });
  await FFRPGActorSheet.prototype.onAction.call({
    element: {},
    actor: {
      createEmbeddedDocuments(type, items) {
        createdItems.push({ type, items });
      },
      deleteEmbeddedDocuments(type, ids) {
        deletedItems.push({ type, ids });
      }
    }
  }, {
    preventDefault() {},
    currentTarget: {
      dataset: {
        action: "remove-owned-item",
        itemId: "owned-spell"
      }
    }
  });
  assert(!Object.hasOwn(actorSubmit, "roll"), "Actor submit leaked roll fields.");
  assert(!Object.hasOwn(actorSubmit, "manage"), "Actor submit leaked management fields.");
  assert(!Object.hasOwn(actorSubmit, "undefined"), "Actor submit leaked undefined key.");
  assert(!Object.hasOwn(itemSubmit, "undefined"), "Item submit leaked undefined key.");
  assert(actorSubmit.system.level === 7, "Actor level update missing.");
  assert(actorSubmit.system.combat.defeated === false, "Actor KO checkbox default missing.");
  assert(actorSubmit.system.combat.actions.slowUsed === false, "Actor slow checkbox default missing.");
  assert(actorSubmit.system.combat.actions.reactionUsed === false, "Actor reaction checkbox default missing.");
  assert(itemSubmit.system.equipped === false, "Equipment checkbox default missing.");
  assert(availableItems.spell[0].uuid === "Compendium.ffrpg4e-homebrew-foundry.ff6-spells.fire", "Spell compendium option missing.");
  assert(availableItems.ability[0].uuid === "Compendium.ffrpg4e-homebrew-foundry.homebrew-abilities.jump", "Ability compendium option missing.");
  assert(availableItems.equipment[0].uuid === "Compendium.ffrpg4e-homebrew-foundry.ff6-equipment.dirk", "Equipment compendium option missing.");
  assert(availableItems.job[0].uuid === "Compendium.ffrpg4e-homebrew-foundry.homebrew-jobs.warrior", "Job compendium option missing.");
  assert(createdItems[0].type === "Item", "Add owned item did not create embedded Item.");
  assert(!Object.hasOwn(createdItems[0].items[0], "_id"), "Add owned item kept source item id.");
  assert(createdItems[0].items[0].system.quantity === 1, "Add owned item did not set quantity.");
  assert(itemUpdates[0]["system.quantity"] === 3, "Increase owned item did not update quantity.");
  assert(itemUpdates[1]["system.quantity"] === 1, "Decrease owned item did not update quantity.");
  assert(deletedItems[0].type === "Item", "Remove owned item did not delete embedded Item.");
  assert(deletedItems[0].ids[0] === "owned-spell", "Remove owned item used wrong id.");
  return { actorSubmit, itemSubmit, availableItems, createdItems, deletedItems, itemUpdates };
}

function verifyPacks() {
  const system = JSON.parse(fs.readFileSync("system.json", "utf8"));
  const sourceKeys = new Set();
  const ids = new Set();
  const result = {
    missing: [],
    badJson: [],
    duplicateSourceKeys: [],
    duplicateIds: [],
    packs: system.packs.length,
    total: 0
  };
  for (const pack of system.packs) {
    if (!fs.existsSync(pack.path)) {
      result.missing.push(pack.path);
      continue;
    }
    const lines = fs.readFileSync(pack.path, "utf8").trim().split(/\r?\n/).filter(Boolean);
    result.total += lines.length;
    for (let index = 0; index < lines.length; index += 1) {
      let doc;
      try {
        doc = JSON.parse(lines[index]);
      } catch {
        result.badJson.push(`${pack.path}:${index + 1}`);
        continue;
      }
      const idKey = `${pack.name}.${doc._id}`;
      if (ids.has(idKey)) result.duplicateIds.push(idKey);
      ids.add(idKey);
      const sourceKey = doc.flags?.["ffrpg4e-homebrew-foundry"]?.sourceKey;
      if (sourceKey) {
        if (sourceKeys.has(sourceKey)) result.duplicateSourceKeys.push(sourceKey);
        sourceKeys.add(sourceKey);
      }
    }
  }
  assert(result.missing.length === 0, "Missing pack files.");
  assert(result.badJson.length === 0, "Invalid pack JSON.");
  assert(result.duplicateIds.length === 0, "Duplicate pack ids.");
  assert(result.duplicateSourceKeys.length === 0, "Duplicate source keys.");
  return result;
}

function verifyTemplates() {
  const actorTemplate = fs.readFileSync("templates/actor/actor-sheet.hbs", "utf8");
  const enabledNameless = [...actorTemplate.matchAll(/<(input|select|textarea)\b(?=[^>]*)(?![^>]*\bdisabled\b)(?![^>]*\bname=)[^>]*>/g)].map(match => match[0]).filter(field => !field.includes("data-roll-"));
  const rollNamedFields = [...actorTemplate.matchAll(/name="roll\.[^"]+"/g)].map(match => match[0]);
  const levelInput = actorTemplate.includes('name="system.level"');
  const portraitEdit = actorTemplate.includes('data-edit="img"');
  const summaryEnd = actorTemplate.indexOf("<h2>Challenge</h2>");
  const summaryMarkup = actorTemplate.slice(0, summaryEnd);
  const summaryFields = [...summaryMarkup.matchAll(/<(input|select|textarea)\b[^>]*>/g)].map(match => match[0]);
  const requiredActorText = [
    "Vitals",
    "Actions",
    "Secondary Optional",
    "Add Owned",
    "Add Spell",
    "Add Item",
    "Jobs Owned",
    "Abilities Owned",
    "Spells Owned",
    "Equipment Owned",
    "Other Items Owned",
    "Edit Identity",
    "Edit Jobs",
    "Edit Resources"
  ];
  const missingActorText = requiredActorText.filter(text => !actorTemplate.includes(text));
  assert(enabledNameless.length === 0, `Enabled nameless actor fields: ${enabledNameless.join(", ")}`);
  assert(rollNamedFields.length === 0, `Named roll fields: ${rollNamedFields.join(", ")}`);
  assert(summaryFields.length === 0, `Summary contains editable fields: ${summaryFields.join(", ")}`);
  assert(levelInput, "Actor sheet has no editable level input.");
  assert(!portraitEdit, "Actor sheet still edits actor portrait.");
  assert(!actorTemplate.includes("Homebrew Class List"), "Actor sheet still contains Homebrew Class List.");
  assert(missingActorText.length === 0, `Actor sheet missing sections: ${missingActorText.join(", ")}`);
  return {
    actorEnabledNamelessFields: enabledNameless.length,
    actorNamedRollFields: rollNamedFields.length,
    actorSummaryFields: summaryFields.length,
    actorLevelInput: levelInput,
    actorInventorySections: requiredActorText.length
  };
}

function verifyPlayablePortraits() {
  const missing = [];
  const actors = fs.readFileSync("packs/ff6-playable-characters.db", "utf8").trim().split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
  for (const actor of actors) {
    const portrait = actor.img;
    const token = actor.prototypeToken?.texture?.src;
    if (!portrait.startsWith("systems/ffrpg4e-homebrew-foundry/assets/portraits/player-characters/")) missing.push(`${actor.name}: ${portrait}`);
    const path = portrait.replace("systems/ffrpg4e-homebrew-foundry/", "");
    if (!fs.existsSync(path)) missing.push(`${actor.name}: missing ${path}`);
    if (token !== portrait) missing.push(`${actor.name}: token ${token}`);
  }
  assert(missing.length === 0, `Playable portrait issues: ${missing.join(", ")}`);
  return {
    playableActors: actors.length
  };
}

const result = {
  sheets: await verifySheetSubmits(),
  packs: verifyPacks(),
  templates: verifyTemplates(),
  portraits: verifyPlayablePortraits()
};

console.log(JSON.stringify(result, null, 2));
