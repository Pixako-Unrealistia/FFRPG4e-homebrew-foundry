import { FFRPG4E } from "./config.mjs";

export const CONTENT_VERSION = "0.3.0";
const SYSTEM_ID = "ffrpg4e-homebrew-foundry";
const PACK_SOURCES = [
  { name: "Homebrew Jobs", type: "Item", path: "packs/homebrew-jobs.db" },
  { name: "Homebrew Abilities", type: "Item", path: "packs/homebrew-abilities.db" },
  { name: "FF6 Spells", type: "Item", path: "packs/ff6-spells.db" },
  { name: "FF6 Equipment", type: "Item", path: "packs/ff6-equipment.db" },
  { name: "FF6 Playable Characters", type: "Actor", path: "packs/ff6-playable-characters.db" },
  { name: "FF6 Guests And Story Characters", type: "Actor", path: "packs/ff6-guests.db" },
  { name: "FF6 Enemies", type: "Actor", path: "packs/ff6-enemies.db" },
  { name: "FF6 Bosses", type: "Actor", path: "packs/ff6-bosses.db" },
  { name: "FF6 Random Encounters", type: "RollTable", path: "packs/ff6-random-encounters.db" },
  { name: "FF6 Boss Encounters", type: "JournalEntry", path: "packs/ff6-boss-encounters.db" },
  { name: "FF6 Loot Tables", type: "RollTable", path: "packs/ff6-loot-tables.db" },
  { name: "FF6 Macros", type: "Macro", path: "packs/ff6-macros.db" },
  { name: "FF6 Cards", type: "Cards", path: "packs/ff6-cards.db" },
  { name: "FF6 Playlists", type: "Playlist", path: "packs/ff6-playlists.db" },
  { name: "FF6 Adventures", type: "Adventure", path: "packs/ff6-adventures.db", worldImport: false },
  { name: "FF6 Progression", type: "JournalEntry", path: "packs/ff6-progression.db" },
  { name: "FF6 Shops", type: "RollTable", path: "packs/ff6-shops.db" },
  { name: "FF6 Treasures", type: "RollTable", path: "packs/ff6-treasures.db" },
  { name: "FF6 Vehicles", type: "Actor", path: "packs/ff6-vehicles.db" }
];
const CONTENT_FOLDERS = {
  job: "FFRPG 4e Jobs",
  ability: "FFRPG 4e Abilities",
  spell: "FFRPG 4e Spells",
  equipment: "FFRPG 4e Equipment"
};

const abilityProfiles = {
  warrior: ["Power Break", "Armor Break", "Cleave"],
  knight: ["Cover", "Sentinel", "Shield Bash"],
  dragoon: ["Jump", "Lancet", "Dragon Dive"],
  monk: ["Blitz Rush", "Chakra", "Rising Phoenix"],
  samurai: ["Bushido Strike", "Iai Draw", "Dragon Fang"],
  berserker: ["Rage", "Skullsplitter", "Wild Swing"],
  darkKnight: ["Darkside", "Souleater", "Abyss Blade"],
  thief: ["Steal", "Mug", "Vanish Step"],
  ninja: ["Throw", "Shadowbind", "Mirror Image"],
  assassin: ["Backstab", "Death Mark", "Silent Knife"],
  scout: ["Aim", "Expose Weakness", "Skirmish"],
  treasureHunter: ["Lucky Find", "Trap Sense", "Pilfer"],
  dancer: ["Wind Rhapsody", "Blade Dance", "Healing Waltz"],
  blackMage: ["Arcane Focus", "Elemental Burst", "Mana Surge"],
  whiteMage: ["Prayer", "Radiant Ward", "Life Chant"],
  redMage: ["Dualcast", "Spellblade", "Riposte"],
  summoner: ["Esper Call", "Maduin Pact", "Bahamut Sign"],
  blueMage: ["Learn", "Aqua Breath", "Mighty Guard"],
  timeMage: ["Temporal Slip", "Quick Step", "Stopwatch"],
  geomancer: ["Terrain", "Cave In", "Wind Slash"],
  sage: ["Analyze", "Grand Lore", "Dual Thesis"],
  machinist: ["Auto Crossbow", "Drill", "Noiseblaster"],
  engineer: ["Repair", "Overclock", "Barrier Generator"],
  magitekPilot: ["Magitek Beam", "Armor Guard", "Tek Missile"],
  gunner: ["Charged Shot", "Suppressing Fire", "Ricochet"],
  chemist: ["Mix", "Remedy Bomb", "Mega Tonic"],
  artificer: ["Runic Device", "Ether Cell", "Magicite Mine"],
  bard: ["Heroic Anthem", "Requiem", "Encore"],
  gambler: ["Slots", "Dice Toss", "Double Down"],
  beastmaster: ["Command Beast", "Rage Call", "Tame"],
  mediator: ["Parley", "Intimidating Offer", "Ceasefire"],
  oracle: ["Omen", "Curse", "Foresight"],
  merchant: ["Gil Toss", "Stockpile", "Supply Drop"]
};

