import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { FFRPG4E } from "../module/config.mjs";
import { buildWorldContent } from "../module/content.mjs";

const root = process.cwd();
const cache = path.join(root, "reference-cache");
const packs = path.join(root, "packs");
const systemId = "ffrpg4e-homebrew-foundry";

const playableNames = new Set([
  "Terra Branford",
  "Locke Cole",
  "Edgar Roni Figaro",
  "Sabin Rene Figaro",
  "Celes Chere",
  "Cyan Garamonde",
  "Gau",
  "Setzer Gabbiani",
  "Shadow",
  "Strago Magus",
  "Relm Arrowny",
  "Mog",
  "Gogo",
  "Umaro"
]);

const playablePortraits = {
  "Terra Branford": "terra.png",
  "Locke Cole": "locke.png",
  "Edgar Roni Figaro": "edgar.png",
  "Sabin Rene Figaro": "sabin.png",
  "Celes Chere": "celes.png",
  "Cyan Garamonde": "cyan.png",
  Gau: "gau.png",
  "Setzer Gabbiani": "setzer.png",
  Shadow: "shadow.png",
  "Strago Magus": "strago.png",
  "Relm Arrowny": "relm.png",
  Mog: "mog.png",
  Gogo: "gogo.png",
  Umaro: "umaro.png"
};

const extraGuests = [
  { name: "Biggs", job: "magitekPilot", earth: 30, air: 20, fire: 20, water: 10 },
  { name: "Wedge", job: "magitekPilot", earth: 30, air: 20, fire: 20, water: 10 },
  { name: "Ghost", job: "oracle", earth: 10, air: 20, fire: 30, water: 30 },
  { name: "Moogle", job: "dancer", earth: 10, air: 30, fire: 10, water: 20 }
];

const encounterAreas = [
  { name: "Narshe Mines", min: 1, max: 5, terrain: "ice tunnels", tint: "#d9eef2" },
  { name: "Figaro Desert", min: 6, max: 9, terrain: "desert", tint: "#d7bf7a" },
  { name: "South Figaro Cave", min: 10, max: 12, terrain: "cavern", tint: "#6e6254" },
  { name: "Mt. Kolts", min: 13, max: 15, terrain: "mountain trail", tint: "#87916d" },
  { name: "Lete River", min: 16, max: 18, terrain: "river rapids", tint: "#567d9f" },
  { name: "Phantom Forest", min: 19, max: 21, terrain: "haunted woods", tint: "#48684c" },
  { name: "Doma Region", min: 22, max: 24, terrain: "war-torn field", tint: "#827160" },
  { name: "Vector Streets", min: 25, max: 27, terrain: "imperial city", tint: "#777777" },
  { name: "Magitek Factory", min: 28, max: 30, terrain: "factory floor", tint: "#4f5f67" },
  { name: "Sealed Cave", min: 31, max: 33, terrain: "lava cave", tint: "#8a4739" },
  { name: "Floating Continent", min: 34, max: 36, terrain: "broken sky island", tint: "#7a75a1" },
  { name: "Solitary Island", min: 37, max: 39, terrain: "ruined coast", tint: "#687f85" },
  { name: "Serpent Trench", min: 40, max: 42, terrain: "undersea trench", tint: "#355f7a" },
  { name: "Darill's Tomb", min: 43, max: 45, terrain: "sealed tomb", tint: "#5f6470" },
  { name: "Cave on the Veldt", min: 46, max: 48, terrain: "wild cave", tint: "#706a49" },
  { name: "Ancient Castle", min: 49, max: 51, terrain: "buried castle", tint: "#756c83" },
  { name: "Phoenix Cave", min: 52, max: 54, terrain: "split-path cavern", tint: "#9a5d43" },
  { name: "Fanatics' Tower", min: 55, max: 57, terrain: "arcane tower", tint: "#766d9b" },
  { name: "Ebot's Rock", min: 58, max: 60, terrain: "living cave", tint: "#56715c" },
  { name: "Dinosaur Forest", min: 61, max: 63, terrain: "ancient forest", tint: "#3f6b40" },
  { name: "Zone Eater's Belly", min: 64, max: 73, terrain: "warped interior", tint: "#674f71" },
  { name: "Cultists' Domain", min: 74, max: 77, terrain: "ritual hall", tint: "#665a80" },
  { name: "Kefka's Tower Approach", min: 78, max: 83, terrain: "industrial ruin", tint: "#606060" },
  { name: "Kefka's Tower Core", min: 84, max: 255, terrain: "apocalyptic tower", tint: "#724b62" }
];

