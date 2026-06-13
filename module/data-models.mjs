const { BooleanField, HTMLField, NumberField, SchemaField, StringField } = foundry.data.fields;

class ActorDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      biography: new HTMLField({ required: true, blank: true }),
      level: new NumberField({ required: true, integer: true, min: 1, initial: 1 }),
      gil: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      jobs: new SchemaField({
        primary: new StringField({ required: true, blank: true, initial: "" }),
        secondary: new StringField({ required: true, blank: true, initial: "" })
      }),
      resources: new SchemaField({
        hp: new SchemaField({
          value: new NumberField({ required: true, integer: true, min: 0, initial: 20 }),
          max: new NumberField({ required: true, integer: true, min: 0, initial: 20 })
        }),
        mp: new SchemaField({
          value: new NumberField({ required: true, integer: true, min: 0, initial: 5 }),
          max: new NumberField({ required: true, integer: true, min: 0, initial: 5 })
        })
      }),
      stats: new SchemaField({
        earth: new SchemaField({ value: new NumberField({ required: true, integer: true, min: 0, max: 255, initial: 10 }) }),
        air: new SchemaField({ value: new NumberField({ required: true, integer: true, min: 0, max: 255, initial: 10 }) }),
        fire: new SchemaField({ value: new NumberField({ required: true, integer: true, min: 0, max: 255, initial: 10 }) }),
        water: new SchemaField({ value: new NumberField({ required: true, integer: true, min: 0, max: 255, initial: 10 }) })
      }),
      skills: new SchemaField({
        acrobatics: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        animalHandling: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        bluff: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        charisma: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        climbing: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        infiltration: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        intimidation: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        jumping: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        magic: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        medicine: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        perception: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        swimming: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        systems: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        thievery: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        vehicles: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        wilderness: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
      }),
      combat: new SchemaField({
        arm: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        marm: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        statuses: new StringField({ required: true, blank: true, initial: "" }),
        defeated: new BooleanField({ required: true, initial: false }),
        ai: new StringField({ required: true, blank: true, initial: "manual" }),
        actions: new SchemaField({
          quickUsed: new BooleanField({ required: true, initial: false }),
          slowUsed: new BooleanField({ required: true, initial: false }),
          reactionUsed: new BooleanField({ required: true, initial: false })
        }),
        rewards: new SchemaField({
          exp: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
          ap: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
        })
      }),
      elements: new SchemaField({
        crush: new StringField({ required: true, blank: true, initial: "normal" }),
        puncture: new StringField({ required: true, blank: true, initial: "normal" }),
        cut: new StringField({ required: true, blank: true, initial: "normal" }),
        fire: new StringField({ required: true, blank: true, initial: "normal" }),
        ice: new StringField({ required: true, blank: true, initial: "normal" }),
        lightning: new StringField({ required: true, blank: true, initial: "normal" }),
        air: new StringField({ required: true, blank: true, initial: "normal" }),
        earth: new StringField({ required: true, blank: true, initial: "normal" }),
        water: new StringField({ required: true, blank: true, initial: "normal" }),
        bio: new StringField({ required: true, blank: true, initial: "normal" }),
        light: new StringField({ required: true, blank: true, initial: "normal" }),
        shadow: new StringField({ required: true, blank: true, initial: "normal" })
      })
    };
  }
}

export class CharacterDataModel extends ActorDataModel {}

export class NpcDataModel extends ActorDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      boss: new BooleanField({ required: true, initial: false })
    };
  }
}

class ItemDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new HTMLField({ required: true, blank: true }),
      source: new StringField({ required: true, blank: true, initial: "Homebrew" })
    };
  }
}

export class JobDataModel extends ItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      key: new StringField({ required: true, blank: true, initial: "" }),
      category: new StringField({ required: true, blank: true, initial: "" }),
      summary: new StringField({ required: true, blank: true, initial: "" }),
      hpBonus: new NumberField({ required: true, integer: true, initial: 0 }),
      mpBonus: new NumberField({ required: true, integer: true, initial: 0 }),
      stat: new StringField({ required: true, blank: true, initial: "" }),
      weaponStat: new StringField({ required: true, blank: true, initial: "" }),
      defenseStat: new StringField({ required: true, blank: true, initial: "" })
    };
  }
}

export class AbilityDataModel extends ItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      job: new StringField({ required: true, blank: true, initial: "" }),
      actionType: new StringField({ required: true, blank: true, initial: "quick" }),
      speed: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      offensiveStat: new StringField({ required: true, blank: true, initial: "earth" }),
      defensiveStat: new StringField({ required: true, blank: true, initial: "earth" }),
      difficulty: new NumberField({ required: true, integer: true, min: 0, initial: 40 }),
      effect: new StringField({ required: true, blank: true, initial: "damage" }),
      mpCost: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      hpCost: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      damageFactor: new NumberField({ required: true, min: 0, initial: 1 }),
      damageStat: new StringField({ required: true, blank: true, initial: "earth" }),
      damageType: new StringField({ required: true, blank: true, initial: "physical" }),
      element: new StringField({ required: true, blank: true, initial: "cut" })
    };
  }
}

export class SpellDataModel extends ItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      job: new StringField({ required: true, blank: true, initial: "" }),
      actionType: new StringField({ required: true, blank: true, initial: "quick" }),
      speed: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      offensiveStat: new StringField({ required: true, blank: true, initial: "fire" }),
      defensiveStat: new StringField({ required: true, blank: true, initial: "water" }),
      difficulty: new NumberField({ required: true, integer: true, min: 0, initial: 40 }),
      effect: new StringField({ required: true, blank: true, initial: "damage" }),
      mpCost: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      hpCost: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      damageFactor: new NumberField({ required: true, min: 0, initial: 1 }),
      damageStat: new StringField({ required: true, blank: true, initial: "fire" }),
      damageType: new StringField({ required: true, blank: true, initial: "magical" }),
      element: new StringField({ required: true, blank: true, initial: "fire" })
    };
  }
}

export class EquipmentDataModel extends ItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      slot: new StringField({ required: true, blank: true, initial: "weapon" }),
      equipped: new BooleanField({ required: true, initial: false }),
      actionType: new StringField({ required: true, blank: true, initial: "quick" }),
      level: new NumberField({ required: true, integer: true, min: 1, initial: 1 }),
      cost: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      arm: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      marm: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      damageFactor: new NumberField({ required: true, min: 0, initial: 1 }),
      offensiveStat: new StringField({ required: true, blank: true, initial: "earth" }),
      defensiveStat: new StringField({ required: true, blank: true, initial: "earth" }),
      damageStat: new StringField({ required: true, blank: true, initial: "earth" }),
      difficulty: new NumberField({ required: true, integer: true, min: 0, initial: 40 }),
      effect: new StringField({ required: true, blank: true, initial: "damage" }),
      damageType: new StringField({ required: true, blank: true, initial: "physical" }),
      element: new StringField({ required: true, blank: true, initial: "cut" }),
      bonus: new StringField({ required: true, blank: true, initial: "" })
    };
  }
}