const spellSeeds = [
  ["Cure", "whiteMage", 5, "heal", "water", "water", "water", "light", 2],
  ["Cura", "whiteMage", 25, "heal", "water", "water", "water", "light", 5],
  ["Curaga", "whiteMage", 40, "heal", "water", "water", "water", "light", 8],
  ["Regen", "whiteMage", 10, "status", "water", "water", "water", "light", 0.5],
  ["Poisona", "whiteMage", 3, "status", "water", "water", "water", "light", 0],
  ["Esuna", "whiteMage", 15, "status", "water", "water", "water", "light", 0],
  ["Raise", "whiteMage", 30, "revive", "water", "water", "water", "light", 3],
  ["Arise", "whiteMage", 60, "revive", "water", "water", "water", "light", 9],
  ["Reraise", "whiteMage", 50, "status", "water", "water", "water", "light", 0],
  ["Fire", "blackMage", 4, "damage", "fire", "water", "fire", "fire", 3],
  ["Fira", "blackMage", 20, "damage", "fire", "water", "fire", "fire", 6],
  ["Firaga", "blackMage", 51, "damage", "fire", "water", "fire", "fire", 10],
  ["Blizzard", "blackMage", 5, "damage", "fire", "water", "fire", "ice", 3],
  ["Blizzara", "blackMage", 21, "damage", "fire", "water", "fire", "ice", 6],
  ["Blizzaga", "blackMage", 52, "damage", "fire", "water", "fire", "ice", 10],
  ["Thunder", "blackMage", 6, "damage", "fire", "water", "fire", "lightning", 3],
  ["Thundara", "blackMage", 22, "damage", "fire", "water", "fire", "lightning", 6],
  ["Thundaga", "blackMage", 53, "damage", "fire", "water", "fire", "lightning", 10],
  ["Poison", "blackMage", 3, "damage", "fire", "water", "fire", "bio", 2],
  ["Bio", "blackMage", 26, "damage", "fire", "water", "fire", "bio", 7],
  ["Drain", "blackMage", 15, "damage", "water", "water", "water", "shadow", 5],
  ["Osmose", "blackMage", 1, "status", "water", "water", "water", "shadow", 0],
  ["Flare", "blackMage", 45, "damage", "fire", "water", "fire", "light", 12],
  ["Ultima", "sage", 80, "damage", "fire", "water", "fire", "light", 15],
  ["Meteor", "sage", 62, "damage", "fire", "water", "fire", "crush", 13],
  ["Meltdown", "blackMage", 85, "damage", "fire", "water", "fire", "fire", 14],
  ["Holy", "whiteMage", 40, "damage", "water", "water", "water", "light", 9],
  ["Libra", "sage", 3, "status", "fire", "fire", "fire", "light", 0],
  ["Slow", "timeMage", 5, "status", "fire", "air", "fire", "shadow", 0],
  ["Haste", "timeMage", 10, "status", "fire", "air", "fire", "light", 0],
  ["Stop", "timeMage", 10, "status", "fire", "air", "fire", "shadow", 0],
  ["Quick", "timeMage", 99, "status", "fire", "air", "fire", "light", 0],
  ["Float", "timeMage", 17, "status", "fire", "air", "fire", "air", 0],
  ["Teleport", "timeMage", 20, "status", "fire", "air", "fire", "air", 0],
  ["Dispel", "sage", 25, "status", "fire", "water", "fire", "light", 0],
  ["Protect", "whiteMage", 12, "status", "water", "earth", "water", "earth", 0],
  ["Shell", "whiteMage", 15, "status", "water", "water", "water", "water", 0],
  ["Reflect", "redMage", 22, "status", "fire", "water", "fire", "light", 0],
  ["Sleep", "blackMage", 5, "status", "fire", "water", "fire", "shadow", 0],
  ["Confuse", "oracle", 8, "status", "water", "water", "water", "shadow", 0],
  ["Berserk", "berserker", 16, "status", "water", "water", "earth", "bio", 0],
  ["Imp", "blueMage", 10, "status", "water", "water", "water", "bio", 0],
  ["Vanish", "thief", 18, "status", "air", "air", "air", "air", 0],
  ["Gravity", "timeMage", 33, "damage", "fire", "water", "fire", "shadow", 6],
  ["Graviga", "timeMage", 48, "damage", "fire", "water", "fire", "shadow", 9],
  ["Banish", "whiteMage", 35, "damage", "water", "water", "water", "light", 8],
  ["Quake", "geomancer", 50, "damage", "fire", "earth", "fire", "earth", 10],
  ["Tornado", "geomancer", 75, "damage", "fire", "air", "fire", "air", 12],
  ["Aqua Breath", "blueMage", 22, "damage", "water", "water", "water", "water", 7],
  ["Mighty Guard", "blueMage", 40, "status", "water", "water", "water", "light", 0],
  ["White Wind", "blueMage", 28, "heal", "water", "water", "water", "air", 6],
  ["Bad Breath", "blueMage", 32, "status", "water", "water", "water", "bio", 0],
  ["1000 Needles", "blueMage", 25, "damage", "water", "earth", "water", "puncture", 8],
  ["Level 5 Death", "blueMage", 30, "status", "water", "water", "water", "shadow", 0],
  ["Level 4 Flare", "blueMage", 42, "damage", "fire", "water", "fire", "light", 10],
  ["Level 3 Confuse", "blueMage", 18, "status", "water", "water", "water", "shadow", 0],
  ["Traveler", "blueMage", 38, "damage", "water", "air", "water", "crush", 8],
  ["Revenge Blast", "blueMage", 31, "damage", "water", "water", "water", "shadow", 9],
  ["Stone", "blueMage", 22, "damage", "earth", "earth", "earth", "earth", 7],
  ["Rippler", "blueMage", 24, "status", "water", "water", "water", "water", 0],
  ["Quasar", "blueMage", 50, "damage", "fire", "water", "fire", "light", 12],
  ["Grand Delta", "blueMage", 64, "damage", "fire", "water", "fire", "light", 14],
  ["Force Field", "blueMage", 36, "status", "water", "water", "water", "light", 0],
  ["Transfusion", "blueMage", 20, "heal", "water", "water", "water", "light", 8],
  ["Dischord", "blueMage", 16, "status", "water", "water", "water", "shadow", 0],
  ["Self-Destruct", "blueMage", 1, "damage", "earth", "earth", "earth", "fire", 12],
  ["Roulette", "blueMage", 20, "status", "water", "water", "water", "shadow", 0],
  ["Tsunami", "blueMage", 45, "damage", "water", "water", "water", "water", 11],
  ["Slowga", "timeMage", 18, "status", "fire", "air", "fire", "shadow", 0],
  ["Hastega", "timeMage", 32, "status", "fire", "air", "fire", "light", 0],
  ["Delay", "timeMage", 15, "status", "fire", "air", "fire", "shadow", 0],
  ["Accelerate", "timeMage", 18, "status", "fire", "air", "fire", "light", 0],
  ["Rewind", "timeMage", 36, "heal", "fire", "air", "fire", "light", 5],
  ["Stasis", "timeMage", 28, "status", "fire", "air", "fire", "shadow", 0],
  ["Countdown", "timeMage", 22, "status", "fire", "water", "fire", "shadow", 0],
  ["Comet", "timeMage", 35, "damage", "fire", "water", "fire", "crush", 9]
];