const statusProfiles = {
  Poison: { icon: "icons/magic/acid/dissolve-drip-droplet-smoke.webp", changes: [] },
  Haste: { icon: "icons/magic/time/arrows-circling-green.webp", changes: [{ key: "system.stats.air.value", mode: 2, value: "10", priority: 20 }] },
  Slow: { icon: "icons/magic/time/hourglass-brown-orange.webp", changes: [{ key: "system.stats.air.value", mode: 2, value: "-10", priority: 20 }] },
  Stop: { icon: "icons/magic/time/clock-spinning-gold-pink.webp", changes: [{ key: "system.stats.air.value", mode: 2, value: "-30", priority: 20 }] },
  Protect: { icon: "icons/magic/defensive/shield-barrier-glowing-blue.webp", changes: [{ key: "system.combat.arm", mode: 2, value: "10", priority: 20 }] },
  Shell: { icon: "icons/magic/defensive/shield-barrier-flaming-diamond-blue.webp", changes: [{ key: "system.combat.marm", mode: 2, value: "10", priority: 20 }] },
  Reflect: { icon: "icons/magic/defensive/barrier-shield-dome-blue-purple.webp", changes: [] },
  Regen: { icon: "icons/magic/life/cross-beam-green.webp", changes: [] },
  Berserk: { icon: "icons/magic/control/buff-strength-muscle-damage-red.webp", changes: [{ key: "system.stats.earth.value", mode: 2, value: "10", priority: 20 }] },
  Imp: { icon: "icons/magic/control/debuff-chains-ropes-purple.webp", changes: [{ key: "system.stats.fire.value", mode: 2, value: "-10", priority: 20 }] },
  Sleep: { icon: "icons/magic/control/silhouette-hold-change-blue.webp", changes: [{ key: "system.stats.air.value", mode: 2, value: "-20", priority: 20 }] },
  Confuse: { icon: "icons/magic/control/hypnosis-mesmerism-eye.webp", changes: [] },
  Vanish: { icon: "icons/magic/air/fog-gas-smoke-dense-gray.webp", changes: [{ key: "system.stats.air.value", mode: 2, value: "10", priority: 20 }] },
  Float: { icon: "icons/magic/air/wind-vortex-swirl-blue.webp", changes: [{ key: "system.stats.air.value", mode: 2, value: "5", priority: 20 }] },
  Reraise: { icon: "icons/magic/life/ankh-gold-blue.webp", changes: [] }
};

const adventureChapters = [
  ["Narshe Opening", "Terra, Biggs, and Wedge break into Narshe and discover the frozen esper."],
  ["Returners And Figaro", "The party reaches Figaro, joins the Returners, and escapes imperial pursuit."],
  ["Three Scenario Split", "The campaign splits across Locke, Terra and Banon, and Sabin."],
  ["Opera And Vector", "The party crosses the Opera House, reaches Vector, and enters the Magitek Factory."],
  ["Sealed Gate And Floating Continent", "Espers break loose and the world changes at the Floating Continent."],
  ["World Of Ruin", "The heroes regroup after the cataclysm and reclaim allies across the ruined world."],
  ["Eight Dragons And Ancient Secrets", "Optional objectives cover the dragons, ancient castle, and hidden relics."],
  ["Kefka's Tower", "The final multi-party assault against Kefka and the Warring Triad."]
];

const shopProfiles = [
  ["Narshe Provisioner", ["Potion", "Sleeping Bag", "Leather Hat", "Leather Armor", "Dirk", "Buckler"]],
  ["Figaro Armory", ["Auto Crossbow", "Noiseblaster", "Mythril Sword", "Mythril Shield", "Plumed Hat", "Leather Armor"]],
  ["South Figaro Market", ["Mythril Knife", "Great Sword", "Metal Knuckle", "Heavy Shield", "Sprint Shoes", "Jeweled Ring"]],
  ["Nikeah Ferry Vendor", ["Dagger", "Cotton Robe", "Plumed Hat", "Potion", "Tent", "Sprint Shoes"]],
  ["Kohlingen Relics", ["Thief's Bracer", "Black Belt", "Barrier Ring", "Mythril Glove", "Fairy Ring", "Jeweled Ring"]],
  ["Jidoor Fine Arms", ["Flametongue", "Icebrand", "Thunder Blade", "Cards", "Silk Robe", "Circlet"]],
  ["Vector Arsenal", ["Drill", "Chainsaw", "Force Armor", "Gold Shield", "Diamond Helm", "Barrier Ring"]],
  ["Thamasa Curios", ["Flame Rod", "Ice Rod", "Thunder Rod", "Magus Hat", "Mystery Veil", "Reflect Ring"]],
  ["Mobliz Relief Stock", ["Cotton Robe", "Green Beret", "Barrier Ring", "Potion", "Phoenix Down", "Tent"]],
  ["Maranda Rebuilt Market", ["Crystal Sword", "Stout Spear", "Kaiser Knuckles", "Diamond Shield", "Diamond Helm", "Guard Bracelet"]],
  ["Kefka's Tower Spoils", ["Ragnarok", "Lightbringer", "Paladin Shield", "Genji Armor", "Soul of Thamasa", "Master's Scroll"]],
  ["Coliseum Prize Board", ["Ultima Weapon", "Fixed Dice", "Snow Scarf", "Minerva Bustier", "Celestriad", "Growth Egg"]]
];

const vehicleProfiles = [
  ["Chocobo", "scout", "Fast overland travel mount.", 160, 20, 20, 60, 20, 30],
  ["Magitek Armor", "magitekPilot", "Imperial walking armor platform.", 500, 120, 70, 30, 80, 40],
  ["Blackjack", "gambler", "Setzer's first airship.", 900, 80, 60, 70, 50, 50],
  ["Falcon", "engineer", "Restored airship for the World of Ruin.", 1200, 100, 80, 80, 60, 60],
  ["Phantom Train", "oracle", "Haunted rail vehicle crossing the spirit world.", 1500, 120, 90, 40, 90, 90]
];

function text(html) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&ndash;/g, "-")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function idFor(value) {
  return crypto.createHash("sha1").update(value).digest("hex").slice(0, 16);
}

function number(value) {
  return Number(String(value).replace(/,/g, ""));
}

