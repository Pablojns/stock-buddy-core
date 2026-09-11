export type Quest = {
  id: string;
  name: string;
  reward: string;
  xp: number;
  done: boolean;
  completedAt?: string;
};

export type Habit = {
  id: string;
  name: string;
  xp: number;
};

export type Scroll = {
  id: string;
  title: string;
  body: string;
  date?: string;
  createdAt: string;
};

export type Reward = {
  id: string;
  name: string;
  cost: number;
  claimed: boolean;
};

export type Attributes = {
  forca: number;
  inteligencia: number;
  vitalidade: number;
};

export type HeroState = {
  xp: number;
  spent: number;
  quests: Quest[];
  habits: Habit[];
  /** habitId -> array of ISO dates (yyyy-mm-dd) */
  logs: Record<string, string[]>;
  scrolls: Scroll[];
  rewards: Reward[];
  attributes: Attributes;
  points: number;
};

export const XP_PER_LEVEL = 100;

export const RANKS = [
  'Iniciante',
  'Aprendiz',
  'Guerreiro',
  'Veterano',
  'Elite',
  'Mestre',
  'Lendário',
  'Dovahkiin',
] as const;

export type Rank = (typeof RANKS)[number];

export const levelFromXp = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;

export const rankFromLevel = (level: number): Rank => {
  const index = Math.min(RANKS.length - 1, Math.floor((level - 1) / 3));
  return RANKS[index];
};

export const xpIntoLevel = (xp: number) => xp % XP_PER_LEVEL;

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const daysInMonth = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

export const monthDayISO = (day: number, date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export const uid = () => Math.random().toString(36).slice(2, 10);

export const initialState: HeroState = {
  xp: 0,
  spent: 0,
  quests: [],
  habits: [
    { id: uid(), name: 'Treinar o corpo', xp: 10 },
    { id: uid(), name: 'Ler um tomo antigo', xp: 10 },
    { id: uid(), name: 'Beber 3L de água', xp: 5 },
  ],
  logs: {},
  scrolls: [],
  rewards: [
    { id: uid(), name: 'Noite na taverna', cost: 150, claimed: false },
    { id: uid(), name: 'Dia de descanso', cost: 300, claimed: false },
  ],
  attributes: { forca: 1, inteligencia: 1, vitalidade: 1 },
  points: 0,
};