const equipmentSeeds = [
  ["Dagger", "weapon", 150, 1, 0, 0, 1.5, "air", "air", "cut"],
  ["Mythril Knife", "weapon", 300, 3, 0, 0, 2, "air", "air", "cut"],
  ["Air Knife", "weapon", 950, 8, 0, 0, 3, "air", "air", "air"],
  ["Thief's Knife", "weapon", 0, 12, 0, 0, 3.5, "air", "air", "cut"],
  ["Assassin's Dagger", "weapon", 0, 16, 0, 0, 4, "air", "fire", "cut"],
  ["Valiant Knife", "weapon", 0, 20, 0, 0, 5, "air", "earth", "cut"],
  ["Mythril Sword", "weapon", 450, 4, 0, 0, 2.5, "earth", "earth", "cut"],
  ["Flametongue", "weapon", 7000, 13, 0, 0, 4, "earth", "water", "fire"],
  ["Icebrand", "weapon", 7000, 13, 0, 0, 4, "earth", "water", "ice"],
  ["Thunder Blade", "weapon", 7000, 13, 0, 0, 4, "earth", "water", "lightning"],
  ["Excalibur", "weapon", 0, 22, 0, 0, 6, "earth", "water", "light"],
  ["Ragnarok", "weapon", 0, 24, 0, 0, 6.5, "earth", "water", "light"],
  ["Ultima Weapon", "weapon", 0, 25, 0, 0, 7, "earth", "water", "light"],
  ["Heavy Lance", "weapon", 10000, 14, 0, 0, 4.5, "air", "air", "puncture"],
  ["Partisan", "weapon", 13000, 17, 0, 0, 5, "air", "air", "puncture"],
  ["Holy Lance", "weapon", 0, 22, 0, 0, 6, "air", "water", "light"],
  ["Ashura", "weapon", 500, 5, 0, 0, 2.5, "air", "fire", "cut"],
  ["Kotetsu", "weapon", 800, 7, 0, 0, 3, "air", "fire", "cut"],
  ["Kazekiri", "weapon", 0, 14, 0, 0, 4.5, "air", "air", "air"],
  ["Murasame", "weapon", 0, 19, 0, 0, 5.5, "air", "fire", "cut"],
  ["Tigerfang", "weapon", 0, 20, 0, 0, 5.5, "earth", "earth", "crush"],
  ["Dragon Claws", "weapon", 0, 23, 0, 0, 6, "earth", "earth", "crush"],
  ["Mythril Rod", "weapon", 500, 4, 0, 0, 2, "fire", "water", "crush"],
  ["Flame Rod", "weapon", 3000, 9, 0, 0, 3.5, "fire", "water", "fire"],
  ["Ice Rod", "weapon", 3000, 9, 0, 0, 3.5, "fire", "water", "ice"],
  ["Thunder Rod", "weapon", 3000, 9, 0, 0, 3.5, "fire", "water", "lightning"],
  ["Magus Rod", "weapon", 0, 21, 0, 0, 5.5, "fire", "water", "light"],
  ["Healing Rod", "weapon", 0, 10, 0, 0, 4, "water", "water", "light"],
  ["Cards", "weapon", 10000, 13, 0, 0, 4, "air", "fire", "cut"],
  ["Dice", "weapon", 5000, 12, 0, 0, 4, "air", "fire", "crush"],
  ["Fixed Dice", "weapon", 0, 22, 0, 0, 6, "air", "fire", "crush"],
  ["Chocobo Brush", "weapon", 6000, 11, 0, 0, 3.5, "water", "water", "crush"],
  ["Magical Brush", "weapon", 13000, 18, 0, 0, 5, "water", "water", "light"],
  ["Auto Crossbow", "weapon", 250, 3, 0, 0, 3, "fire", "air", "puncture"],
  ["Noiseblaster", "weapon", 500, 5, 0, 0, 1, "fire", "water", "air"],
  ["Drill", "weapon", 3000, 12, 0, 0, 5, "fire", "earth", "puncture"],
  ["Chainsaw", "weapon", 0, 18, 0, 0, 6, "fire", "earth", "cut"],
  ["Cotton Robe", "armor", 100, 1, 1, 4, 0, "earth", "water", "crush"],
  ["Silk Robe", "armor", 6000, 10, 3, 8, 0, "earth", "water", "crush"],
  ["Mystery Veil", "armor", 5500, 11, 2, 10, 0, "earth", "water", "light"],
  ["Leather Armor", "armor", 200, 1, 4, 1, 0, "earth", "earth", "crush"],
  ["Mythril Vest", "armor", 1200, 5, 6, 3, 0, "earth", "earth", "crush"],
  ["Force Armor", "armor", 0, 18, 14, 15, 0, "earth", "water", "light"],
  ["Genji Armor", "armor", 0, 22, 18, 10, 0, "earth", "earth", "cut"],
  ["Aegis Shield", "accessory1", 0, 18, 8, 8, 0, "earth", "water", "light"],
  ["Hero's Ring", "accessory1", 0, 8, 0, 0, 0, "earth", "water", "light"],
  ["Ribbon", "accessory1", 0, 12, 0, 0, 0, "water", "water", "light"],
  ["Genji Glove", "accessory1", 0, 16, 0, 0, 0, "earth", "earth", "cut"],
  ["Offering", "accessory1", 0, 20, 0, 0, 0, "earth", "air", "cut"],
  ["Gale Hairpin", "accessory1", 0, 8, 0, 0, 0, "air", "air", "air"],
  ["Dragoon Boots", "accessory1", 0, 10, 0, 0, 0, "air", "air", "puncture"],
  ["Zephyr Cloak", "accessory1", 0, 9, 2, 4, 0, "air", "air", "air"],
  ["Dirk", "weapon", 50, 1, 0, 0, 1, "air", "air", "cut"],
  ["Guardian", "weapon", 800, 6, 0, 0, 2.5, "air", "air", "cut"],
  ["Swordbreaker", "weapon", 16000, 18, 0, 0, 4.5, "air", "air", "cut"],
  ["Man-Eater", "weapon", 0, 19, 0, 0, 5, "air", "water", "cut"],
  ["Graedus", "weapon", 0, 21, 0, 0, 5.5, "air", "air", "light"],
  ["Great Sword", "weapon", 800, 6, 0, 0, 3, "earth", "earth", "cut"],
  ["Rune Blade", "weapon", 7500, 12, 0, 0, 4, "fire", "water", "light"],
  ["Bastard Sword", "weapon", 3000, 10, 0, 0, 3.5, "earth", "earth", "cut"],
  ["Blood Sword", "weapon", 0, 15, 0, 0, 4, "water", "water", "shadow"],
  ["Soul Sabre", "weapon", 0, 15, 0, 0, 4, "water", "water", "shadow"],
  ["Break Blade", "weapon", 0, 18, 0, 0, 5, "earth", "earth", "cut"],
  ["Enhancer", "weapon", 10000, 18, 0, 0, 4.5, "fire", "water", "light"],
  ["Crystal Sword", "weapon", 15000, 20, 0, 0, 5.5, "earth", "earth", "cut"],
  ["Falchion", "weapon", 17000, 21, 0, 0, 5.5, "air", "earth", "cut"],
  ["Organyx", "weapon", 0, 23, 0, 0, 6, "earth", "water", "cut"],
  ["Lightbringer", "weapon", 0, 25, 0, 0, 7, "fire", "water", "light"],
  ["Mythril Spear", "weapon", 800, 5, 0, 0, 2.5, "air", "air", "puncture"],
  ["Trident", "weapon", 1700, 8, 0, 0, 3.5, "air", "water", "water"],
  ["Stout Spear", "weapon", 10000, 14, 0, 0, 4.5, "air", "earth", "puncture"],
  ["Radiant Lance", "weapon", 0, 24, 0, 0, 6.5, "air", "water", "light"],
  ["Kiku-ichimonji", "weapon", 1200, 9, 0, 0, 3.5, "air", "fire", "cut"],
  ["Aura", "weapon", 0, 19, 0, 0, 5.5, "air", "fire", "light"],
  ["Strato", "weapon", 0, 21, 0, 0, 6, "air", "fire", "cut"],
  ["Sky Render", "weapon", 0, 24, 0, 0, 6.5, "air", "fire", "air"],
  ["Metal Knuckle", "weapon", 500, 4, 0, 0, 2.5, "earth", "earth", "crush"],
  ["Mythril Claws", "weapon", 800, 6, 0, 0, 3, "earth", "earth", "crush"],
  ["Kaiser Knuckles", "weapon", 1000, 8, 0, 0, 3.5, "earth", "earth", "crush"],
  ["Venom Claws", "weapon", 2500, 11, 0, 0, 4, "earth", "water", "bio"],
  ["Burning Fist", "weapon", 10000, 17, 0, 0, 5, "earth", "water", "fire"],
  ["Blizzard Orb", "weapon", 0, 17, 0, 0, 5, "earth", "water", "ice"],
  ["Sniper", "weapon", 15000, 18, 0, 0, 5, "air", "air", "puncture"],
  ["Wing Edge", "weapon", 0, 23, 0, 0, 6, "air", "air", "cut"],
  ["Punisher", "weapon", 10000, 17, 0, 0, 4.5, "fire", "water", "shadow"],
  ["Gravity Rod", "weapon", 13000, 18, 0, 0, 5, "fire", "water", "shadow"],
  ["Rainbow Brush", "weapon", 0, 22, 0, 0, 5.5, "water", "water", "light"],
  ["Buckler", "accessory1", 200, 1, 1, 0, 0, "earth", "earth", "crush"],
  ["Heavy Shield", "accessory1", 400, 3, 2, 0, 0, "earth", "earth", "crush"],
  ["Mythril Shield", "accessory1", 1200, 6, 3, 1, 0, "earth", "earth", "crush"],
  ["Gold Shield", "accessory1", 2500, 10, 5, 2, 0, "earth", "earth", "crush"],
  ["Diamond Shield", "accessory1", 3500, 14, 7, 3, 0, "earth", "earth", "crush"],
  ["Flame Shield", "accessory1", 0, 16, 6, 5, 0, "earth", "water", "fire"],
  ["Ice Shield", "accessory1", 0, 16, 6, 5, 0, "earth", "water", "ice"],
  ["Thunder Shield", "accessory1", 0, 16, 6, 5, 0, "earth", "water", "lightning"],
  ["Crystal Shield", "accessory1", 7000, 20, 9, 5, 0, "earth", "earth", "crush"],
  ["Genji Shield", "accessory1", 0, 22, 11, 7, 0, "earth", "earth", "cut"],
  ["Paladin Shield", "accessory1", 0, 25, 15, 15, 0, "water", "water", "light"],
  ["Plumed Hat", "armor", 250, 2, 1, 1, 0, "air", "air", "air"],
  ["Green Beret", "armor", 3000, 7, 2, 1, 0, "air", "air", "air"],
  ["Magus Hat", "armor", 600, 5, 1, 3, 0, "fire", "water", "light"],
  ["Bard's Hat", "armor", 3000, 9, 2, 3, 0, "water", "water", "air"],
  ["Circlet", "armor", 7000, 12, 2, 5, 0, "fire", "water", "light"],
  ["Red Cap", "armor", 0, 15, 4, 2, 0, "earth", "earth", "fire"],
  ["Cat-Ear Hood", "armor", 0, 20, 3, 6, 0, "air", "water", "air"],
  ["Leather Hat", "armor", 50, 1, 1, 0, 0, "earth", "earth", "crush"],
  ["Regal Crown", "armor", 0, 16, 3, 7, 0, "water", "water", "light"],
  ["Diamond Helm", "armor", 8000, 14, 6, 2, 0, "earth", "earth", "crush"],
  ["Genji Helm", "armor", 0, 22, 9, 5, 0, "earth", "earth", "cut"],
  ["Minerva Bustier", "armor", 0, 22, 12, 12, 0, "water", "water", "light"],
  ["Mirage Vest", "armor", 0, 18, 8, 8, 0, "air", "air", "air"],
  ["Snow Scarf", "armor", 0, 25, 16, 14, 0, "earth", "water", "ice"],
  ["Behemoth Suit", "armor", 0, 24, 15, 11, 0, "earth", "earth", "crush"],
  ["Sprint Shoes", "accessory2", 1500, 4, 0, 0, 0, "air", "air", "air"],
  ["Hermes Sandals", "accessory2", 7000, 10, 0, 0, 0, "air", "air", "light"],
  ["Reflect Ring", "accessory2", 6000, 10, 0, 2, 0, "water", "water", "light"],
  ["Jeweled Ring", "accessory2", 1000, 5, 0, 1, 0, "water", "water", "light"],
  ["Fairy Ring", "accessory2", 1500, 6, 0, 1, 0, "water", "water", "light"],
  ["Barrier Ring", "accessory2", 500, 5, 0, 2, 0, "water", "water", "light"],
  ["Mythril Glove", "accessory2", 700, 5, 2, 0, 0, "earth", "earth", "crush"],
  ["Hyper Wrist", "accessory2", 8000, 10, 0, 0, 0, "earth", "earth", "crush"],
  ["Black Belt", "accessory2", 5000, 10, 1, 0, 0, "earth", "earth", "crush"],
  ["Thief's Bracer", "accessory2", 3000, 9, 0, 0, 0, "air", "air", "air"],
  ["Safety Bit", "accessory2", 5000, 12, 0, 3, 0, "water", "water", "light"],
  ["Memento Ring", "accessory2", 0, 14, 0, 4, 0, "water", "water", "light"],
  ["Celestriad", "accessory2", 0, 18, 0, 5, 0, "fire", "water", "light"],
  ["Soul of Thamasa", "accessory2", 0, 20, 0, 5, 0, "fire", "water", "light"],
  ["Growth Egg", "accessory2", 0, 12, 0, 0, 0, "water", "water", "light"],
  ["Master's Scroll", "accessory2", 0, 20, 0, 0, 0, "earth", "air", "cut"],
  ["Dragon Horn", "accessory2", 0, 18, 0, 0, 0, "air", "air", "puncture"],
  ["Muscle Belt", "accessory2", 5000, 10, 3, 0, 0, "earth", "earth", "crush"],
  ["Guard Bracelet", "accessory2", 0, 12, 3, 3, 0, "earth", "water", "light"]
];

