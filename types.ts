
export enum ClassType {
  THIEF = 'Thief',
  FIGHTER = 'Fighter',
  CLERIC = 'Cleric',
  MAGIC_USER = 'Magic-user',
  LEVEL_0 = '0-level',
  OTHER = 'Other'
}

export enum GuildFocus {
  ASSASSINATION = 'Assassination',
  BEGGING = 'Begging',
  BURGLARY = 'Burglary',
  CON_ARTISTS = 'Con Artists',
  FENCING = 'Fencing',
  SMUGGLING = 'Smuggling',
  SPY_RING = 'Spy Ring',
  THUGGERY = 'Thuggery'
}

export enum MemberRank {
  APPRENTICE = 'Apprentice',
  FOOTPAD = 'Footpad',
  SHARPER = 'Sharper',
  JOURNEYMAN = 'Journeyman',
  MASTER = 'Master',
  LIEUTENANT = 'Lieutenant'
}

export interface Member {
  id: string;
  name: string;
  level: number;
  classType: ClassType;
  rank: MemberRank;
  isRetainer: boolean;
  status: 'Active' | 'Injured' | 'Crippled' | 'Dead';
  monthsActive: number;
  monthsAtCurrentLevel: number; // Added for document-accurate leveling
  backstory: string;
  quirk: string;
  interest: string;
  workEthic: 'Lazy' | 'Reliable' | 'Ambitious' | 'Sloppy';
  relationships: Record<string, number>;
}

export interface GuildAsset {
  id: string;
  type: 'Contact' | 'Stash' | 'Hideout';
  name: string;
  description: string;
  value?: number;
  location?: string;
  benefit?: string;
}

export interface GuildState {
  name: string;
  focus: GuildFocus;
  marketClass: number;
  currentMonth: number;
  treasury: number;
  hideoutValue: number;
  members: Member[];
  assets: GuildAsset[];
  moraleScore: number;
  guildmasterLevel: number;
  guildmasterClass: ClassType;
  isGuildmasterThief: boolean;
  isGuildmasterPresent: boolean;
  daysManagement: number;
  maxMemberOverride?: number;
  lastMonthLog: MonthLog;
  journal: Record<number, string>; // Historical notes
  currentJournalEntry: string;    // Draft for current month
}

export interface MonthLog {
  grossRevenue: number;
  modifierRoll: number;
  modifierText: string;
  expenses: {
    salaries: number;
    maintenance: number;
    bribes: number;
    total: number;
  };
  events: string[];
  boon?: string;
  bane?: string;
  netProfit: number;
}
