
import { GuildFocus, ClassType } from './types';

export const MARKET_CLASS_LIMITS = [0, 2, 3, 5, 10, 20, 30, 40, 50, 75, 100]; // Index 0-10
export const MAX_REVENUE_BY_MC = [0, 1000, 2500, 5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000];
export const POTENTIAL_RECRUITS_PER_MC = [0, 1, 1, 2, 3, 4, 6, 18, 24, 30, 36];

export const BOON_TABLE_1D20 = [
  "No Boon (1-5)", "No Boon", "No Boon", "No Boon", "No Boon",
  "Unexpected Windfall: Recovered hidden loot (+500 gp)",
  "New Contact: A friendly merchant offers cheaper maintenance (-20% expenses next month)",
  "Guards Distracted: Local watch is busy with a festival (+10% Revenue)",
  "Rival Weakness: Rival gang leader arrested (+10% Revenue)",
  "Hidden Cache: Found an old smuggler's stash (+250 gp)",
  "Expert Recruit: A skilled thief offers their services for free",
  "Bribe Accepted: Guard Captain is now on the payroll (-50% Bribe expenses next month)",
  "Local Legend: Guild reputation grows (+2 Morale Score)",
  "Efficient Logistics: Smuggling routes improved (+15% Revenue)",
  "Underground Shortcut: New tunnels found in the hideout (Hideout Value +1000 gp)",
  "Political Favor: A minor noble owes you one (+20% Revenue)",
  "Weapon Shipment: Found high-quality gear (Combat units get +1 level next month)",
  "Double Boon: Roll twice more on this table!",
  "Masterful Heist: A perfect job! (+2000 gp)",
  "Shadow Blessing: Exceptional month (+30% Revenue, +5 Morale Score)"
];

export const BANE_TABLE_1D20 = [
  "No Bane (1-5)", "No Bane", "No Bane", "No Bane", "No Bane",
  "Guard Crackdown: Increased patrols (-20% Revenue)",
  "Warehouse Fire: Inventory lost (-300 gp)",
  "Snitch: Someone leaked info (-10% Revenue, -2 Morale Score)",
  "Rival Incursion: Competition is fierce (-15% Revenue)",
  "Tax Squeeze: The Lord is hungry for coin (Expenses +20%)",
  "Disease: Several members are ill (3 members become Injured)",
  "Failed Job: A major operation was botched (-500 gp)",
  "Stolen Loot: A rival gang robbed a shipment (-400 gp)",
  "Corruption Probe: Authorities are investigating (Bribe costs +100%)",
  "Morale Drop: Internal bickering (-4 Morale Score)",
  "Hideout Leak: The hideout needs urgent repairs (-600 gp)",
  "Merchant Boycott: Smuggling routes blocked (-25% Revenue)",
  "Bad Reputation: People are talking (-3 Morale Score)",
  "Major Raid: The watch found a safehouse (-1000 gp)",
  "Catastrophic Month: Disaster! (-40% Revenue, -10 Morale Score)"
];