function seedKey(type, name) {
  return `${type}.${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function makeDescription(text) {
  return `<p>${text}</p>`;
}

function makeJobItems() {
  return Object.entries(FFRPG4E.jobs).map(([key, job]) => ({
    name: job.label,
    type: "job",
    img: "icons/svg/book.svg",
    system: {
      key,
      category: job.category,
      summary: job.summary,
      hpBonus: job.hp,
      mpBonus: job.mp,
      stat: job.stat,
      weaponStat: job.weaponStat,
      defenseStat: job.defenseStat,
      source: "Homebrew",
      description: makeDescription(`${job.label}: ${job.summary}.`)
    },
    flags: { [SYSTEM_ID]: { seedKey: seedKey("job", job.label) } }
  }));
}

function makeAbilityItems() {
  const items = [];
  for (const [jobKey, names] of Object.entries(abilityProfiles)) {
    const job = FFRPG4E.jobs[jobKey];
    names.forEach((name, index) => {
      const factor = index === 0 ? 3 : index === 1 ? 4 : 5;
      const mpCost = index === 0 ? 0 : index === 1 ? 8 : 16;
      const healingNames = ["Chakra", "Repair", "Tonic", "Waltz"];
      const statusNames = ["Cover", "Ward", "Guard", "Parley", "Foresight", "Tame"];
      const heals = healingNames.some((text) => name.includes(text));
      const appliesStatus = statusNames.some((text) => name.includes(text));
      const effect = heals ? "heal" : appliesStatus ? "status" : "damage";
      items.push({
        name,
        type: "ability",
        img: "icons/svg/aura.svg",
        system: {
          job: jobKey,
          actionType: index === 2 ? "slow" : "quick",
          speed: index === 2 ? 5 : 0,
          offensiveStat: job.weaponStat,
          defensiveStat: job.defenseStat,
          difficulty: effect === "status" ? 50 : 40,
          effect,
          mpCost,
          hpCost: jobKey === "darkKnight" ? 8 + index * 4 : 0,
          damageFactor: effect === "status" ? 0 : factor,
          damageStat: job.stat,
          damageType: ["magic", "support"].includes(job.category) ? "magical" : "physical",
          element: job.category === "magic" ? "light" : job.category === "magitek" ? "lightning" : job.category === "agile" ? "air" : "cut",
          source: "Homebrew",
          description: makeDescription(`${job.label} technique.`)
        },
        flags: { [SYSTEM_ID]: { seedKey: seedKey("ability", `${job.label} ${name}`) } }
      });
    });
  }
  return items;
}

function makeSpellItems() {
  return spellSeeds.map(([name, job, mpCost, effect, offensiveStat, defensiveStat, damageStat, element, damageFactor]) => ({
    name,
    type: "spell",
    img: "icons/svg/explosion.svg",
    system: {
      job,
      actionType: "quick",
      speed: 0,
      offensiveStat,
      defensiveStat,
      difficulty: ["heal", "revive"].includes(effect) ? 0 : 40,
      effect,
      mpCost,
      hpCost: 0,
      damageFactor,
      damageStat,
      damageType: effect === "damage" ? "magical" : "pure",
      element,
      source: "Final Fantasy VI",
      description: makeDescription(`Adapted from Final Fantasy VI magic.`)
    },
    flags: { [SYSTEM_ID]: { seedKey: seedKey("spell", name) } }
  }));
}

function makeEquipmentItems() {
  return equipmentSeeds.map(([name, slot, cost, level, arm, marm, damageFactor, offensiveStat, defensiveStat, element]) => ({
    name,
    type: "equipment",
    img: slot === "weapon" ? "icons/svg/sword.svg" : "icons/svg/shield.svg",
    system: {
      slot,
      equipped: false,
      actionType: "quick",
      level,
      cost,
      arm,
      marm,
      damageFactor,
      offensiveStat,
      defensiveStat,
      damageStat: offensiveStat,
      difficulty: 40,
      effect: "damage",
      damageType: slot === "weapon" ? "physical" : "pure",
      element,
      bonus: "",
      source: "Final Fantasy VI",
      description: makeDescription(`Adapted from Final Fantasy VI equipment.`)
    },
    flags: { [SYSTEM_ID]: { seedKey: seedKey("equipment", name) } }
  }));
}

export function registerContentSettings(menuClass) {
  game.settings.register(SYSTEM_ID, "contentVersion", {
    scope: "world",
    config: false,
    type: String,
    default: ""
  });
  game.settings.registerMenu(SYSTEM_ID, "contentImporter", {
    name: "FFRPG 4e Content Importer",
    label: "Import Content",
    hint: "Create or update homebrew and FF6 source content in this world.",
    icon: "fa-solid fa-file-import",
    type: menuClass,
    restricted: true
  });
}

export function buildWorldContent() {
  return [...makeJobItems(), ...makeAbilityItems(), ...makeSpellItems(), ...makeEquipmentItems()];
}

export async function getPackSourceCounts() {
  const counts = {};
  for (const pack of PACK_SOURCES) {
    const documents = await loadPackSource(pack);
    counts[pack.name] = documents.length;
  }
  return counts;
}

async function getContentFolder(itemType) {
  const name = CONTENT_FOLDERS[itemType];
  const existing = game.folders.find((folder) => folder.type === "Item" && folder.name === name);
  if (existing) return existing;
  return Folder.create({ name, type: "Item" });
}

export async function seedWorldContent(options = {}) {
  if (!game.user.isGM) return;
  const current = game.settings.get(SYSTEM_ID, "contentVersion");
  if (current === CONTENT_VERSION && !options.force) return;
  const items = buildWorldContent();
  const folders = {};
  for (const itemType of Object.keys(CONTENT_FOLDERS)) {
    folders[itemType] = await getContentFolder(itemType);
  }
  const createData = [];
  let updated = 0;
  for (const data of items) {
    data.folder = folders[data.type].id;
    const key = data.flags[SYSTEM_ID].seedKey;
    const existing = game.items.find((item) => item.getFlag(SYSTEM_ID, "seedKey") === key);
    if (existing) {
      await existing.update(data);
      updated += 1;
    } else {
      createData.push(data);
    }
  }
  if (createData.length > 0) await Item.createDocuments(createData);
  await game.settings.set(SYSTEM_ID, "contentVersion", CONTENT_VERSION);
  ui.notifications.info(`Imported ${items.length} FFRPG 4e homebrew items.`);
  return {
    total: items.length,
    created: createData.length,
    updated
  };
}

async function getNamedFolder(name, type) {
  const existing = game.folders.find((folder) => folder.type === type && folder.name === name);
  if (existing) return existing;
  return Folder.create({ name, type });
}

async function loadPackSource(pack) {
  const response = await fetch(`systems/${SYSTEM_ID}/${pack.path}`);
  const text = await response.text();
  return text.trim().split("\n").filter((line) => line.trim()).map((line) => JSON.parse(line));
}

function cloneDocumentData(data, folderId) {
  const clone = foundry.utils.deepClone(data);
  clone.folder = folderId;
  return clone;
}

async function upsertDocuments(type, documents, folderId) {
  const tools = {
    Actor: { collection: game.actors, documentClass: Actor },
    Cards: { collection: game.cards, documentClass: Cards },
    Item: { collection: game.items, documentClass: Item },
    JournalEntry: { collection: game.journal, documentClass: JournalEntry },
    Macro: { collection: game.macros, documentClass: Macro },
    Playlist: { collection: game.playlists, documentClass: Playlist },
    RollTable: { collection: game.tables, documentClass: RollTable },
  };
  const collection = tools[type].collection;
  const documentClass = tools[type].documentClass;
  const createData = [];
  let updated = 0;
  for (const data of documents) {
    const sourceKey = data.flags[SYSTEM_ID].sourceKey;
    const existing = collection.find((document) => document.getFlag(SYSTEM_ID, "sourceKey") === sourceKey);
    const clone = cloneDocumentData(data, folderId);
    if (existing) {
      delete clone._id;
      await existing.update(clone);
      updated += 1;
    } else {
      createData.push(clone);
    }
  }
  if (createData.length > 0) await documentClass.createDocuments(createData);
  return {
    created: createData.length,
    updated
  };
}

export async function importPackSourcesToWorld() {
  if (!game.user.isGM) return;
  const result = {};
  let total = 0;
  for (const pack of PACK_SOURCES) {
    if (pack.worldImport === false) continue;
    const folder = await getNamedFolder(pack.name, pack.type);
    const documents = await loadPackSource(pack);
    const imported = await upsertDocuments(pack.type, documents, folder.id);
    result[pack.name] = {
      total: documents.length,
      created: imported.created,
      updated: imported.updated
    };
    total += documents.length;
  }
  ui.notifications.info(`Imported ${total} FFRPG 4e compendium source documents.`);
  return result;
}

export async function importActorPackSourcesToWorld() {
  if (!game.user.isGM) return;
  const result = {};
  let total = 0;
  const actorPacks = PACK_SOURCES.filter((pack) => pack.type === "Actor");
  for (const pack of actorPacks) {
    const folder = await getNamedFolder(pack.name, pack.type);
    const documents = await loadPackSource(pack);
    const imported = await upsertDocuments(pack.type, documents, folder.id);
    result[pack.name] = {
      total: documents.length,
      created: imported.created,
      updated: imported.updated
    };
    total += documents.length;
  }
  ui.notifications.info(`Imported ${total} FFRPG 4e actors.`);
  return result;
}