function actorSystem(data) {
  return {
    biography: data.biography,
    level: data.level,
    gil: data.gil,
    jobs: {
      primary: data.primary,
      secondary: data.secondary
    },
    resources: {
      hp: {
        value: data.hp,
        max: data.hp
      },
      mp: {
        value: data.mp,
        max: data.mp
      }
    },
    stats: {
      earth: { value: data.earth },
      air: { value: data.air },
      fire: { value: data.fire },
      water: { value: data.water }
    },
    skills: {
      acrobatics: 0,
      animalHandling: 0,
      bluff: 0,
      charisma: 0,
      climbing: 0,
      infiltration: 0,
      intimidation: 0,
      jumping: 0,
      magic: 0,
      medicine: 0,
      perception: 0,
      swimming: 0,
      systems: 0,
      thievery: 0,
      vehicles: 0,
      wilderness: 0
    },
    combat: {
      arm: data.arm,
      marm: data.marm,
      statuses: data.statuses,
      defeated: false,
      ai: data.ai,
      actions: {
        quickUsed: false,
        slowUsed: false,
        reactionUsed: false
      },
      rewards: {
        exp: data.exp,
        ap: data.ap
      }
    },
    elements: elementAffinities(data.elementProfile),
    boss: data.boss
  };
}

function elementAffinities(profile) {
  const elements = {};
  for (const key of Object.keys(FFRPG4E.elements)) {
    elements[key] = profile?.[key] || "normal";
  }
  return elements;
}

function actorDoc(scope, name, type, data) {
  const system = actorSystem(data);
  if (type === "character") delete system.boss;
  const documentKey = data.sourceKey || `${scope}.${name}`;
  return {
    _id: idFor(documentKey),
    name,
    type,
    img: data.img,
    system,
    prototypeToken: {
      name,
      displayName: type === "character" ? 50 : 20,
      actorLink: type === "character",
      disposition: type === "character" ? 1 : -1,
      bar1: {
        attribute: "resources.hp"
      },
      bar2: {
        attribute: "resources.mp"
      },
      texture: {
        src: data.img,
        scaleX: 1,
        scaleY: 1
      },
      width: data.boss ? 2 : 1,
      height: data.boss ? 2 : 1
    },
    items: [],
    effects: [],
    folder: null,
    sort: 0,
    ownership: {
      default: 0
    },
    flags: {
      [systemId]: {
        source: data.source,
        sourceKey: documentKey
      }
    }
  };
}

function itemDoc(scope, item) {
  const flags = foundryFlags(item.flags, scope, item.type, item.name, item.system.source);
  return {
    _id: idFor(`${scope}.${item.type}.${item.name}`),
    name: item.name,
    type: item.type,
    img: item.img,
    system: item.system,
    effects: itemEffects(item),
    folder: null,
    sort: 0,
    ownership: {
      default: 0
    },
    flags
  };
}

function foundryFlags(flags, scope, type, name, source) {
  return {
    ...flags,
    [systemId]: {
      ...flags[systemId],
      source,
      sourceKey: `${scope}.${type}.${name}`
    }
  };
}

