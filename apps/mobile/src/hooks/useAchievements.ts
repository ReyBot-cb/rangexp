import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@rangexp/api-client';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  category: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  targetValue: number;
  currentValue: number;
  xpReward: number;
}

export interface AchievementCategory {
  id: string;
  name: string;
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
}

interface BackendAchievement {
  id: string;
  code: string;
  name: string;
  description: string;
  xpReward: number;
  iconUrl?: string;
  tier: string;
  category: string;
  unlocked: boolean;
  unlockedAt: string | null;
  progress: number | null;
  target: number | null;
  progressPercentage: number | null;
}

interface BackendAchievementsResponse {
  achievements: BackendAchievement[];
  totalUnlocked: number;
  totalAchievements: number;
  totalXpFromAchievements: number;
  byCategory: Record<string, BackendAchievement[]>;
}

// Map backend tier to rarity
const tierToRarity: Record<string, AchievementRarity> = {
  bronze: 'common',
  silver: 'rare',
  gold: 'epic',
  platinum: 'legendary',
};

// Map backend category to display info
const categoryInfo: Record<string, { id: string; name: string; icon: string }> = {
  REGISTROS: { id: 'registros', name: 'Registros', icon: 'chart-line' },
  RACHAS: { id: 'rachas', name: 'Rachas', icon: 'fire' },
  NIVELES: { id: 'niveles', name: 'Niveles', icon: 'chart-line-up' },
  SOCIAL: { id: 'social', name: 'Social', icon: 'users' },
  CONTEXTOS: { id: 'contextos', name: 'Contextos', icon: 'calendar' },
  CONTROL: { id: 'control', name: 'Control', icon: 'target' },
  ESPECIALES: { id: 'especiales', name: 'Especiales', icon: 'star' },
};

// Map achievement code to icon (using valid IconName values)
const codeToIcon: Record<string, string> = {
  FIRST_LOG: 'note',
  LOGS_10: 'chart-line',
  LOGS_50: 'chart-line-up',
  LOGS_100: 'medal',
  LOGS_500: 'trophy',
  LOGS_1000: 'crown',
  STREAK_3: 'fire',
  STREAK_7: 'fire',
  STREAK_14: 'fire',
  STREAK_30: 'fire',
  STREAK_90: 'fire',
  STREAK_180: 'fire',
  STREAK_365: 'fire',
  LEVEL_5: 'star',
  LEVEL_10: 'star',
  LEVEL_25: 'star',
  LEVEL_50: 'crown-simple',
  LEVEL_100: 'crown',
  FIRST_FRIEND: 'user-plus',
  FRIENDS_5: 'users',
  FRIENDS_10: 'users-four',
  SHARE_FIRST: 'share',
  HELPED_FRIEND: 'heart',
  CONTEXT_ALL: 'calendar',
  '7_READINGS_DAY': 'chart-line',
  MORNING_ROUTINE: 'sun',
  BEDTIME_ROUTINE: 'moon',
  IN_RANGE_FIRST: 'check-circle',
  IN_RANGE_10: 'seal-check',
  IN_RANGE_DAY: 'sun-horizon',
  IN_RANGE_WEEK: 'calendar',
  TIME_IN_RANGE_70: 'target',
  TIME_IN_RANGE_80: 'target',
  EARLY_ADOPTER: 'sparkle',
  STREAK_RECOVERED: 'lightning',
  PREMIUM_MEMBER: 'crown',
  DIABETES_DAY: 'heart',
};

function mapBackendToFrontend(backend: BackendAchievement): Achievement {
  return {
    id: backend.id,
    code: backend.code,
    name: backend.name,
    description: backend.description,
    icon: codeToIcon[backend.code] || 'trophy',
    rarity: tierToRarity[backend.tier] || 'common',
    category: backend.category,
    unlocked: backend.unlocked,
    unlockedAt: backend.unlockedAt || undefined,
    progress: backend.progressPercentage ?? undefined,
    targetValue: backend.target ?? 1,
    currentValue: backend.progress ?? 0,
    xpReward: backend.xpReward,
  };
}

export function useAchievements() {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data } = await apiClient.get<BackendAchievementsResponse>('/achievements/my/progress');
      if (!data?.achievements) return [];
      return data.achievements.map(mapBackendToFrontend);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAchievementCategories() {
  const { data: achievements, ...rest } = useAchievements();

  if (!achievements || achievements.length === 0) {
    return { categories: [], ...rest };
  }

  // Group achievements by category
  const categoryMap = new Map<string, Achievement[]>();

  for (const achievement of achievements) {
    const cat = achievement.category;
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, []);
    }
    categoryMap.get(cat)!.push(achievement);
  }

  // Build categories array in order
  const categoryOrder = ['REGISTROS', 'RACHAS', 'NIVELES', 'CONTROL', 'CONTEXTOS', 'SOCIAL', 'ESPECIALES'];

  const categories: AchievementCategory[] = categoryOrder
    .filter(cat => categoryMap.has(cat))
    .map(cat => {
      const catAchievements = categoryMap.get(cat) || [];
      const info = categoryInfo[cat] || { id: cat.toLowerCase(), name: cat, icon: 'star' };

      return {
        id: info.id,
        name: info.name,
        achievements: catAchievements,
        unlockedCount: catAchievements.filter(a => a.unlocked).length,
        totalCount: catAchievements.length,
      };
    });

  return { categories, ...rest };
}

export function useRecentAchievements(limit = 3) {
  const { data: achievements } = useAchievements();

  if (!achievements) return [];

  return achievements
    .filter(a => a.unlocked && a.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, limit);
}

export function useNextAchievement() {
  const { data: achievements } = useAchievements();

  if (!achievements) return null;

  const locked = achievements.filter(a => !a.unlocked);
  if (locked.length === 0) return null;

  // Sort by progress percentage (highest first)
  return locked.sort((a, b) => (b.progress || 0) - (a.progress || 0))[0];
}
