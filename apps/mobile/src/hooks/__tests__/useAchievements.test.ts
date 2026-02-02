import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { apiClient } from '@rangexp/api-client';
import {
  useAchievements,
  useAchievementCategories,
  useRecentAchievements,
  useNextAchievement,
} from '../useAchievements';

// Mock the api client
jest.mock('@rangexp/api-client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('useAchievements hooks', () => {
  let queryClient: QueryClient;

  const mockAchievements = [
    {
      id: 'first-reading',
      name: 'First Step',
      description: 'Record your first glucose reading',
      icon: '🩸',
      rarity: 'common' as const,
      unlocked: true,
      unlockedAt: '2024-01-10T10:00:00Z',
      progress: 100,
      targetValue: 1,
      currentValue: 1,
    },
    {
      id: 'streak-7-days',
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      rarity: 'rare' as const,
      unlocked: false,
      progress: 71,
      targetValue: 7,
      currentValue: 5,
    },
    {
      id: 'glucose-100',
      name: 'Century Club',
      description: 'Record 100 glucose readings',
      icon: '📊',
      rarity: 'epic' as const,
      unlocked: false,
      progress: 25,
      targetValue: 100,
      currentValue: 25,
    },
    {
      id: 'week-perfect',
      name: 'Perfect Week',
      description: 'Stay in range for 7 consecutive days',
      icon: '⭐',
      rarity: 'legendary' as const,
      unlocked: true,
      unlockedAt: '2024-01-15T10:00:00Z',
      progress: 100,
      targetValue: 7,
      currentValue: 7,
    },
  ];

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    jest.clearAllMocks();
  });

  describe('useAchievements', () => {
    it('should fetch achievements from API', async () => {
      mockApiClient.get.mockResolvedValue({ data: { achievements: mockAchievements } });

      const { result } = renderHook(() => useAchievements(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.get).toHaveBeenCalledWith('/achievements');
      expect(result.current.data).toEqual(mockAchievements);
    });

    it('should handle API error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useAchievements(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useAchievementCategories', () => {
    it('should organize achievements into categories', async () => {
      mockApiClient.get.mockResolvedValue({ data: { achievements: mockAchievements } });

      const { result } = renderHook(() => useAchievementCategories(), { wrapper });

      await waitFor(() => expect(result.current.categories.length).toBeGreaterThan(0));

      const categories = result.current.categories;
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
    });

    it('should return empty categories when no achievements', async () => {
      mockApiClient.get.mockResolvedValue({ data: { achievements: [] } });

      const { result } = renderHook(() => useAchievementCategories(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // All categories should have zero achievements
      result.current.categories.forEach(cat => {
        expect(cat.totalCount).toBe(0);
      });
    });

    it('should count unlocked achievements per category', async () => {
      mockApiClient.get.mockResolvedValue({ data: { achievements: mockAchievements } });

      const { result } = renderHook(() => useAchievementCategories(), { wrapper });

      await waitFor(() => expect(result.current.categories.length).toBeGreaterThan(0));

      // Check that unlocked counts are calculated
      const hasUnlockedCounts = result.current.categories.some(
        cat => cat.unlockedCount >= 0 && cat.totalCount >= 0
      );
      expect(hasUnlockedCounts).toBe(true);
    });
  });

  describe('useRecentAchievements', () => {
    it('should return recently unlocked achievements sorted by date', async () => {
      mockApiClient.get.mockResolvedValue({ data: { achievements: mockAchievements } });

      const { result } = renderHook(() => useRecentAchievements(3), { wrapper });

      await waitFor(() => expect(result.current.length).toBeGreaterThan(0));

      // Should only include unlocked achievements
      result.current.forEach(achievement => {
        expect(achievement.unlocked).toBe(true);
      });

      // Should be sorted by unlockedAt (most recent first)
      if (result.current.length >= 2) {
        const first = new Date(result.current[0].unlockedAt!).getTime();
        const second = new Date(result.current[1].unlockedAt!).getTime();
        expect(first).toBeGreaterThanOrEqual(second);
      }
    });

    it('should respect the limit parameter', async () => {
      mockApiClient.get.mockResolvedValue({ data: { achievements: mockAchievements } });

      const { result } = renderHook(() => useRecentAchievements(1), { wrapper });

      await waitFor(() => expect(result.current.length).toBeLessThanOrEqual(1));
    });

    it('should return empty array when no unlocked achievements', async () => {
      const allLocked = mockAchievements.map(a => ({ ...a, unlocked: false, unlockedAt: undefined }));
      mockApiClient.get.mockResolvedValue({ data: { achievements: allLocked } });

      const { result } = renderHook(() => useRecentAchievements(), { wrapper });

      await waitFor(() => expect(Array.isArray(result.current)).toBe(true));

      expect(result.current).toEqual([]);
    });
  });

  describe('useNextAchievement', () => {
    it('should return the locked achievement with highest progress', async () => {
      mockApiClient.get.mockResolvedValue({ data: { achievements: mockAchievements } });

      const { result } = renderHook(() => useNextAchievement(), { wrapper });

      await waitFor(() => expect(result.current).not.toBeNull());

      expect(result.current?.unlocked).toBe(false);
      // Should be the one with 71% progress
      expect(result.current?.id).toBe('streak-7-days');
    });

    it('should return null when all achievements are unlocked', async () => {
      const allUnlocked = mockAchievements.map(a => ({
        ...a,
        unlocked: true,
        unlockedAt: '2024-01-15T10:00:00Z',
      }));
      mockApiClient.get.mockResolvedValue({ data: { achievements: allUnlocked } });

      const { result } = renderHook(() => useNextAchievement(), { wrapper });

      await waitFor(() => expect(result.current).toBeNull());
    });

    it('should return null when no achievements', async () => {
      mockApiClient.get.mockResolvedValue({ data: { achievements: [] } });

      const { result } = renderHook(() => useNextAchievement(), { wrapper });

      await waitFor(() => expect(result.current).toBeNull());
    });
  });
});
