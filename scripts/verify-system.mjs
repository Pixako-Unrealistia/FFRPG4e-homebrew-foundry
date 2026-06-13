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
  globalThis.game = {
    items: {
      get(id) {
        if (id !== "world-spell") return null;
        return {
          toObject() {
            return {
              _id: "world-spell",
              name: "Fire",
              type: "spell",
              system: {}
            };
          }
        };
      }
    }
  };
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
  await FFRPGActorSheet.prototype.onAction.call({
    element: {
      querySelector() {
        return { value: "world-spell" };
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
        action: "add-owned-item"
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
  assert(createdItems[0].type === "Item", "Add owned item did not create embedded Item.");
  assert(!Object.hasOwn(createdItems[0].items[0], "_id"), "Add owned item kept source item id.");
  assert(deletedItems[0].type === "Item", "Remove owned item did not delete embedded Item.");
  assert(deletedItems[0].ids[0] === "owned-spell", "Remove owned item used wrong id.");
  return { actorSubmit, itemSubmit, createdItems, deletedItems };
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
  const requiredActorText = [
    "Secondary Optional",
    "Add Owned Item",
    "Jobs Owned",
    "Abilities Owned",
    "Spells Owned",
    "Equipment Owned",
    "Other Items Owned"
  ];
  const missingActorText = requiredActorText.filter(text => !actorTemplate.includes(text));
  assert(enabledNameless.length === 0, `Enabled nameless actor fields: ${enabledNameless.join(", ")}`);
  assert(rollNamedFields.length === 0, `Named roll fields: ${rollNamedFields.join(", ")}`);
  assert(levelInput, "Actor sheet has no editable level input.");
  assert(!actorTemplate.includes("Homebrew Class List"), "Actor sheet still contains Homebrew Class List.");
  assert(missingActorText.length === 0, `Actor sheet missing sections: ${missingActorText.join(", ")}`);
  return {
    actorEnabledNamelessFields: enabledNameless.length,
    actorNamedRollFields: rollNamedFields.length,
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
