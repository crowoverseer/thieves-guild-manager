import {
  Member,
  GuildState,
  ClassType,
  GuildFocus,
  MonthLog,
  MemberRank,
  GuildAsset,
} from "../types";
import {
  getRevenueForLevel,
  MAX_REVENUE_BY_MC,
  MARKET_CLASS_LIMITS,
  POTENTIAL_RECRUITS_PER_MC,
  BOON_TABLE_1D20,
  BANE_TABLE_1D20,
} from "../constants";

const rollDice = (sides: number) => Math.floor(Math.random() * sides) + 1;

const NAMES = [
  "Garret",
  "Shadow",
  "Silas",
  "Kael",
  "Vex",
  "Lysandra",
  "Thistle",
  "Rook",
  "Mire",
  "Fen",
  "Jax",
  "Cinder",
  "Briar",
  "Slink",
  "Nyx",
  "Ember",
  "Onyx",
  "Talon",
  "Swift",
  "Bane",
  "Gale",
  "Kestrel",
  "Revenant",
  "Wraith",
  "Grim",
  "Soot",
  "Echo",
  "Viper",
  "Rat",
  "Mouse",
  "Pike",
  "Shale",
  "Flint",
  "Ash",
  "Dagger",
  "Hook",
  "Locke",
  "Key",
  "Coin",
  "Ghost",
  "Rattle",
  "Shadow-Step",
  "Silent-Toe",
  "Night-Owl",
  "Spider",
  "Cricket",
  "Moth",
  "Whisper",
  "Stiletto",
  "Bleak",
  "Dusk",
  "Gloam",
  "Sable",
  "Knave",
  "Sly",
  "Pockets",
  "Nimble",
];

const BACKSTORIES = [
  "Orphan of the docks",
  "Former noble in exile",
  "Failed wizard's apprentice",
  "Ex-soldier looking for coin",
  "Escaped indentured servant",
  "Street urchin grown bold",
  "Traveling performer",
  "Cast out from a local temple",
  "Dishonored city watchman",
  "Shipwreck survivor",
  "Rogue scholar",
  "Blacksmith's runaway son",
  "Gambler with too many debts",
  "Ex-jailer who saw too much",
  "Refugee from a distant war",
  "Stable hand with fast fingers",
  "Distant relative of a pirate",
  "Former scribe with an eye for seals",
  "Mercenary company's sole survivor",
  "Displaced peasant from a burnt village",
  "Former member of a disbanded cult",
  "Trapsmith's apprentice",
  "Baker's child who stole a tray of buns",
  "Ex-executioner's assistant",
  "Disgraced monk",
  "Former spy for a minor house",
  "Lighthouse keeper who fell asleep",
  "Caravan guard left for dead",
  "Sewer worker who found a crown",
  "Ex-trapper of exotic beasts",
  "Failed actor with a talent for disguise",
  "Bastard son of a merchant prince",
  "Tavern wench with a sharp tongue",
  "Messenger who read the letters",
  "Jeweler's apprentice who kept the dust",
  "Former guide for tomb robbers",
];

const QUIRKS = [
  "Always flips a coin",
  "Whistles when nervous",
  "Refuses to eat meat",
  "Terrified of spiders",
  "Polishes their blade constantly",
  "Talks to their shadows",
  "Collects small buttons",
  "Never looks anyone in the eye",
  "Always carries a lock of hair",
  "Prone to humming funeral dirges",
  "Compulsively checks for traps",
  "Only drinks rainwater",
  "Refers to themselves in the third person",
  "Obsessed with clean hands",
  "Wears too many scarves",
  "Has a distinct, raspy laugh",
  "Carries a lucky rabbit's foot that is balding",
  "Always sits with back to the wall",
  "Keeps a detailed list of every slight",
  "Fascinated by high-altitude architecture",
  "Sleeps with one eye open",
  "Always carries a vial of common dirt",
  "Chews on a toothpick constantly",
  "Repeats the last word people say",
  "Terrified of horses",
  "Always wears gloves",
  "Prays to a dead god for luck",
  "Mumbles in a forgotten language",
  "Compulsively counts their steps",
  "Hates the smell of lavender",
  "Believes they are possessed by a minor spirit",
  "Cannot stand the sight of blood (ironic)",
  "Wears a distinct red feather",
  "Collects the ears of their enemies",
  "Talks to their weapons",
  "Refuses to enter churches",
  "Always smells of cheap incense",
];

