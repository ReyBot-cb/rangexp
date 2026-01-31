import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@rangexp/api-client';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  targetValue: number;
  currentValue: number;
}

export interface AchievementCategory {
  id: string;
  name: string;
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
}

export function useAchievements() {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data } = await apiClient.get('/achievements');
      return data.achievements as Achievement[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAchievementCategories() {
  const { data: achievements, ...rest } = useAchievements();

  if (!achievements) {
    return { categories: [], ...rest };
  }

  const categories: AchievementCategory[] = [
    {
      id: 'streaks',
      name: '🔥 Rachas',
      achievements: achievements.filter(a => a.id.includes('streak') || a.id.includes('day')),
      unlockedCount: 0,
      totalCount: 0,
    },
    {
      id: 'glucose',
      name: '🩸 Glucosa',
      achievements: achievements.filter(a => a.id.includes('glucose') || a.id.includes('reading')),
      unlockedCount: 0,
      totalCount: 0,
    },
    {
      id: 'consistency',
      name: '📅 Consistencia',
      achievements: achievements.filter(a => a.id.includes('week') || a.id.includes('month')),
      unlockedCount: 0,
      totalCount: 0,
    },
    {
      id: 'special',
      name: '⭐ Especiales',
      achievements: achievements.filter(a => !a.id.includes('streak') && !a.id.includes('day') && !a.id.includes('glucose') && !a.id.includes('reading') && !a.id.includes('week') && !a.id.includes('month')),
      unlockedCount: 0,
      totalCount: 0,
    },
  ];

  categories.forEach(cat => {
    cat.unlockedCount = cat.achievements.filter(a => a.unlocked).length;
    cat.totalCount = cat.achievements.length;
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

  return locked.sort((a, b) => (b.progress || 0) - (a.progress || 0))[0];
}
