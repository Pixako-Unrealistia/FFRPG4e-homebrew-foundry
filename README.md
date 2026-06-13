# FFRPG 4e Homebrew Foundry System

Foundry VTT system based on Final Fantasy RPG 4th Edition - Remastered.
Changes are made to specifically tailor for final fantasy 6 content.


## Status

- System version: `0.3.9`
- Foundry target: v14
- Latest Foundry release checked during setup: v14 build 364, June 10, 2026
- System id: `ffrpg4e-homebrew-foundry`
- Local folder name must be: `ffrpg4e-homebrew-foundry`

## Install

Manifest URL:

`https://raw.githubusercontent.com/Pixako-Unrealistia/FFRPG4e-homebrew-foundry/main/system.json`

Download URL:

`https://github.com/Pixako-Unrealistia/FFRPG4e-homebrew-foundry/archive/refs/heads/main.zip`

The manifest install works after this repo is pushed and available to Foundry.

## Compendium Packs

The system ships multiple compendium packs:

- `Homebrew Jobs`: 33 Item documents
- `Homebrew Abilities`: 99 Item documents
- `FF6 Spells`: 76 Item documents
- `FF6 Equipment`: 132 Item documents
- `FF6 Playable Characters`: 14 Actor documents
- `FF6 Guests And Story Characters`: 22 Actor documents
- `FF6 Enemies`: 275 Actor documents
- `FF6 Bosses`: 110 Actor documents
- `FF6 Random Encounters`: 24 RollTable documents
- `FF6 Boss Encounters`: 110 JournalEntry documents
- `FF6 Loot Tables`: 385 RollTable documents
- `FF6 Macros`: 21 Macro documents
- `FF6 Cards`: 3 Cards documents
- `FF6 Playlists`: 4 Playlist documents
- `FF6 Adventures`: 8 Adventure documents
- `FF6 Progression`: 8 JournalEntry documents
- `FF6 Shops`: 12 RollTable documents
- `FF6 Treasures`: 24 RollTable documents
- `FF6 Vehicles`: 5 Actor documents

Total compendium documents: 1365

Import path:

`Game Settings > Configure Settings > FFRPG 4e Homebrew > Import Content`

The importer can create or update item seeds, actors, and world document pack sources. Adventure documents stay in their compendium pack.

## Seeded Content

On first GM load in a world, the system creates or updates seeded items, actor pack sources, and macros in separate folders:

- `FFRPG 4e Jobs`
- `FFRPG 4e Abilities`
- `FFRPG 4e Spells`
- `FFRPG 4e Equipment`
- `FF6 Playable Characters`
- `FF6 Guests And Story Characters`
- `FF6 Enemies`
- `FF6 Bosses`
- `FF6 Vehicles`
- `FF6 Macros`

Seed version: `0.3.6`

Seeded item count:

- Jobs: 33
- Abilities: 99
- Spells: 76
- Equipment: 132
- Total: 340

Seeded actor count:

- Playable Characters: 14
- Guests And Story Characters: 22
- Enemies: 275
- Bosses: 110
- Vehicles: 5
- Total: 426

Seeded macro count:

- Macros: 21

## Macros

- `Roll FFRPG Challenge`
- `Roll Selected Initiative`
- `Roll Selected Basic Attack`
- `Reset Selected Actions`
- `Apply Damage To Selected`
- `Heal Selected`
- `Heal Selected To Full`
- `Toggle Selected KO`
- `Roll Random Encounter`
- `Choose Random Encounter`
- `Roll Loot`
- `Choose Loot Table`
- `Shop Stock Roll`
- `Roll Treasure`
- `Blue Magic Learn Check`
- `Time Magic Initiative Shift`
- `Open Playable Characters`
- `Open Enemies`
- `Open Bosses`
- `Open Spells`
- `Open Equipment`

## Actor Types

- Character
- NPC

## Item Types

- Job
- Ability
- Spell
- Equipment

## Mechanics

