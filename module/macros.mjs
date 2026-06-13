const SYSTEM_ID = "ffrpg4e-homebrew-foundry";

const PACKS = {
  encounters: "ff6-random-encounters",
  loot: "ff6-loot-tables",
  shops: "ff6-shops",
  treasures: "ff6-treasures",
  actors: "ff6-playable-characters",
  enemies: "ff6-enemies",
  bosses: "ff6-bosses",
  spells: "ff6-spells",
  equipment: "ff6-equipment"
};

function collection(packName) {
  const pack = game.packs.get(`${SYSTEM_ID}.${packName}`);
  if (!pack) throw new Error(`Missing pack: ${packName}`);
  return pack;
}

async function documents(packName) {
  return (await collection(packName).getDocuments()).sort((left, right) => left.name.localeCompare(right.name));
}

function randomDocument(docs) {
  if (docs.length === 0) throw new Error("No documents available.");
  return docs[Math.floor(Math.random() * docs.length)];
}

function promptText(title, text, value = "") {
  const result = window.prompt(`${title}\n\n${text}`, value);
  if (result === null) return null;
  return result.trim();
}

function promptNumber(title, text, value, minimum, maximum) {
  const result = promptText(title, text, String(value));
  if (result === null) return null;
  const number = Number(result);
  if (!Number.isInteger(number) || number < minimum || number > maximum) throw new Error(`Enter a number from ${minimum} to ${maximum}.`);
  return number;
}

async function chooseDocument(docs, title, searchText = "") {
  let candidates = docs;
  if (candidates.length > 30) {
    const search = promptText(title, "Type part of the name.", searchText);
    if (search === null) return null;
    candidates = candidates.filter((document) => document.name.toLowerCase().includes(search.toLowerCase()));
    if (candidates.length === 0) throw new Error(`No match for ${search}.`);
    if (candidates.length > 30) throw new Error("Too many matches. Use a narrower search.");
  }
  if (candidates.length === 1) return candidates[0];
  const list = candidates.map((document, index) => `${index + 1}. ${document.name}`).join("\n");
  const choice = promptNumber(title, list, 1, 1, candidates.length);
  if (choice === null) return null;
  return candidates[choice - 1];
}

async function drawTable(table, flavor) {
  ui.notifications.info(`Rolling ${table.name}.`);
  return table.draw({
    displayChat: true,
    rollMode: game.settings.get("core", "rollMode"),
    flavor
  });
}

function selectedTokens() {
  const tokens = canvas.tokens.controlled;
  if (tokens.length === 0) throw new Error("Select at least one token.");
  return tokens;
}

function selectedActor() {
  const tokens = selectedTokens();
  if (tokens.length !== 1) throw new Error("Select exactly one token.");
  const actor = tokens[0].actor;
  if (!actor) throw new Error("Selected token has no actor.");
  return actor;
}

function selectedCombatant(actor) {
  const token = canvas.tokens.controlled.find((token) => token.actor?.id === actor.id);
  const combatant = game.combat?.combatants.find((combatant) => combatant.tokenId === token?.id);
  if (!combatant) throw new Error("Selected token is not in combat.");
  return combatant;
}

function actorBestiary(actor) {
  const sourceKey = actor.getFlag(SYSTEM_ID, "sourceKey") || "";
  const match = sourceKey.match(/^ff6\.(enemy|boss)\.(\d+)\./);
  if (!match) throw new Error("Selected actor has no FF6 bestiary source key.");
  return match[2];
}

function packRender(packName) {
  collection(packName).render(true);
}

export async function rollRandomEncounter() {
  const table = randomDocument(await documents(PACKS.encounters));
  return drawTable(table, `Random Encounter: ${table.name}`);
}

export async function chooseRandomEncounter() {
  const table = await chooseDocument(await documents(PACKS.encounters), "Choose Encounter Table");
  if (!table) return;
  return drawTable(table, `Encounter: ${table.name}`);
}

export async function rollLoot() {
  const actor = selectedActor();
  const bestiary = actorBestiary(actor);
  const tableName = `${actor.name} #${bestiary} Loot`;
  const table = (await documents(PACKS.loot)).find((document) => document.name === tableName);
  if (!table) throw new Error(`Missing loot table: ${tableName}`);
  return drawTable(table, `Loot: ${actor.name}`);
}

export async function chooseLootTable() {
  const table = await chooseDocument(await documents(PACKS.loot), "Choose Loot Table");
  if (!table) return;
  return drawTable(table, `Loot: ${table.name}`);
}