const INTERESTS = [
  "Gambling",
  "Ancient History",
  "Locks",
  "Exotic Poisons",
  "Local Gossip",
  "Knitting",
  "Fine Wine",
  "Street Dogs",
  "Bird Watching",
  "Opera",
  "Collecting Rags",
  "Cartography",
  "Hidden Lore",
  "Fashion",
  "Cooking with herbs",
  "Horse Racing",
  "Geology",
  "Philosophy of Law",
  "Baking",
  "Heraldy",
  "Naval tactics",
  "Sewer layouts",
  "Woodcarving",
  "Fortune Telling",
  "Astronomy",
  "Ancient Coinage",
  "Herbalism",
  "Bug Fighting",
  "Street Poetry",
  "Taxidermy",
  "Shipbuilding",
  "Ancient Languages",
  "Mushroom Foraging",
  "Shadow Puppetry",
  "Brewing Ale",
  "Lockpicking as an art form",
  "Urban Legends",
  "Sailing",
  "Weapon Forging",
  "Falconry",
];

const ETHICS: Array<Member["workEthic"]> = [
  "Lazy",
  "Reliable",
  "Ambitious",
  "Sloppy",
];

export const generateMember = (
  id: string = Math.random().toString(36).substr(2, 9),
  name?: string,
): Member => {
  const randName =
    name ||
    NAMES[rollDice(NAMES.length) - 1] +
      " " +
      (rollDice(100) > 30
        ? rollDice(2) === 1
          ? "the Shadow"
          : "of the Night"
        : "");
  return {
    id,
    name: randName,
    level: 0,
    classType: ClassType.LEVEL_0,
    rank: MemberRank.APPRENTICE,
    isRetainer: false,
    status: "Active",
    monthsActive: 0,
    monthsAtCurrentLevel: 0,
    backstory: BACKSTORIES[rollDice(BACKSTORIES.length) - 1],
    quirk: QUIRKS[rollDice(QUIRKS.length) - 1],
    interest: INTERESTS[rollDice(INTERESTS.length) - 1],
    workEthic: ETHICS[rollDice(ETHICS.length) - 1],
    relationships: {},
  };
};

export const generateAsset = (
  type: "Contact" | "Stash" | "Hideout",
): GuildAsset => {
  const id = Math.random().toString(36).substr(2, 9);
  if (type === "Contact") {
    const roles = [
      "Corrupt Guard",
      "Informant",
      "Fence",
      "Merchant",
      "Spy",
      "Local Noble",
      "Harbor Master",
      "Drunk Monk",
      "Jaded Scribe",
      "Street Urchin King",
      "Corrupt Judge",
      "City Mortician",
      "Guild-Friendly Rat-Catcher",
      "Retired Highwayman",
      "Tavern Keep",
      "Sewer Inspector",
      "Money Changer",
      "Blacksmith",
      "Alchemist",
      "Cartographer",
    ];
    const names = [
      "Old Joe",
      "Lady Vane",
      "Captain Krell",
      "Silas the Blind",
      "Smiling Tom",
      "Black-Eyed Bess",
      "Groggy Pete",
      "Madam Zola",
      "One-Eye Jack",
      "Dirty Harry",
      "Silver Tongue Sophie",
    ];
    const role = roles[rollDice(roles.length) - 1];
    return {
      id,
      type: "Contact",
      name: names[rollDice(names.length) - 1],
      description: `${role} with deep ties to the city infrastructure.`,
      benefit: "Provides tips on rich marks or early warning (+5% revenue).",
    };
  } else if (type === "Stash") {
    const locs = [
      "Docks Warehouse",
      "Abandoned Well",
      "Under the bridge",
      "Cemetery Crypt",
      "False floor in a stable",
      "Hollowed-out tree",
      "Inside a gargoyle statue",
      "Behind a loose brick in the slums",
      "Sunken boat near the pier",
      "Under a loose stone in a cathedral",
      "Inside a hollowed book in a library",
      "Beneath a vendor's stall",
      "In a disused chimney",
      "Wrapped in oilskin in the canal",
    ];
    return {
      id,
      type: "Stash",
      name: "Emergency Cache",
      location: locs[rollDice(locs.length) - 1],
      description:
        "A secure spot for extra silver, lockpicks, and contingency coin.",
      value: rollDice(10) * 50,
    };
  } else {
    const styles = [
      "Sewer Lair",
      "Tavern Basement",
      "Empty Tower",
      "Forest Camp",
      "Disused Wine Cellar",
      "Catacombs",
      "Attic of an Opera House",
      "Backroom of a Funeral Parlor",
      "Abandoned Clocktower",
      "Hidden Grotto under the cliffs",
      "Submerged Cistern",
      "Basement of a Ruined Temple",
      "Secret Chamber in a Noble's Mansion",
      "Mobile Camp in the Shanty Town",
      "Tunnels beneath the Asylum",
    ];
    return {
      id,
      type: "Hideout",
      name: styles[rollDice(styles.length) - 1],
      description: "A primary operational base with multiple escape routes.",
      value: 1000 + rollDice(5) * 500,
    };
  }
};