export const REVENUE_TABLES: Record<GuildFocus, Record<number, Record<string, number>>> = {
  [GuildFocus.ASSASSINATION]: {
    0: { Thief: 8, Cleric: 8, Fighter: 8, 'Magic-user': 8 },
    1: { Thief: 30, Cleric: 20, Fighter: 24, 'Magic-user': 38 },
    2: { Thief: 68, Cleric: 40, Fighter: 46, 'Magic-user': 78 },
    3: { Thief: 140, Cleric: 80, Fighter: 130, 'Magic-user': 150 },
    4: { Thief: 300, Cleric: 160, Fighter: 200, 'Magic-user': 280 },
    5: { Thief: 600, Cleric: 320, Fighter: 400, 'Magic-user': 550 },
    6: { Thief: 1200, Cleric: 600, Fighter: 800, 'Magic-user': 1000 },
    7: { Thief: 2400, Cleric: 1200, Fighter: 1600, 'Magic-user': 2000 },
    8: { Thief: 5000, Cleric: 2400, Fighter: 3200, 'Magic-user': 4000 },
  },
  [GuildFocus.BEGGING]: {
    0: { Thief: 20, Cleric: 20, Fighter: 20, 'Magic-user': 20 },
    1: { Thief: 30, Cleric: 20, Fighter: 20, 'Magic-user': 30 },
    2: { Thief: 60, Cleric: 40, Fighter: 40, 'Magic-user': 60 },
    3: { Thief: 120, Cleric: 80, Fighter: 100, 'Magic-user': 120 },
    4: { Thief: 240, Cleric: 160, Fighter: 200, 'Magic-user': 240 },
  },
  [GuildFocus.BURGLARY]: {
    0: { Thief: 8, Cleric: 8, Fighter: 8, 'Magic-user': 8 },
    1: { Thief: 30, Cleric: 20, Fighter: 24, 'Magic-user': 38 },
    2: { Thief: 70, Cleric: 40, Fighter: 46, 'Magic-user': 75 },
    3: { Thief: 140, Cleric: 80, Fighter: 130, 'Magic-user': 150 },
    4: { Thief: 300, Cleric: 160, Fighter: 200, 'Magic-user': 280 },
  },
  [GuildFocus.CON_ARTISTS]: {
    0: { Thief: 20, Cleric: 20, Fighter: 20, 'Magic-user': 20 },
    1: { Thief: 40, Cleric: 40, Fighter: 40, 'Magic-user': 40 },
    2: { Thief: 80, Cleric: 80, Fighter: 80, 'Magic-user': 80 },
    3: { Thief: 160, Cleric: 160, Fighter: 160, 'Magic-user': 160 },
    4: { Thief: 300, Cleric: 300, Fighter: 300, 'Magic-user': 300 },
  },
  [GuildFocus.FENCING]: {
    0: { Thief: 10, Cleric: 10, Fighter: 10, 'Magic-user': 10 },
    1: { Thief: 20, Cleric: 20, Fighter: 20, 'Magic-user': 30 },
    2: { Thief: 40, Cleric: 40, Fighter: 40, 'Magic-user': 60 },
    3: { Thief: 80, Cleric: 80, Fighter: 80, 'Magic-user': 120 },
    4: { Thief: 160, Cleric: 160, Fighter: 160, 'Magic-user': 240 },
  },
  [GuildFocus.SMUGGLING]: {
    0: { Thief: 10, Cleric: 10, Fighter: 10, 'Magic-user': 10 },
    1: { Thief: 30, Cleric: 20, Fighter: 24, 'Magic-user': 38 },
    2: { Thief: 68, Cleric: 40, Fighter: 46, 'Magic-user': 78 },
  },
  [GuildFocus.SPY_RING]: {
    0: { Thief: 20, Cleric: 20, Fighter: 20, 'Magic-user': 20 },
    1: { Thief: 40, Cleric: 40, Fighter: 24, 'Magic-user': 40 },
    2: { Thief: 80, Cleric: 80, Fighter: 46, 'Magic-user': 80 },
  },
  [GuildFocus.THUGGERY]: {
    0: { Thief: 12, Cleric: 12, Fighter: 12, 'Magic-user': 12 },
    1: { Thief: 30, Cleric: 20, Fighter: 30, 'Magic-user': 25 },
    2: { Thief: 60, Cleric: 40, Fighter: 60, 'Magic-user': 50 },
  }
};

export const getRevenueForLevel = (focus: GuildFocus, level: number, cls: string): number => {
  const table = REVENUE_TABLES[focus];
  if (table[level] && table[level][cls]) return table[level][cls];
  const base4 = table[4]?.[cls] || 200;
  return Math.floor(base4 * Math.pow(2, Math.max(0, level - 4)));
};

export const MORALE_TABLE = [
  { min: -99, max: 1, level: 'Coup' },
  { min: 2, max: 2, level: 'Rebellious' },
  { min: 3, max: 4, level: 'Belligerent' },
  { min: 5, max: 7, level: 'Discontent' },
  { min: 8, max: 13, level: 'Content' },
  { min: 14, max: 16, level: 'Happy' },
  { min: 17, max: 18, level: 'Loyal' },
  { min: 19, max: 19, level: 'Dedicated' },
  { min: 20, max: 99, level: 'Fanatical' }
];