function activeEffectDoc(scope, name, profile) {
  return {
    _id: idFor(`${scope}.effect.${name}`),
    name,
    img: profile.icon,
    type: "base",
    system: {},
    changes: profile.changes,
    disabled: false,
    duration: {},
    transfer: false,
    origin: null,
    tint: null,
    statuses: [name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")],
    flags: {
      [systemId]: {
        source: "Final Fantasy VI",
        sourceKey: `${scope}.effect.${name}`
      }
    }
  };
}

function itemEffects(item) {
  const names = [];
  if (statusProfiles[item.name]) names.push(item.name);
  if (item.name === "Mighty Guard") names.push("Protect", "Shell");
  if (item.name === "White Wind") names.push("Regen");
  if (item.name === "Bad Breath") names.push("Poison", "Confuse", "Sleep");
  if (item.name === "Force Field") names.push("Shell");
  if (item.name === "Transfusion") names.push("Reraise");
  if (item.name === "Hermes Sandals") names.push("Haste");
  if (item.name === "Reflect Ring") names.push("Reflect");
  if (item.name === "Ribbon") names.push("Protect", "Shell");
  return names.map((name) => activeEffectDoc(`homebrew.${item.type}.${item.name}`, name, statusProfiles[name]));
}

function resultDoc(scope, name, start, end) {
  return {
    _id: idFor(`${scope}.result.${name}.${start}.${end}`),
    type: 0,
    text: name,
    img: "icons/svg/d20-grey.svg",
    weight: end - start + 1,
    range: [start, end],
    drawn: false
  };
}

function tableDoc(scope, name, description, results) {
  return {
    _id: idFor(`${scope}.${name}`),
    name,
    img: "icons/svg/d20-grey.svg",
    description,
    results,
    formula: "1d100",
    replacement: true,
    displayRoll: true,
    folder: null,
    sort: 0,
    ownership: {
      default: 0
    },
    flags: {
      [systemId]: {
        source: "Final Fantasy VI",
        sourceKey: `${scope}.${name}`
      }
    }
  };
}

function journalDoc(scope, name, content) {
  return {
    _id: idFor(`${scope}.${name}`),
    name,
    pages: [
      {
        _id: idFor(`${scope}.${name}.page`),
        name,
        type: "text",
        title: {
          show: true,
          level: 1
        },
        text: {
          format: 1,
          content
        },
        sort: 0,
        ownership: {
          default: -1
        },
        flags: {}
      }
    ],
    folder: null,
    sort: 0,
    ownership: {
      default: 0
    },
    flags: {
      [systemId]: {
        source: "Final Fantasy VI",
        sourceKey: `${scope}.${name}`
      }
    }
  };
}

function macroDoc(name, command, img = "icons/svg/dice-target.svg") {
  return {
    _id: idFor(`ff6.macro.${name}`),
    name,
    type: "script",
    author: null,
    img,
    scope: "global",
    command,
    folder: null,
    sort: 0,
    ownership: {
      default: 0
    },
    flags: {
      [systemId]: {
        source: "Final Fantasy VI",
        sourceKey: `ff6.macro.${name}`
      }
    }
  };
}

function macroCommand(functionName) {
  return `const macros = await import("/systems/${systemId}/module/macros.mjs"); await macros.${functionName}();`;
}

function cardDoc(scope, name, cards) {
  return {
    _id: idFor(`${scope}.${name}`),
    name,
    type: "deck",
    description: `<p>${name} for FFRPG 4e FF6 play.</p>`,
    img: "icons/svg/card-joker.svg",
    cards: cards.map((card, index) => ({
      _id: idFor(`${scope}.${name}.${card}`),
      name: card,
      type: "base",
      img: "icons/svg/card-joker.svg",
      drawn: false,
      face: 0,
      faces: [
        {
          name: card,
          img: "icons/svg/card-joker.svg"
        }
      ],
      back: {
        name: "Back",
        img: "icons/svg/card-joker.svg"
      },
      value: index + 1,
      suit: name,
      sort: index * 100000,
      ownership: {
        default: -1
      },
      flags: {}
    })),
    width: 1,
    height: 1,
    rotation: 0,
    displayCount: true,
    folder: null,
    sort: 0,
    ownership: {
      default: 0
    },
    flags: {
      [systemId]: {
        source: "Final Fantasy VI",
        sourceKey: `${scope}.${name}`
      }
    }
  };
}

function playlistDoc(name, mood) {
  return {
    _id: idFor(`ff6.playlist.${name}`),
    name,
    description: `<p>${mood}. Add licensed or original audio in your world.</p>`,
    sounds: [],
    mode: 0,
    playing: false,
    folder: null,
    sort: 0,
    ownership: {
      default: 0
    },
    flags: {
      [systemId]: {
        source: "Final Fantasy VI",
        sourceKey: `ff6.playlist.${name}`,
        mood
      }
    }
  };
}

function adventureDoc(name, summary) {
  return {
    _id: idFor(`ff6.adventure.${name}`),
    name,
    img: "icons/svg/book.svg",
    description: `<p>${summary}</p>`,
    caption: summary,
    contents: [],
    folder: null,
    sort: 0,
    ownership: {
      default: 0
    },
    flags: {
      [systemId]: {
        source: "Final Fantasy VI",
        sourceKey: `ff6.adventure.${name}`
      }
    }
  };
}

function anchorNames(fragment) {
  return [...fragment.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/g)].map((match) => text(match[1])).filter((name) => name && name !== "None");
}

function elementKey(name) {
  const lookup = {
    fire: "fire",
    ice: "ice",
    lightning: "lightning",
    wind: "air",
    earth: "earth",
    water: "water",
    poison: "bio",
    holy: "light"
  };
  return lookup[name.toLowerCase()];
}

function elementsFromSection(block, label) {
  const match = block.match(new RegExp(`${label}[\\s\\S]*?<td class="bottomrow"[^>]*><div class="tablemaintext">([\\s\\S]*?)<\\/div>`));
  if (!match) return [];
  return [...match[1].matchAll(/(?:alt|title)=['"]([^'"]+)['"]/g)].map((entry) => elementKey(entry[1])).filter((key) => key);
}

function elementProfileFromBlock(block) {
  const profile = {};
  for (const key of elementsFromSection(block, "Elemental Immunities")) profile[key] = "immune";
  for (const key of elementsFromSection(block, "Elemental Absorb")) profile[key] = "absorb";
  for (const key of elementsFromSection(block, "Elemental Weakness")) profile[key] = "weak";
  return profile;
}