- Earth, Air, Fire, and Water stats
- Stat level derived from each stat value divided by 10
- Character level derived from total stat levels
- HP and MP resources
- Suggested HP and MP from selected primary and secondary jobs
- Challenge rolls with skill rerolls
- 3d10 initiative rolls
- Initiative updates the Foundry Combat Tracker for selected tokens
- Combat rolls using offensive stat vs difficulty plus target defensive stat
- Damage roll digit added to base damage
- Physical damage mitigated by ARM
- Magical damage mitigated by MARM
- Elemental weakness, resistance, immunity, and absorption
- Damage, heal, revive, and status effects
- Embedded item ActiveEffects apply to hit targets
- Quick, slow, reaction, and free action economy
- KO state at 0 HP with Combat Tracker defeated sync
- NPC AI turn automation
- Combat reward collection for gil, EXP, and AP
- Combat chat buttons for applying effects and collecting rewards
- HP and MP action costs
- Equipped weapon, armor, and accessory support
- Targeted damage and healing against selected tokens

## Homebrew Jobs And Abilities

- Warrior (weapon fighter): Power Break, Armor Break, Cleave
- Knight (defensive protector): Cover, Sentinel, Shield Bash
- Dragoon (spear & jump): Jump, Lancet, Dragon Dive
- Monk (martial artist): Blitz Rush, Chakra, Rising Phoenix
- Samurai (disciplined swordmaster): Bushido Strike, Iai Draw, Dragon Fang
- Berserker (rage attacker): Rage, Skullsplitter, Wild Swing
- Dark Knight (power at a price): Darkside, Souleater, Abyss Blade
- Thief (steal & sneak): Steal, Mug, Vanish Step
- Ninja (fast assassin): Throw, Shadowbind, Mirror Image
- Assassin (ambush specialist): Backstab, Death Mark, Silent Knife
- Scout (explorer skirmisher): Aim, Expose Weakness, Skirmish
- Treasure Hunter (rogue adventurer): Lucky Find, Trap Sense, Pilfer
- Dancer (agile performer): Wind Rhapsody, Blade Dance, Healing Waltz
- Black Mage (offensive magic): Arcane Focus, Elemental Burst, Mana Surge
- White Mage (healing magic): Prayer, Radiant Ward, Life Chant
- Red Mage (blade & magic): Dualcast, Spellblade, Riposte
- Summoner (calls espers): Esper Call, Maduin Pact, Bahamut Sign
- Blue Mage (learns monster skills): Learn, Aqua Breath, Mighty Guard
- Time Mage (speed and time): Temporal Slip, Quick Step, Stopwatch
- Geomancer (terrain magic): Terrain, Cave In, Wind Slash
- Sage (master scholar): Analyze, Grand Lore, Dual Thesis
- Machinist (tools & firearms): Auto Crossbow, Drill, Noiseblaster
- Engineer (repairs machines): Repair, Overclock, Barrier Generator
- Magitek Pilot (armor operator): Magitek Beam, Armor Guard, Tek Missile
- Gunner (ranged specialist): Charged Shot, Suppressing Fire, Ricochet
- Chemist (mixes items): Mix, Remedy Bomb, Mega Tonic
- Artificer (magical devices): Runic Device, Ether Cell, Magicite Mine
- Bard (music support): Heroic Anthem, Requiem, Encore
- Gambler (luck-based tricks): Slots, Dice Toss, Double Down
- Beastmaster (controls monsters): Command Beast, Rage Call, Tame
- Mediator (talks enemies down): Parley, Intimidating Offer, Ceasefire
- Oracle (visions & curses): Omen, Curse, Foresight
- Merchant (supplies & bargaining): Gil Toss, Stockpile, Supply Drop

## FF6-Based Spells

