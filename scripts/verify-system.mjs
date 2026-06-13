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
    flattenObject
  }
};

async function verifySheetSubmits() {
  const { FFRPGActorSheet } = await import("../module/sheets/actor-sheet.mjs");
  const { FFRPGItemSheet } = await import("../module/sheets/item-sheet.mjs");
  let actorUpdate = null;
  await FFRPGActorSheet.onSubmit.call({
    document: {
      update(data) {
        actorUpdate = data;
      }
    }
  }, null, null, {
    object: {
      name: "Zane Greyford",
      roll: {
        skill: "acrobatics",
        difficulty: 30
      },
      system: {
        gil: 25,
        combat: {
          actions: {
            quickUsed: true
          }
        }
      },
      undefined: "invalid"
    }
  });
  let itemUpdate = null;
  await FFRPGItemSheet.onSubmit.call({
    document: {
      type: "equipment",
      update(data) {
        itemUpdate = data;
      }
    }
  }, null, null, {
    object: {
      name: "Dagger",
      system: {
        cost: 150
      },
      undefined: "invalid"
    }
  });
  assert(!Object.keys(actorUpdate).some(key => key.startsWith("roll.")), "Actor submit leaked roll fields.");
  assert(!Object.hasOwn(actorUpdate, "undefined"), "Actor submit leaked undefined key.");
  assert(!Object.hasOwn(itemUpdate, "undefined"), "Item submit leaked undefined key.");
  assert(actorUpdate["system.combat.defeated"] === false, "Actor KO checkbox default missing.");
  assert(actorUpdate["system.combat.actions.slowUsed"] === false, "Actor slow checkbox default missing.");
  assert(actorUpdate["system.combat.actions.reactionUsed"] === false, "Actor reaction checkbox default missing.");
  assert(itemUpdate["system.equipped"] === false, "Equipment checkbox default missing.");
  return { actorUpdate, itemUpdate };
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
  const enabledNameless = [...actorTemplate.matchAll(/<(input|select|textarea)\b(?=[^>]*)(?![^>]*\bdisabled\b)(?![^>]*\bname=)[^>]*>/g)].map(match => match[0]);
  assert(enabledNameless.length === 0, `Enabled nameless actor fields: ${enabledNameless.join(", ")}`);
  return {
    actorEnabledNamelessFields: enabledNameless.length
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