function lootByEnemyFile(file) {
  const html = fs.readFileSync(path.join(cache, file), "utf8");
  const blocks = html.split(/<tr><td class="titlecolumn"/).slice(1).map((part) => `<tr><td class="titlecolumn"${part}`);
  const loot = new Map();
  for (const block of blocks) {
    const nameMatch = block.match(/<div class="tabletitletext">([\s\S]*?)<\/div>/);
    const bestiaryMatch = block.match(/Bestiary #([^<]+)/);
    if (!nameMatch || !bestiaryMatch) continue;
    const name = text(nameMatch[1]);
    const bestiary = text(bestiaryMatch[1]);
    const itemMatch = block.match(/Stolen Items[\s\S]*?Dropped Items[\s\S]*?<\/tr><tr valign="top"><td class="bottomrow" align="right" colspan="3"><div class="tablemaintext">([\s\S]*?)<\/div><\/td><td class="bottomrow" align="right" colspan="3"><div class="tablemaintext">([\s\S]*?)<\/div>/);
    const metamorphMatch = block.match(/Metamorph Package[\s\S]*?<td class="bottomrow" colspan="6" align="left"><div class="tablemaintext">([\s\S]*?)<\/div>/);
    loot.set(`${bestiary}.${name}`, {
      stolen: itemMatch ? anchorNames(itemMatch[1]) : [],
      dropped: itemMatch ? anchorNames(itemMatch[2]) : [],
      metamorph: metamorphMatch ? anchorNames(metamorphMatch[1]) : [],
      elements: elementProfileFromBlock(block)
    });
  }
  return loot;
}

function mergeLootMaps(files) {
  const loot = new Map();
  for (const file of files) {
    const fileLoot = lootByEnemyFile(file);
    for (const [key, value] of fileLoot.entries()) loot.set(key, value);
  }
  return loot;
}

function parseEnemyFile(file) {
  const html = fs.readFileSync(path.join(cache, file), "utf8");
  const regex = /<div class="tabletitletext">([^<]+)<\/div>[\s\S]*?Bestiary #([^<]+)<\/div><\/td>[\s\S]*?<tr valign="top"><td class="bottomrow" align="right"><div class="tablemaintext">([\s\S]*?)<\/div><\/td><td class="bottomrow" align="right"><div class="tablemaintext">(\d+)<\/div><\/td><td class="bottomrow" align="right"><div class="tablemaintext">([\d,]+)<\/div><\/td><td class="bottomrow" align="right"><div class="tablemaintext">([\d,]+)<\/div><\/td><td class="bottomrow" align="right"><div class="tablemaintext">([\d,]+)<\/div><\/td>[\s\S]*?<td class="toprow" align="right"><div class="tabletoptext">Strength<\/div><\/td>[\s\S]*?<tr valign="top"><td class="bottomrow" align="right"><div class="tablemaintext">(\d+)<\/div><\/td><td class="bottomrow" align="right"><div class="tablemaintext">(\d+)<\/div><\/td><td class="bottomrow" align="right"><div class="tablemaintext">(\d+)<\/div><\/td><td class="bottomrow" align="right"><div class="tablemaintext">(\d+)<\/div><\/td><td class="bottomrow" align="right"><div class="tablemaintext">(\d+)<\/div><\/td><td class="bottomrow" align="right"><div class="tablemaintext">(\d+)<\/div><\/td>/g;
  const loot = lootByEnemyFile(file);
  return [...html.matchAll(regex)].map((match) => {
    const name = text(match[1]);
    const bestiary = text(match[2]);
    const details = loot.get(`${bestiary}.${name}`);
    return {
      name,
      bestiary,
      loot: details,
      elementProfile: details ? details.elements : {},
      kind: text(match[3]),
      level: number(match[4]),
      hp: number(match[5]),
      mp: number(match[6]),
      gil: number(match[7]),
      strength: number(match[8]),
      magic: number(match[9]),
      evasion: number(match[10]),
      defense: number(match[11]),
      magicDefense: number(match[12]),
      magicEvasion: number(match[13])
    };
  });
}

function enemyFiles(prefix) {
  return fs.readdirSync(cache).filter((file) => file.startsWith(prefix) && file.endsWith(".html")).sort();
}

function parseEnemies(prefix) {
  const files = enemyFiles(prefix);
  const byKey = new Map();
  for (const file of files) {
    for (const enemy of parseEnemyFile(file)) {
      byKey.set(`${enemy.bestiary}.${enemy.name}`, enemy);
    }
  }
  return [...byKey.values()];
}

function enemyActor(enemy, boss) {
  const earth = Math.min(255, Math.max(10, enemy.strength * 5));
  const fire = Math.min(255, Math.max(10, enemy.magic * 5));
  const air = Math.min(255, Math.max(10, enemy.level + enemy.evasion));
  const water = Math.min(255, Math.max(10, Math.floor((enemy.magicDefense + enemy.magicEvasion) / 2)));
  return actorDoc(boss ? "ff6.boss" : "ff6.enemy", enemy.name, "npc", {
    img: "icons/svg/mystery-man.svg",
    source: "Final Fantasy VI",
    sourceKey: `${boss ? "ff6.boss" : "ff6.enemy"}.${enemy.bestiary}.${enemy.name}`,
    biography: `<p>Final Fantasy VI bestiary #${enemy.bestiary}. Type: ${enemy.kind}.</p>`,
    level: Math.max(1, enemy.level),
    gil: enemy.gil,
    primary: boss ? "berserker" : "beastmaster",
    secondary: boss ? "blackMage" : "scout",
    hp: Math.max(1, enemy.hp),
    mp: Math.max(0, enemy.mp),
    earth,
    air,
    fire,
    water,
    arm: enemy.defense,
    marm: enemy.magicDefense,
    statuses: "",
    ai: boss ? "caster" : "attacker",
    exp: Math.max(1, enemy.level * (boss ? 25 : 8)),
    ap: Math.max(1, Math.ceil(enemy.level / (boss ? 2 : 6))),
    elementProfile: enemy.elementProfile,
    boss
  });
}

function extractStat(html, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`<div class="tablelefttext">${escaped}<\\/div><\\/td><td class="bottomrow"><div class="tablemaintext">([^<]+)<\\/div>`);
  const match = html.match(regex);
  if (match) return text(match[1]);
  return "";
}