- Cure
- Cura
- Curaga
- Regen
- Poisona
- Esuna
- Raise
- Arise
- Reraise
- Fire
- Fira
- Firaga
- Blizzard
- Blizzara
- Blizzaga
- Thunder
- Thundara
- Thundaga
- Poison
- Bio
- Drain
- Osmose
- Flare
- Ultima
- Meteor
- Meltdown
- Holy
- Libra
- Slow
- Haste
- Stop
- Quick
- Float
- Teleport
- Dispel
- Protect
- Shell
- Reflect
- Sleep
- Confuse
- Berserk
- Imp
- Vanish
- Gravity
- Graviga
- Banish
- Quake
- Tornado
- Aqua Breath
- Mighty Guard
- White Wind
- Bad Breath
- 1000 Needles
- Level 5 Death
- Level 4 Flare
- Level 3 Confuse
- Traveler
- Revenge Blast
- Stone
- Rippler
- Quasar
- Grand Delta
- Force Field
- Transfusion
- Dischord
- Self-Destruct
- Roulette
- Tsunami
- Slowga
- Hastega
- Delay
- Accelerate
- Rewind
- Stasis
- Countdown
- Comet

## FF6-Based Equipment

- Dagger
- Mythril Knife
- Air Knife
- Thief's Knife
- Assassin's Dagger
- Valiant Knife
- Mythril Sword
- Flametongue
- Icebrand
- Thunder Blade
- Excalibur
- Ragnarok
- Ultima Weapon
- Heavy Lance
- Partisan
- Holy Lance
- Ashura
- Kotetsu
- Kazekiri
- Murasame
- Tigerfang
- Dragon Claws
- Mythril Rod
- Flame Rod
- Ice Rod
- Thunder Rod
- Magus Rod
- Healing Rod
- Cards
- Dice
- Fixed Dice
- Chocobo Brush
- Magical Brush
- Auto Crossbow
- Noiseblaster
- Drill
- Chainsaw
- Cotton Robe
- Silk Robe
- Mystery Veil
- Leather Armor
- Mythril Vest
- Force Armor
- Genji Armor
- Aegis Shield
- Hero's Ring
- Ribbon
- Genji Glove
- Offering
- Gale Hairpin
- Dragoon Boots
- Zephyr Cloak
- Dirk
- Guardian
- Swordbreaker
- Man-Eater
- Graedus
- Great Sword
- Rune Blade
- Bastard Sword
- Blood Sword
- Soul Sabre
- Break Blade
- Enhancer
- Crystal Sword
- Falchion
- Organyx
- Lightbringer
- Mythril Spear
- Trident
- Stout Spear
- Radiant Lance
- Kiku-ichimonji
- Aura
- Strato
- Sky Render
- Metal Knuckle
- Mythril Claws
- Kaiser Knuckles
- Venom Claws
- Burning Fist
- Blizzard Orb
- Sniper
- Wing Edge
- Punisher
- Gravity Rod
- Rainbow Brush
- Buckler
- Heavy Shield
- Mythril Shield
- Gold Shield
- Diamond Shield
- Flame Shield
- Ice Shield
- Thunder Shield
- Crystal Shield
- Genji Shield
- Paladin Shield
- Plumed Hat
- Green Beret
- Magus Hat
- Bard's Hat
- Circlet
- Red Cap
- Cat-Ear Hood
- Leather Hat
- Regal Crown
- Diamond Helm
- Genji Helm
- Minerva Bustier
- Mirage Vest
- Snow Scarf
- Behemoth Suit
- Sprint Shoes
- Hermes Sandals
- Reflect Ring
- Jeweled Ring
- Fairy Ring
- Barrier Ring
- Mythril Glove
- Hyper Wrist
- Black Belt
- Thief's Bracer
- Safety Bit
- Memento Ring
- Celestriad
- Soul of Thamasa
- Growth Egg
- Master's Scroll
- Dragon Horn
- Muscle Belt
- Guard Bracelet

## Sources

- Foundry release notes: `https://foundryvtt.com/releases/`
- Foundry system development docs: `https://foundryvtt.com/article/system-development/`
- FF6 Magic reference: `https://www.cavesofnarshe.com/ff6/magic.php`
- FF6 Weapons reference: `https://www.cavesofnarshe.com/ff6/weapons.php`
- FF6 Armor reference: `https://www.cavesofnarshe.com/ff6/armor.php`
- FF6 Relics reference: `https://www.cavesofnarshe.com/ff6/relics.php`
- FF6 Bestiary reference: `https://www.cavesofnarshe.com/ff6/enemies.php`
- FF6 Boss reference: `https://www.cavesofnarshe.com/ff6/enemies.php?type=bosses`