export const processMonth = (state: GuildState): GuildState => {
  const events: string[] = [];
  let grossRevenue = 0;
  let treasuryChange = 0;
  let revenueBonusPercent = 0;
  let expenseModifier = 1.0;
  let moraleChange = 0;

  // 1. Focus Specific Mechanics
  switch (state.focus) {
    case GuildFocus.ASSASSINATION:
      revenueBonusPercent += 20;
      if (rollDice(20) === 1) {
        const victimIdx = rollDice(state.members.length) - 1;
        const victim = state.members[victimIdx];
        if (victim) {
          victim.status = rollDice(2) === 1 ? "Injured" : "Dead";
          events.push(
            `High Stakes: ${victim.name} was compromised during a hit (${victim.status}).`,
          );
        }
      }
      break;
    case GuildFocus.BEGGING:
      expenseModifier -= 0.3;
      revenueBonusPercent -= 20;
      break;
    case GuildFocus.SMUGGLING:
      const stashes = state.assets.filter((a) => a.type === "Stash").length;
      if (stashes > 0) revenueBonusPercent += stashes * 5;
      break;
    case GuildFocus.THUGGERY:
      moraleChange += 1;
      revenueBonusPercent -= 10;
      break;
  }

  // 2. Revenue Modifiers
  let revenueModifierRoll = rollDice(6) + rollDice(6);
  if (
    state.members.some(
      (m) => m.classType === ClassType.MAGIC_USER && m.level >= 5,
    )
  )
    revenueModifierRoll += 1;
  if (state.isGuildmasterPresent) revenueModifierRoll += 1;
  if (state.marketClass <= 3) revenueModifierRoll -= 1;

  // 3. Boons/Banes
  if (rollDice(6) === 1) {
    const roll = rollDice(20) - 1;
    const boonDetail = BOON_TABLE_1D20[roll];
    if (boonDetail !== "No Boon") {
      if (boonDetail.includes("+500 gp")) treasuryChange += 500;
      if (boonDetail.includes("+250 gp")) treasuryChange += 250;
      if (boonDetail.includes("+2000 gp")) treasuryChange += 2000;
      if (boonDetail.includes("+10% Revenue")) revenueBonusPercent += 10;
      if (boonDetail.includes("+15% Revenue")) revenueBonusPercent += 15;
      if (boonDetail.includes("+30% Revenue")) revenueBonusPercent += 30;
      events.push("BOON: " + boonDetail);
    }
  }
  if (rollDice(6) === 1) {
    const roll = rollDice(20) - 1;
    const baneDetail = BANE_TABLE_1D20[roll];
    if (baneDetail !== "No Bane") {
      if (baneDetail.includes("-300 gp")) treasuryChange -= 300;
      if (baneDetail.includes("-500 gp")) treasuryChange -= 500;
      if (baneDetail.includes("-400 gp")) treasuryChange -= 400;
      if (baneDetail.includes("-1000 gp")) treasuryChange -= 1000;
      if (baneDetail.includes("-20% Revenue")) revenueBonusPercent -= 20;
      if (baneDetail.includes("-15% Revenue")) revenueBonusPercent -= 15;
      if (baneDetail.includes("-25% Revenue")) revenueBonusPercent -= 25;
      if (baneDetail.includes("-40% Revenue")) revenueBonusPercent -= 40;
      events.push("BANE: " + baneDetail);
    }
  }

  // 4. Revenue Calculation
  state.members.forEach((member) => {
    if (member.status === "Active") {
      let cls =
        member.classType === ClassType.LEVEL_0 ? "Thief" : member.classType;
      grossRevenue += getRevenueForLevel(state.focus, member.level, cls);
    } else if (member.status === "Injured") {
      let cls =
        member.classType === ClassType.LEVEL_0 ? "Thief" : member.classType;
      grossRevenue += Math.floor(
        getRevenueForLevel(state.focus, member.level, cls) / 2,
      );
    }
  });

  const gmEffectiveLevel = Math.max(1, Math.floor(state.guildmasterLevel / 2));
  grossRevenue += getRevenueForLevel(
    state.focus,
    gmEffectiveLevel,
    state.guildmasterClass,
  );

  let modifierText = "";
  if (revenueModifierRoll <= 1) {
    revenueBonusPercent -= 40;
    modifierText = "Terrible month";
  } else if (revenueModifierRoll <= 4) {
    revenueBonusPercent -= 20;
    modifierText = "Poor month";
  } else if (revenueModifierRoll <= 9) {
    modifierText = "Average month";
  } else if (revenueModifierRoll <= 12) {
    revenueBonusPercent += 20;
    modifierText = "Good month";
  } else {
    revenueBonusPercent += 40;
    modifierText = "Fantastic month";
  }

  grossRevenue = Math.floor(grossRevenue * (1 + revenueBonusPercent / 100));
  const mcCap = MAX_REVENUE_BY_MC[state.marketClass];
  if (grossRevenue > mcCap) {
    events.push(`Revenue capped by Market Class limit (${mcCap} gp)`);
    grossRevenue = mcCap;
  }

  // 5. Expenses
  let salaryExpense = 0;
  state.members.forEach((m) => {
    if (m.classType === ClassType.LEVEL_0) salaryExpense += 0.5;
    else if (
      m.classType === ClassType.THIEF ||
      m.classType === ClassType.FIGHTER
    )
      salaryExpense += m.level * 2;
    else if (m.classType === ClassType.CLERIC) salaryExpense += m.level * 10;
    else if (m.classType === ClassType.MAGIC_USER)
      salaryExpense += 100 + m.level * 10;
  });

  const maintenanceExpense = Math.floor(state.hideoutValue / 1000);
  const bribePercent = rollDice(6) + rollDice(6) + rollDice(6);
  const bribeExpense = Math.floor(grossRevenue * (bribePercent / 100));
  const totalExpenses = Math.floor(
    (salaryExpense + maintenanceExpense + bribeExpense) * expenseModifier,
  );
  const netProfit = grossRevenue - totalExpenses + treasuryChange;

  // 6. Conflicts & Leveling
  const updatedMembers = [...state.members];

  for (let i = 0; i < updatedMembers.length; i++) {
    for (let j = i + 1; j < updatedMembers.length; j++) {
      const m1 = updatedMembers[i];
      const m2 = updatedMembers[j];
      const rel = m1.relationships[m2.id] || 0;
      if (rel <= -8 && rollDice(10) === 1) {
        const conflictType = rollDice(3);
        if (conflictType === 1) {
          m1.status = "Injured";
          m2.status = "Injured";
          events.push(
            `Conflict: ${m1.name} and ${m2.name} had a bloody brawl.`,
          );
          moraleChange -= 1;
        } else if (conflictType === 2) {
          const loss = rollDice(6) * 10;
          treasuryChange -= loss;
          events.push(
            `Sabotage: Infighting between ${m1.name} and ${m2.name} cost the guild ${loss} gp.`,
          );
        } else {
          events.push(
            `Discord: The feud between ${m1.name} and ${m2.name} is lowering guild morale.`,
          );
          moraleChange -= 2;
        }
      }
    }
  }

  const finalMembers = updatedMembers.map((m) => {
    let newLevel = m.level;
    let newStatus = m.status;
    let newMonthsAtLevel = m.monthsAtCurrentLevel + 1;
    let newRel = { ...m.relationships };

    if (m.status === "Injured") newStatus = "Active";
    if (m.status === "Crippled") newStatus = "Injured";

    const levelUpRoll = rollDice(100);
    let levelUpOccurred = false;

    // Fixed Progression logic: Check once every N months (where N = current level)
    const checkInterval = m.level || 1; // 0-levels check every 1 month

    if (newMonthsAtLevel >= checkInterval) {
      if (m.classType === ClassType.LEVEL_0) {
        // 0-levels have a baseline 25% chance to reach level 1
        if (levelUpRoll <= 25) {
          newLevel = 1;
          levelUpOccurred = true;
          events.push(`${m.name} graduated to Level 1 Thief!`);
        } else {
          newMonthsAtLevel = 0; // Reset for next monthly check
        }
      } else {
        // DOCUMENT ACCURATE CHANCES:
        // Thief: 3 in 6 (50%)
        // Fighter / Cleric: 2 in 6 (~33%)
        // Magic-user: 1 in 6 (~17%)
        let baseChance = 0;
        if (m.classType === ClassType.THIEF) baseChance = 50;
        else if (
          m.classType === ClassType.FIGHTER ||
          m.classType === ClassType.CLERIC
        )
          baseChance = 33;
        else if (m.classType === ClassType.MAGIC_USER) baseChance = 17;
        else baseChance = 10; // Catch-all for other types

        // Work Ethic influence
        if (m.workEthic === "Ambitious") baseChance += 15;
        if (m.workEthic === "Lazy") baseChance -= 15;
        if (m.workEthic === "Sloppy") baseChance -= 5;

        if (levelUpRoll <= baseChance) {
          newLevel++;
          levelUpOccurred = true;
          events.push(`${m.name} reached Level ${newLevel} (${m.classType}).`);
        } else {
          newMonthsAtLevel = 0; // Reset for next cycle of N months
        }
      }
    }

    if (levelUpOccurred) {
      newMonthsAtLevel = 0;
    }

    state.members.forEach((other) => {
      if (other.id === m.id) return;
      const currentScore = newRel[other.id] || 0;
      const volatilityRoll = rollDice(100);
      if (volatilityRoll <= 5) {
        const typeRoll = rollDice(4);
        if (typeRoll === 1) newRel[other.id] = 10;
        else if (typeRoll === 2) newRel[other.id] = -10;
        else if (typeRoll === 3) newRel[other.id] = -currentScore;
        else
          newRel[other.id] = Math.min(
            10,
            Math.max(-10, currentScore + (rollDice(10) - 5)),
          );
      } else if (volatilityRoll <= 20) {
        const drift = rollDice(3) - 2;
        newRel[other.id] = Math.min(10, Math.max(-10, currentScore + drift));
      }
    });

    return {
      ...m,
      level: newLevel,
      status: newStatus as any,
      monthsActive: m.monthsActive + 1,
      monthsAtCurrentLevel: newMonthsAtLevel,
      relationships: newRel,
      classType:
        m.classType === ClassType.LEVEL_0 && levelUpOccurred
          ? ClassType.THIEF
          : m.classType,
      rank:
        m.classType === ClassType.LEVEL_0 && levelUpOccurred
          ? MemberRank.FOOTPAD
          : m.rank,
    };
  });

  const currentLimit =
    state.maxMemberOverride || MARKET_CLASS_LIMITS[state.marketClass];
  if (state.guildmasterLevel >= 9 && finalMembers.length < currentLimit) {
    if (rollDice(12) === 1) {
      const follower = generateMember();
      follower.level = 1;
      follower.rank = MemberRank.FOOTPAD;
      follower.classType = ClassType.THIEF;
      finalMembers.push(follower);
      events.push(`Reputation recruit: ${follower.name} (Lvl 1) joined.`);
    }
  }

  const newJournal = { ...state.journal };
  if (state.currentJournalEntry.trim()) {
    newJournal[state.currentMonth] = state.currentJournalEntry;
  }

  const lastMonthLog: MonthLog = {
    grossRevenue,
    modifierRoll: revenueModifierRoll,
    modifierText,
    expenses: {
      salaries: Math.floor(salaryExpense),
      maintenance: maintenanceExpense,
      bribes: bribeExpense,
      total: totalExpenses,
    },
    events,
    netProfit,
  };

  return {
    ...state,
    currentMonth: state.currentMonth + 1,
    treasury: Math.max(0, state.treasury + netProfit),
    moraleScore: Math.min(20, Math.max(0, state.moraleScore + moraleChange)),
    members: finalMembers,
    lastMonthLog,
    journal: newJournal,
    currentJournalEntry: "",
  };
};

export const createNewGuild = (): GuildState => ({
  name: "The Shadow Hand",
  focus: GuildFocus.BURGLARY,
  marketClass: 5,
  currentMonth: 1,
  treasury: 5000,
  hideoutValue: 10000,
  members: [
    generateMember("1", "Alric the Swift"),
    generateMember("2", "Bryn of the Night"),
    generateMember("3", "Cade Slink"),
  ],
  assets: [],
  moraleScore: 10,
  guildmasterLevel: 9,
  guildmasterClass: ClassType.THIEF,
  isGuildmasterThief: true,
  isGuildmasterPresent: true,
  daysManagement: 10,
  lastMonthLog: {
    grossRevenue: 0,
    modifierRoll: 0,
    modifierText: "Initial State",
    expenses: { salaries: 0, maintenance: 0, bribes: 0, total: 0 },
    events: ["Guild founded!"],
    netProfit: 0,
  },
  journal: {},
  currentJournalEntry: "",
});