function parseCharacterFiles() {
  const files = fs.readdirSync(cache).filter((file) => file.startsWith("ff6-character-") && file.endsWith(".html")).sort();
  const byName = new Map();
  for (const file of files) {
    const html = fs.readFileSync(path.join(cache, file), "utf8");
    const heading = html.match(/<h2>([^<]+)<\/h2>/);
    if (!heading) continue;
    const name = text(heading[1]);
    const strength = number(extractStat(html, "Strength"));
    const speed = number(extractStat(html, "Speed"));
    const stamina = number(extractStat(html, "Stamina"));
    const magic = number(extractStat(html, "Magic Power"));
    const defense = number(extractStat(html, "Defense"));
    const magicDefense = number(extractStat(html, "Magic Defense"));
    const occupation = extractStat(html, "Class/Occupation");
    byName.set(name, { name, strength, speed, stamina, magic, defense, magicDefense, occupation });
  }
  return [...byName.values()];
}

function characterActor(character, playable) {
  const primary = playable ? inferJob(character.name) : "mediator";
  const portrait = playable ? playablePortrait(character.name) : "icons/svg/mystery-man.svg";
  return actorDoc(playable ? "ff6.playable" : "ff6.guest", character.name, playable ? "character" : "npc", {
    img: portrait,
    source: "Final Fantasy VI",
    biography: `<p>${character.occupation} from Final Fantasy VI.</p>`,
    level: 1,
    gil: 0,
    primary,
    secondary: playable ? "scout" : "oracle",
    hp: 100 + character.stamina * 5,
    mp: 20 + character.magic * 2,
    earth: Math.min(255, Math.max(10, character.strength * 5)),
    air: Math.min(255, Math.max(10, character.speed * 5)),
    fire: Math.min(255, Math.max(10, character.magic * 5)),
    water: Math.min(255, Math.max(10, character.stamina * 5)),
    arm: character.defense,
    marm: character.magicDefense,
    statuses: "",
    ai: "manual",
    exp: 0,
    ap: 0,
    elementProfile: {},
    boss: false
  });
}

function playablePortrait(name) {
  const file = playablePortraits[name];
  if (file) return `systems/${systemId}/assets/portraits/player-characters/${file}`;
  return "icons/svg/mystery-man.svg";
}

function extraGuestActor(guest) {
  return actorDoc("ff6.guest", guest.name, "npc", {
    img: "icons/svg/mystery-man.svg",
    source: "Final Fantasy VI",
    biography: `<p>Temporary guest from Final Fantasy VI.</p>`,
    level: 1,
    gil: 0,
    primary: guest.job,
    secondary: "scout",
    hp: 120,
    mp: 30,
    earth: guest.earth,
    air: guest.air,
    fire: guest.fire,
    water: guest.water,
    arm: 10,
    marm: 10,
    statuses: "",
    ai: "manual",
    exp: 0,
    ap: 0,
    elementProfile: {},
    boss: false
  });
}

function inferJob(name) {
  const jobs = {
    "Terra Branford": "redMage",
    "Locke Cole": "thief",
    "Edgar Roni Figaro": "machinist",
    "Sabin Rene Figaro": "monk",
    "Celes Chere": "redMage",
    "Cyan Garamonde": "samurai",
    Gau: "beastmaster",
    "Setzer Gabbiani": "gambler",
    Shadow: "ninja",
    "Strago Magus": "blueMage",
    "Relm Arrowny": "artificer",
    Mog: "dancer",
    Gogo: "sage",
    Umaro: "berserker"
  };
  if (jobs[name]) return jobs[name];
  return "freelancer";
}

function distributeEnemies(enemies) {
  const areas = new Map(encounterAreas.map((area) => [area.name, []]));
  for (const enemy of enemies) {
    const area = encounterAreas.find((candidate) => enemy.level >= candidate.min && enemy.level <= candidate.max);
    areas.get(area.name).push(enemy);
  }
  return areas;
}

function encounterText(enemies) {
  return enemies.map((enemy) => enemy.name).join(", ");
}

function randomEncounterTables(enemies) {
  const areas = distributeEnemies(enemies);
  return encounterAreas.map((area) => {
    const areaEnemies = areas.get(area.name);
    const results = [];
    let rangeStart = 1;
    for (let index = 0; index < areaEnemies.length; index += 3) {
      const group = areaEnemies.slice(index, index + 3);
      const rangeEnd = index + 3 >= areaEnemies.length ? 100 : Math.min(100, rangeStart + 11);
      results.push(resultDoc("ff6.randomEncounter", encounterText(group), rangeStart, rangeEnd));
      rangeStart = rangeEnd + 1;
    }
    return tableDoc(
      "ff6.randomEncounter",
      area.name,
      `<p>${area.terrain}. Levels ${area.min}-${area.max}.</p>`,
      results
    );
  });
}

function bossEncounterJournals(bosses) {
  return bosses.map((boss) => {
    const loot = boss.loot ? boss.loot : { stolen: [], dropped: [], metamorph: [] };
    const name = `${boss.name} #${boss.bestiary}`;
    const content = [
      `<h1>${boss.name}</h1>`,
      `<p>Level ${boss.level} ${boss.kind}. HP ${boss.hp}, MP ${boss.mp}, Gil ${boss.gil}.</p>`,
      `<p>Defense ${boss.defense}, Magic Defense ${boss.magicDefense}, Strength ${boss.strength}, Magic ${boss.magic}.</p>`,
      `<p>Steal: ${loot.stolen.length ? loot.stolen.join(", ") : "None"}.</p>`,
      `<p>Drops: ${loot.dropped.length ? loot.dropped.join(", ") : "None"}.</p>`,
      `<p>Metamorph: ${loot.metamorph.length ? loot.metamorph.join(", ") : "None"}.</p>`
    ].join("");
    return journalDoc("ff6.bossEncounter", name, content);
  });
}

