// RangeXp Shared Types

// ==========================================
// Gamification Constants (centralized)
// ==========================================
export const GAMIFICATION = {
  XP: {
    GLUCOSE_LOG: 10,        // XP for logging a glucose reading
    STREAK_BONUS: 5,        // Extra XP per streak day (future use)
    ACHIEVEMENT_BASE: 50,   // Base XP for achievements
  },
  LEVELS: {
    XP_PER_LEVEL: 100,      // XP needed per level
  },
} as const;

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  xp: number;
  streak: number;
  level: number;
  isPremium: boolean;
  glucoseUnit: "MG_DL" | "MMOL_L";
  theme: "LIGHT" | "DARK";
  language: "ES" | "EN";
  rexCustomization: string;
  createdAt: string;
  lastStreakDate: string | null; // ISO date string of last streak-contributing activity
}

export interface GlucoseReading {
  id: string;
  value: number;
  unit: "MG_DL" | "MMOL_L";
  note: string | null;
  context: string | null;
  recordedAt: string;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  xpReward: number;
  iconUrl: string | null;
  tier: "bronze" | "silver" | "gold" | "platinum";
  unlockedAt: string | null;
}

export interface Friend {
  id: string;
  user: User;
  status: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  message: string;
  data: Record<string, any> | null;
  createdAt: string;
  sender: Pick<User, "id" | "firstName" | "lastName" | "avatarUrl" | "level">;
}

export interface EducationModule {
  id: string;
  code: string;
  title: string;
  description: string;
  level: number;
  type: "content" | "quiz" | "exercise";
  xpReward: number;
  isPremium: boolean;
  progress: {
    completed: boolean;
    score: number | null;
  } | null;
}

// Gamification Types
export interface XpGain {
  amount: number;
  source: string;
  streakBonus?: number;
  total: number;
}

export interface LevelUp {
  previousLevel: number;
  newLevel: number;
  xpToNext: number;
}

// Rex Messages
export interface RexMessage {
  id: string;
  text: string;
  mood: "happy" | "celebrate" | "encourage" | "neutral" | "support";
  animation?: string;
}
