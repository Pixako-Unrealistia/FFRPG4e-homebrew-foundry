export const FFRPG4E = {
  stats: {
    earth: "Earth",
    air: "Air",
    fire: "Fire",
    water: "Water"
  },
  skills: {
    acrobatics: { label: "Acrobatics", stat: "air" },
    animalHandling: { label: "Animal Handling", stat: "water" },
    bluff: { label: "Bluff", stat: "water" },
    charisma: { label: "Charisma", stat: "water" },
    climbing: { label: "Climbing", stat: "earth" },
    infiltration: { label: "Infiltration", stat: "fire" },
    intimidation: { label: "Intimidation", stat: "earth" },
    jumping: { label: "Jumping", stat: "earth" },
    magic: { label: "Magic", stat: "water" },
    medicine: { label: "Medicine", stat: "fire" },
    perception: { label: "Perception", stat: "fire" },
    swimming: { label: "Swimming", stat: "earth" },
    systems: { label: "Systems", stat: "fire" },
    thievery: { label: "Thievery", stat: "air" },
    vehicles: { label: "Vehicles", stat: "air" },
    wilderness: { label: "Wilderness", stat: "water" }
  },
  elements: {
    crush: "Crush",
    puncture: "Puncture",
    cut: "Cut",
    fire: "Fire",
    ice: "Ice",
    lightning: "Lightning",
    air: "Air",
    earth: "Earth",
    water: "Water",
    bio: "Bio",
    light: "Light",
    shadow: "Shadow"
  },
  damageTypes: {
    physical: "Physical",
    magical: "Magical",
    pure: "Pure"
  },
  effects: {
    damage: "Damage",
    heal: "Heal",
    revive: "Revive",
    status: "Status"
  },
  elementAffinities: {
    normal: "Normal",
    weak: "Weak",
    resist: "Resist",
    immune: "Immune",
    absorb: "Absorb"
  },
  aiTypes: {
    manual: "Manual",
    attacker: "Attacker",
    caster: "Caster",
    defender: "Defender",
    healer: "Healer"
  },
  actionTypes: {
    quick: "Quick",
    slow: "Slow",
    reaction: "Reaction",
    free: "Free"
  },
  statuses: {
    poison: "Poison",
    blind: "Blind",
    silence: "Silence",
    sleep: "Sleep",
    slow: "Slow",
    haste: "Haste",
    stop: "Stop",
    petrify: "Petrify",
    confuse: "Confuse",
    berserk: "Berserk",
    protect: "Protect",
    shell: "Shell",
    regen: "Regen",
    doom: "Doom"
  },
  equipmentSlots: {
    weapon: "Weapon",
    armor: "Armor",
    accessory1: "Accessory 1",
    accessory2: "Accessory 2"
  },
  jobCategories: {
    physical: "Physical Combat",
    agile: "Agile & Stealth",
    magic: "Magic",
    magitek: "Magitek & Technology",
    support: "Support & Social"
  },
  jobs: {
    warrior: { label: "Warrior", category: "physical", summary: "weapon fighter", stat: "earth", hp: 18, mp: 2, weaponStat: "earth", defenseStat: "earth" },
    knight: { label: "Knight", category: "physical", summary: "defensive protector", stat: "earth", hp: 20, mp: 2, weaponStat: "earth", defenseStat: "water" },
    dragoon: { label: "Dragoon", category: "physical", summary: "spear & jump", stat: "air", hp: 16, mp: 3, weaponStat: "air", defenseStat: "air" },
    monk: { label: "Monk", category: "physical", summary: "martial artist", stat: "earth", hp: 18, mp: 3, weaponStat: "earth", defenseStat: "earth" },
    samurai: { label: "Samurai", category: "physical", summary: "disciplined swordmaster", stat: "air", hp: 16, mp: 4, weaponStat: "air", defenseStat: "fire" },
    berserker: { label: "Berserker", category: "physical", summary: "rage attacker", stat: "earth", hp: 22, mp: 1, weaponStat: "earth", defenseStat: "earth" },
    darkKnight: { label: "Dark Knight", category: "physical", summary: "power at a price", stat: "earth", hp: 18, mp: 5, weaponStat: "earth", defenseStat: "water" },
    thief: { label: "Thief", category: "agile", summary: "steal & sneak", stat: "air", hp: 12, mp: 4, weaponStat: "air", defenseStat: "air" },
    ninja: { label: "Ninja", category: "agile", summary: "fast assassin", stat: "air", hp: 13, mp: 5, weaponStat: "air", defenseStat: "air" },
    assassin: { label: "Assassin", category: "agile", summary: "ambush specialist", stat: "air", hp: 14, mp: 4, weaponStat: "air", defenseStat: "fire" },
    scout: { label: "Scout", category: "agile", summary: "explorer skirmisher", stat: "air", hp: 14, mp: 4, weaponStat: "air", defenseStat: "water" },
    treasureHunter: { label: "Treasure Hunter", category: "agile", summary: "rogue adventurer", stat: "air", hp: 13, mp: 5, weaponStat: "air", defenseStat: "air" },
    dancer: { label: "Dancer", category: "agile", summary: "agile performer", stat: "air", hp: 12, mp: 6, weaponStat: "air", defenseStat: "water" },
    blackMage: { label: "Black Mage", category: "magic", summary: "offensive magic", stat: "fire", hp: 9, mp: 10, weaponStat: "fire", defenseStat: "water" },
    whiteMage: { label: "White Mage", category: "magic", summary: "healing magic", stat: "water", hp: 10, mp: 10, weaponStat: "water", defenseStat: "water" },
    redMage: { label: "Red Mage", category: "magic", summary: "blade & magic", stat: "fire", hp: 13, mp: 7, weaponStat: "fire", defenseStat: "air" },
    summoner: { label: "Summoner", category: "magic", summary: "calls espers", stat: "fire", hp: 9, mp: 11, weaponStat: "fire", defenseStat: "water" },
    blueMage: { label: "Blue Mage", category: "magic", summary: "learns monster skills", stat: "water", hp: 12, mp: 8, weaponStat: "water", defenseStat: "water" },
    timeMage: { label: "Time Mage", category: "magic", summary: "speed and time", stat: "fire", hp: 10, mp: 10, weaponStat: "fire", defenseStat: "air" },
    geomancer: { label: "Geomancer", category: "magic", summary: "terrain magic", stat: "fire", hp: 12, mp: 8, weaponStat: "fire", defenseStat: "earth" },
    sage: { label: "Sage", category: "magic", summary: "master scholar", stat: "fire", hp: 8, mp: 12, weaponStat: "fire", defenseStat: "water" },
    machinist: { label: "Machinist", category: "magitek", summary: "tools & firearms", stat: "fire", hp: 13, mp: 5, weaponStat: "fire", defenseStat: "air" },
    engineer: { label: "Engineer", category: "magitek", summary: "repairs machines", stat: "fire", hp: 12, mp: 6, weaponStat: "fire", defenseStat: "earth" },
    magitekPilot: { label: "Magitek Pilot", category: "magitek", summary: "armor operator", stat: "earth", hp: 17, mp: 5, weaponStat: "earth", defenseStat: "earth" },
    gunner: { label: "Gunner", category: "magitek", summary: "ranged specialist", stat: "air", hp: 13, mp: 4, weaponStat: "air", defenseStat: "air" },
    chemist: { label: "Chemist", category: "magitek", summary: "mixes items", stat: "fire", hp: 11, mp: 7, weaponStat: "fire", defenseStat: "water" },
    artificer: { label: "Artificer", category: "magitek", summary: "magical devices", stat: "fire", hp: 11, mp: 8, weaponStat: "fire", defenseStat: "water" },
    bard: { label: "Bard", category: "support", summary: "music support", stat: "water", hp: 12, mp: 7, weaponStat: "water", defenseStat: "water" },
    gambler: { label: "Gambler", category: "support", summary: "luck-based tricks", stat: "air", hp: 12, mp: 6, weaponStat: "air", defenseStat: "fire" },
    beastmaster: { label: "Beastmaster", category: "support", summary: "controls monsters", stat: "water", hp: 15, mp: 5, weaponStat: "water", defenseStat: "earth" },
    mediator: { label: "Mediator", category: "support", summary: "talks enemies down", stat: "water", hp: 11, mp: 8, weaponStat: "water", defenseStat: "water" },
    oracle: { label: "Oracle", category: "support", summary: "visions & curses", stat: "water", hp: 10, mp: 10, weaponStat: "water", defenseStat: "fire" },
    merchant: { label: "Merchant", category: "support", summary: "supplies & bargaining", stat: "water", hp: 13, mp: 6, weaponStat: "water", defenseStat: "water" }
  }
};