function lootResults(enemy) {
  const loot = enemy.loot ? enemy.loot : { stolen: [], dropped: [], metamorph: [] };
  const entries = [];
  for (const item of loot.dropped) entries.push(`Drop: ${item}`);
  for (const item of loot.stolen) entries.push(`Steal: ${item}`);
  for (const item of loot.metamorph) entries.push(`Metamorph: ${item}`);
  entries.push(`Gil: ${enemy.gil}`);
  const step = Math.max(1, Math.floor(100 / entries.length));
  return entries.map((entry, index) => {
    const start = index * step + 1;
    const end = index === entries.length - 1 ? 100 : (index + 1) * step;
    return resultDoc("ff6.loot", entry, start, end);
  });
}

function lootTables(enemies) {
  return enemies.map((enemy) => tableDoc(
    "ff6.loot",
    `${enemy.name} #${enemy.bestiary} Loot`,
    `<p>Loot table for ${enemy.name}, Final Fantasy VI bestiary #${enemy.bestiary}.</p>`,
    lootResults(enemy)
  ));
}

function macroDocs() {
  return [
    macroDoc("Roll FFRPG Challenge", macroCommand("rollChallenge")),
    macroDoc("Roll Selected Initiative", macroCommand("rollSelectedInitiative")),
    macroDoc("Roll Selected Basic Attack", macroCommand("rollSelectedBasicAttack"), "icons/svg/sword.svg"),
    macroDoc("Reset Selected Actions", macroCommand("resetSelectedActions"), "icons/svg/clockwork.svg"),
    macroDoc("Apply Damage To Selected", macroCommand("applyDamageToSelected"), "icons/svg/blood.svg"),
    macroDoc("Heal Selected", macroCommand("healSelected"), "icons/svg/heal.svg"),
    macroDoc("Heal Selected To Full", macroCommand("healSelectedToFull"), "icons/svg/hospital.svg"),
    macroDoc("Toggle Selected KO", macroCommand("toggleSelectedKo"), "icons/svg/skull.svg"),
    macroDoc("Roll Random Encounter", macroCommand("rollRandomEncounter")),
    macroDoc("Choose Random Encounter", macroCommand("chooseRandomEncounter")),
    macroDoc("Roll Loot", macroCommand("rollLoot")),
    macroDoc("Choose Loot Table", macroCommand("chooseLootTable")),
    macroDoc("Shop Stock Roll", macroCommand("rollShopStock")),
    macroDoc("Roll Treasure", macroCommand("rollTreasure")),
    macroDoc("Blue Magic Learn Check", macroCommand("blueMagicLearnCheck"), "icons/svg/ice-aura.svg"),
    macroDoc("Time Magic Initiative Shift", macroCommand("timeMagicInitiativeShift"), "icons/svg/clockwork.svg"),
    macroDoc("Open Playable Characters", macroCommand("openPlayableCharacters"), "icons/svg/mystery-man.svg"),
    macroDoc("Open Enemies", macroCommand("openEnemies"), "icons/svg/mystery-man.svg"),
    macroDoc("Open Bosses", macroCommand("openBosses"), "icons/svg/bones.svg"),
    macroDoc("Open Spells", macroCommand("openSpells"), "icons/svg/explosion.svg"),
    macroDoc("Open Equipment", macroCommand("openEquipment"), "icons/svg/sword.svg")
  ];
}

function cardDocs() {
  return [
    cardDoc("ff6.cards", "Esper Deck", ["Ramuh", "Ifrit", "Shiva", "Siren", "Unicorn", "Maduin", "Bismarck", "Carbuncle", "Phantom", "Sraphim", "Golem", "ZoneSeek", "Fenrir", "Valigarmanda", "Phoenix", "Ragnarok", "Crusader", "Bahamut", "Odin", "Raiden"]),
    cardDoc("ff6.cards", "Status Deck", Object.keys(statusProfiles)),
    cardDoc("ff6.cards", "Encounter Modifier Deck", ["Ambush", "Pincer", "Back Attack", "Preemptive Strike", "Reinforcements", "Hazard", "Treasure Clue", "Blue Magic Opportunity", "Rare Steal", "No Escape"])
  ];
}

function playlistDocs() {
  return [
    playlistDoc("Town And Castle Ambience", "Quiet city, castle, inn, and market loops"),
    playlistDoc("Dungeon Ambience", "Caves, towers, ruins, factories, and haunted areas"),
    playlistDoc("Battle Ambience", "Generic combat, boss combat, and urgent encounters"),
    playlistDoc("World Travel Ambience", "Overworld, airship, ocean, and wasteland travel")
  ];
}

function adventureDocs() {
  return adventureChapters.map(([name, summary]) => adventureDoc(name, summary));
}

function progressionDocs() {
  const entries = [
    ["Level Advancement", "Increase stats through earned milestones. Character level remains the sum of stat levels derived from Earth, Air, Fire, and Water."],
    ["Job Advancement", "A character can advance their primary or secondary job after meaningful use, training, or chapter completion."],
    ["Magicite Growth", "Equipped magicite grants a focused stat direction and unlocks related spell training after practice or combat."],
    ["Blue Magic Learning", "A Blue Mage can learn monster techniques after seeing, surviving, or analyzing the technique."],
    ["Time Magic Mastery", "Time magic expands from initiative shifts into action economy, recovery, delay, and battlefield control."],
    ["Esper Bonds", "Espers act as story rewards, summon permissions, and magicite progression anchors."],
    ["Relic Mastery", "Relics can unlock signature combat modifications after repeated use."],
    ["World Of Ruin Recovery", "Late-game progression emphasizes rebuilding, optional objectives, and character-specific closure."]
  ];
  return entries.map(([name, body]) => journalDoc("ff6.progression", name, `<h1>${name}</h1><p>${body}</p>`));
}

