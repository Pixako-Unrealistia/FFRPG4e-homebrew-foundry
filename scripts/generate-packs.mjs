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

function parseEnemyFile(file) {
  const html = fs.readFileSync(path.join(cache, file), "utf8");
  const regex = /<div class="tabletitletext">([^<]+)<\/div>[\s\S]*?Bestiary #([^<]+)<\/div><\/td>[\s\S]*?<tr valign="top"><td class="bottomrow" align="right"><div class="tablemaintext">([\s\S]*?)<\/div><\/td><td class="bottomrow" align="right"><div class="tablemaintext">(\d+)<\/div><\/td><td class="bottomrow" align="right"><div class="tablemaintext">([\d,]+)<\/div><\/td><td class="bottomrow" align="right"><div class="tablemaintext">([\d,]+)<\/div><\/td><td class="bottomrow" align="right"><div class="tablemaintext">([\d,]+)<\/div><\/td>[\s\S]*?<td class="toprow" align="right"><div class="tabletoptext">Strength<\/div><\/td>[\s\S]*?<tr valign="top"><td class="bottomrow" align="right"><div class="tablemaintext">(\d+)<\/div><\/td><td class="bottomrow" align="right"><div class="tablemaintext">(\d+)<\/div><\/td><td class="bottomrow" align="right"><div class="tablemaintext">(\d+)<\/div><\/td><td class="bottomrow" align="right"><div class="tablemaintext">(\d+)<\/div><\/td><td class="bottomrow" align="right"><div class="tablemaintext">(\d+)<\/div><\/td><td class="bottomrow" align="right"><div class="tablemaintext">(\d+)<\/div><\/td>/g;
  return [...html.matchAll(regex)].map((match) => ({
    name: text(match[1]),
    bestiary: text(match[2]),
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
  }));
}

function parseEnemies(prefix) {
  const files = fs.readdirSync(cache).filter((file) => file.startsWith(prefix) && file.endsWith(".html")).sort();
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
  bosses: bosses.length
}, null, 2));
