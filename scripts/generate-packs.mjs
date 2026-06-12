import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
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

const bossArenas = [
  { name: "Narshe Defense Line", terrain: "snowfield barricades", tint: "#cddfe5" },
  { name: "Opera House Rafters", terrain: "theater rigging", tint: "#7a3f52" },
  { name: "Magitek Research Chamber", terrain: "reactor room", tint: "#49616d" },
  { name: "Sealed Gate Bridge", terrain: "cracked stone bridge", tint: "#865744" },
  { name: "Floating Continent Summit", terrain: "sky island summit", tint: "#817a9f" },
  { name: "Eight Dragons' Lairs", terrain: "elemental arena", tint: "#735e50" },
  { name: "Warring Triad Platforms", terrain: "divine battleground", tint: "#6a607a" },
  { name: "Kefka's Final Tower", terrain: "apocalyptic ascent", tint: "#713d61" }
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
      statuses: data.statuses
    },
    boss: data.boss
  };
}

function actorDoc(scope, name, type, data) {
  const system = actorSystem(data);
  if (type === "character") delete system.boss;
  return {
    _id: idFor(`${scope}.${name}`),
    name,
    type,
    img: data.img,
    system,
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
        sourceKey: `${scope}.${name}`
      }
    }
  };
}

function itemDoc(scope, item) {
  return {
    _id: idFor(`${scope}.${item.type}.${item.name}`),
    name: item.name,
    type: item.type,
    img: item.img,
    system: item.system,
    effects: [],
    folder: null,
    sort: 0,
    ownership: {
      default: 0
    },
    flags: item.flags
  };
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

function sceneDoc(scope, name, area, index) {
  return {
    _id: idFor(`${scope}.${name}`),
    name,
    active: false,
    navigation: false,
    navOrder: index,
    navName: name,
    background: {
      src: "",
      tint: area.tint,
      offsetX: 0,
      offsetY: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      anchorX: 0.5,
      anchorY: 0.5,
      fit: "cover"
    },
    width: 2800,
    height: 1800,
    padding: 0.25,
    grid: {
      type: 1,
      size: 100,
      distance: 1,
      units: "sq",
      style: "solidLines",
      thickness: 1,
      color: "#000000",
      alpha: 0.2
    },
    darkness: 0,
    drawings: [],
    tokens: [],
    lights: [],
    notes: [],
    sounds: [],
    templates: [],
    tiles: [],
    walls: [],
    regions: [],
    folder: null,
    sort: 0,
    ownership: {
      default: 0
    },
    flags: {
      [systemId]: {
        source: "Final Fantasy VI",
        sourceKey: `${scope}.${name}`,
        terrain: area.terrain
      }
    }
  };
}

function anchorNames(fragment) {
  return [...fragment.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/g)].map((match) => text(match[1])).filter((name) => name && name !== "None");
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
      metamorph: metamorphMatch ? anchorNames(metamorphMatch[1]) : []
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
  return actorDoc(playable ? "ff6.playable" : "ff6.guest", character.name, playable ? "character" : "npc", {
    img: "icons/svg/mystery-man.svg",
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
    boss: false
  });
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
    const content = [
      `<h1>${boss.name}</h1>`,
      `<p>Level ${boss.level} ${boss.kind}. HP ${boss.hp}, MP ${boss.mp}, Gil ${boss.gil}.</p>`,
      `<p>Defense ${boss.defense}, Magic Defense ${boss.magicDefense}, Strength ${boss.strength}, Magic ${boss.magic}.</p>`,
      `<p>Steal: ${loot.stolen.length ? loot.stolen.join(", ") : "None"}.</p>`,
      `<p>Drops: ${loot.dropped.length ? loot.dropped.join(", ") : "None"}.</p>`,
      `<p>Metamorph: ${loot.metamorph.length ? loot.metamorph.join(", ") : "None"}.</p>`
    ].join("");
    return journalDoc("ff6.bossEncounter", boss.name, content);
  });
}

function encounterScenes() {
  const areaScenes = encounterAreas.map((area, index) => sceneDoc("ff6.encounterScene", `${area.name} Battlefield`, area, index));
  const arenaScenes = bossArenas.map((area, index) => sceneDoc("ff6.encounterScene", `${area.name} Boss Arena`, area, encounterAreas.length + index));
  return [...areaScenes, ...arenaScenes];
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
    `${enemy.name} Loot`,
    `<p>Loot table for ${enemy.name}, Final Fantasy VI bestiary #${enemy.bestiary}.</p>`,
    lootResults(enemy)
  ));
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
writePack("ff6-encounter-scenes.db", encounterScenes());
writePack("ff6-loot-tables.db", lootTables([...regularEnemies, ...bosses]));

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
  encounterScenes: encounterScenes().length,
  lootTables: lootTables([...regularEnemies, ...bosses]).length
}, null, 2));