function namedResultDocs(scope, entries) {
  const step = Math.floor(100 / entries.length);
  return entries.map((entry, index) => {
    const start = index * step + 1;
    const end = index === entries.length - 1 ? 100 : (index + 1) * step;
    return resultDoc(scope, entry, start, end);
  });
}

function shopTables() {
  return shopProfiles.map(([name, entries]) => tableDoc("ff6.shop", name, `<p>${name} inventory table.</p>`, namedResultDocs("ff6.shop", entries)));
}

function treasureTables() {
  const equipment = buildWorldContent().filter((item) => item.type === "equipment").map((item) => item.name);
  return encounterAreas.map((area, index) => {
    const start = (index * 5) % equipment.length;
    const entries = equipment.slice(start, start + 8);
    if (entries.length < 8) entries.push(...equipment.slice(0, 8 - entries.length));
    return tableDoc("ff6.treasure", `${area.name} Treasures`, `<p>${area.terrain} treasure table.</p>`, namedResultDocs("ff6.treasure", entries));
  });
}

function vehicleActors() {
  return vehicleProfiles.map(([name, job, biography, hp, mp, earth, air, fire, water]) => actorDoc("ff6.vehicle", name, "npc", {
    img: "icons/svg/wing.svg",
    source: "Final Fantasy VI",
    biography: `<p>${biography}</p>`,
    level: Math.max(1, Math.floor((earth + air + fire + water) / 40)),
    gil: 0,
    primary: job,
    secondary: "engineer",
    hp,
    mp,
    earth,
    air,
    fire,
    water,
    arm: Math.floor(earth / 4),
    marm: Math.floor(water / 4),
    statuses: "",
    ai: "manual",
    exp: 0,
    ap: 0,
    elementProfile: {},
    boss: false
  }));
}

function writePack(file, docs) {
  fs.mkdirSync(packs, { recursive: true });
  const body = docs.map((doc) => JSON.stringify(doc)).join("\n");
  fs.writeFileSync(path.join(packs, file), `${body}\n`);
}

const items = buildWorldContent().map((item) => itemDoc("homebrew", item));
writePack("homebrew-jobs.db", items.filter((item) => item.type === "job"));
writePack("homebrew-abilities.db", items.filter((item) => item.type === "ability"));
writePack("ff6-spells.db", items.filter((item) => item.type === "spell"));
writePack("ff6-equipment.db", items.filter((item) => item.type === "equipment"));

const allEnemies = parseEnemies("ff6-enemies-");
const bosses = parseEnemies("ff6-bosses-");
const bossKeys = new Set(bosses.map((enemy) => `${enemy.bestiary}.${enemy.name}`));
const regularEnemies = allEnemies.filter((enemy) => !bossKeys.has(`${enemy.bestiary}.${enemy.name}`));
writePack("ff6-enemies.db", regularEnemies.map((enemy) => enemyActor(enemy, false)));
writePack("ff6-bosses.db", bosses.map((enemy) => enemyActor(enemy, true)));
writePack("ff6-random-encounters.db", randomEncounterTables(regularEnemies));
writePack("ff6-boss-encounters.db", bossEncounterJournals(bosses));
writePack("ff6-loot-tables.db", lootTables([...regularEnemies, ...bosses]));
writePack("ff6-macros.db", macroDocs());
writePack("ff6-cards.db", cardDocs());
writePack("ff6-playlists.db", playlistDocs());
writePack("ff6-adventures.db", adventureDocs());
writePack("ff6-progression.db", progressionDocs());
writePack("ff6-shops.db", shopTables());
writePack("ff6-treasures.db", treasureTables());
writePack("ff6-vehicles.db", vehicleActors());

const characters = parseCharacterFiles();
const playable = characters.filter((character) => playableNames.has(character.name));
const guests = characters.filter((character) => !playableNames.has(character.name));
writePack("ff6-playable-characters.db", playable.map((character) => characterActor(character, true)));
writePack("ff6-guests.db", [...guests.map((character) => characterActor(character, false)), ...extraGuests.map(extraGuestActor)]);

console.log(JSON.stringify({
  jobs: items.filter((item) => item.type === "job").length,
  abilities: items.filter((item) => item.type === "ability").length,
  spells: items.filter((item) => item.type === "spell").length,
  equipment: items.filter((item) => item.type === "equipment").length,
  playable: playable.length,
  guests: guests.length + extraGuests.length,
  enemies: regularEnemies.length,
  bosses: bosses.length,
  randomEncounters: randomEncounterTables(regularEnemies).length,
  bossEncounters: bossEncounterJournals(bosses).length,
  lootTables: lootTables([...regularEnemies, ...bosses]).length,
  macros: macroDocs().length,
  cards: cardDocs().length,
  playlists: playlistDocs().length,
  adventures: adventureDocs().length,
  progression: progressionDocs().length,
  shops: shopTables().length,
  treasures: treasureTables().length,
  vehicles: vehicleActors().length
}, null, 2));