export async function rollShopStock() {
  const table = await chooseDocument(await documents(PACKS.shops), "Choose Shop");
  if (!table) return;
  const count = promptNumber("Shop Stock", "How many stock rolls?", 3, 1, 10);
  if (count === null) return;
  for (let index = 0; index < count; index += 1) await drawTable(table, `Shop Stock: ${table.name}`);
}

export async function rollTreasure() {
  const table = await chooseDocument(await documents(PACKS.treasures), "Choose Treasure Table");
  if (!table) return;
  return drawTable(table, `Treasure: ${table.name}`);
}

export async function rollChallenge() {
  const actor = selectedActor();
  const keys = Object.keys(CONFIG.FFRPG4E.skills);
  const list = keys.map((key, index) => `${index + 1}. ${CONFIG.FFRPG4E.skills[key].label}`).join("\n");
  const choice = promptNumber("Challenge", list, 1, 1, keys.length);
  if (choice === null) return;
  const difficulty = promptNumber("Challenge", "Difficulty?", 50, 1, 999);
  if (difficulty === null) return;
  return actor.rollChallenge(keys[choice - 1], difficulty);
}

export async function rollSelectedInitiative() {
  for (const token of selectedTokens()) {
    if (!token.actor) throw new Error("Selected token has no actor.");
    await token.actor.rollInitiativeDice();
  }
}

export async function rollSelectedBasicAttack() {
  return selectedActor().rollBasicAttack();
}

export async function resetSelectedActions() {
  for (const token of selectedTokens()) {
    if (!token.actor) throw new Error("Selected token has no actor.");
    await token.actor.resetTurnActions();
  }
  ui.notifications.info("Reset selected token actions.");
}

export async function applyDamageToSelected() {
  const amount = promptNumber("Damage", "Damage amount?", 10, 1, 99999);
  if (amount === null) return;
  for (const token of selectedTokens()) {
    if (!token.actor) throw new Error("Selected token has no actor.");
    await token.actor.applyDamage(amount);
  }
}

export async function healSelected() {
  const amount = promptNumber("Healing", "Healing amount?", 10, 1, 99999);
  if (amount === null) return;
  for (const token of selectedTokens()) {
    if (!token.actor) throw new Error("Selected token has no actor.");
    await token.actor.heal(amount);
  }
}

export async function healSelectedToFull() {
  for (const token of selectedTokens()) {
    if (!token.actor) throw new Error("Selected token has no actor.");
    await token.actor.update({
      "system.resources.hp.value": token.actor.system.resources.hp.max,
      "system.resources.mp.value": token.actor.system.resources.mp.max,
      "system.combat.defeated": false
    });
    await token.actor.setCombatDefeated(false);
  }
}

export async function toggleSelectedKo() {
  const actor = selectedActor();
  if (actor.system.combat.defeated || actor.system.resources.hp.value === 0) {
    await actor.restoreHp(1);
    return;
  }
  await actor.applyDamage(actor.system.resources.hp.value);
}

export async function blueMagicLearnCheck() {
  const actor = selectedActor();
  const difficulty = promptNumber("Blue Magic", "Learn difficulty?", 50, 1, 999);
  if (difficulty === null) return;
  const roll = await new Roll(`3d10 + ${actor.system.stats.water.value}`).evaluate();
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: roll.total >= difficulty ? "Blue Magic Learned" : "Blue Magic Learn Failed"
  });
  return roll;
}

export async function timeMagicInitiativeShift() {
  const actor = selectedActor();
  const combatant = selectedCombatant(actor);
  const direction = promptText("Time Magic", "Type + to hasten or - to delay.", "+");
  if (direction === null) return;
  if (!["+", "-"].includes(direction)) throw new Error("Type + or -.");
  const roll = await new Roll("1d10").evaluate();
  const sign = direction === "+" ? 1 : -1;
  await combatant.update({ initiative: (combatant.initiative || 0) + sign * roll.total });
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: direction === "+" ? "Time Magic Initiative Haste" : "Time Magic Initiative Delay"
  });
  return roll;
}

export function openPlayableCharacters() {
  packRender(PACKS.actors);
}

export function openEnemies() {
  packRender(PACKS.enemies);
}

export function openBosses() {
  packRender(PACKS.bosses);
}

export function openSpells() {
  packRender(PACKS.spells);
}

export function openEquipment() {
  packRender(PACKS.equipment);
}
