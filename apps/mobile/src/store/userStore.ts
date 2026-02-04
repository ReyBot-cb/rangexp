import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export type GlucoseUnit = 'MG_DL' | 'MMOL_L';
export type AccountType = 'anonymous' | 'registered';

/**
 * Helper to get the number of days between a date string and today
 * Uses date-only comparison to avoid timezone issues
 */
function getDaysDifference(dateStr: string | undefined): number {
  if (!dateStr) return Infinity;

  // Parse dates as local dates (YYYY-MM-DD format)
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Convert to timestamps at midnight for comparison
  const dateMs = new Date(dateStr + 'T00:00:00').getTime();
  const todayMs = new Date(todayStr + 'T00:00:00').getTime();

  return Math.floor((todayMs - dateMs) / (1000 * 60 * 60 * 24));
}

/**
 * Helper to check if a date is within the last N days
 */
function isDateWithinDays(dateStr: string | undefined, days: number): boolean {
  const diff = getDaysDifference(dateStr);
  return diff <= days;
}

/**
 * Helper to check if two dates are consecutive (within 1 day of each other)
 */
function areDatesConsecutive(date1: string | undefined, date2: string | undefined): boolean {
  if (!date1 || !date2) return false;

  // Convert to timestamps at midnight for comparison
  const d1Ms = new Date(date1 + 'T00:00:00').getTime();
  const d2Ms = new Date(date2 + 'T00:00:00').getTime();

  const diffDays = Math.abs(d2Ms - d1Ms) / (1000 * 60 * 60 * 24);
  return diffDays <= 1;
}

/**
 * Calculate the merged streak when linking anonymous user to registered account
 *
 * Rules:
 * 1. If anonymous has recent activity (within last day) and server streak was
 *    also recent (consecutive), sum the streaks (user continued their streak as guest)
 * 2. If anonymous has recent activity but server streak is old/broken,
 *    use anonymous streak (server streak was lost)
 * 3. If anonymous has no recent activity, use server streak
 */
function calculateMergedStreak(
  serverStreak: number,
  serverLastDate: string | undefined,
  anonStreak: number,
  anonLastDate: string | undefined
): number {
  const anonHasRecentActivity = isDateWithinDays(anonLastDate, 1);
  const serverHasRecentActivity = isDateWithinDays(serverLastDate, 1);
  const datesAreConsecutive = areDatesConsecutive(serverLastDate, anonLastDate);

  // Case 1: Anonymous has no recent activity → use server streak
  if (!anonHasRecentActivity || anonStreak === 0) {
    return serverStreak;
  }

  // Case 2: Anonymous has recent activity, check if we can combine
  if (serverHasRecentActivity && datesAreConsecutive && serverStreak > 0) {
    // Server streak was active and dates are consecutive → sum the streaks
    return serverStreak + anonStreak;
  }

  // Case 3: Server streak is old/broken → use anonymous streak
  return anonStreak;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  streak: number;
  lastStreakDate?: string; // ISO date string of last streak-contributing activity
  isPremium: boolean;
  rexCustomization: string;
  glucoseUnit: GlucoseUnit;
  notificationsEnabled: boolean;
  createdAt: string;
  friendsCount?: number;
  accountType: AccountType;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  authToken: string | null;
  refreshToken: string | null;
  anonymousId: string | null;
  notificationsCount: number;
  recentAchievements: number;
  friendCount: number;

  // Actions
  setUser: (user: User | null) => void;
  setAuthToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  updateUser: (updates: Partial<User>) => void;
  addXp: (amount: number) => void;
  updateStreak: (days: number) => void;
  setNotificationsCount: (count: number) => void;
  setRecentAchievements: (count: number) => void;
  setFriendCount: (count: number) => void;
  setPremium: (isPremium: boolean) => void;
  logout: () => void;
  initializeAnonymousUser: () => void;
  linkAccount: (registeredUser: User, authToken: string, refreshToken?: string) => User;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      authToken: null,
      refreshToken: null,
      anonymousId: null,
      notificationsCount: 0,
      recentAchievements: 0,
      friendCount: 0,

      setUser: (user) => set({
        user,
        isAuthenticated: !!user && user.accountType === 'registered',
        friendCount: user?.friendsCount || 0,
      }),

      setAuthToken: (token) => set({ authToken: token }),

      setRefreshToken: (token) => set({ refreshToken: token }),

      setTokens: (accessToken, refreshToken) => set({ authToken: accessToken, refreshToken }),

      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),

      addXp: (amount) => set((state) => {
        if (!state.user) return state;

        const newXp = state.user.xp + amount;
        const newLevel = Math.floor(newXp / 100) + 1;

        return {
          user: {
            ...state.user,
            xp: newXp,
            level: newLevel,
          },
        };
      }),

      updateStreak: (days) => set((state) => ({
        user: state.user ? {
          ...state.user,
          streak: days,
          lastStreakDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        } : null,
      })),

      setNotificationsCount: (count) => set({ notificationsCount: count }),

      setRecentAchievements: (count) => set({ recentAchievements: count }),

      setFriendCount: (count) => set({ friendCount: count }),

      setPremium: (isPremium) => set((state) => ({
        user: state.user ? { ...state.user, isPremium } : null,
      })),

      logout: () => set({
        user: null,
        isAuthenticated: false,
        authToken: null,
        refreshToken: null,
        notificationsCount: 0,
        recentAchievements: 0,
        friendCount: 0,
      }),

      initializeAnonymousUser: () => {
        const state = get();
        // Only initialize if no user exists
        if (state.user) return;

        const anonymousId = state.anonymousId || uuidv4();
        const anonymousUser: User = {
          id: anonymousId,
          email: '',
          name: 'Invitado',
          xp: 0,
          level: 1,
          streak: 0,
          isPremium: false,
          rexCustomization: 'default',
          glucoseUnit: 'MG_DL',
          notificationsEnabled: true,
          createdAt: new Date().toISOString(),
          accountType: 'anonymous',
        };

        set({
          user: anonymousUser,
          anonymousId,
          isAuthenticated: false,
        });
      },

      linkAccount: (registeredUser, authToken, refreshToken) => {
        const state = get();
        let finalUser: User;

        if (state.user?.accountType === 'anonymous') {
          // Merge anonymous progress into the account
          // XP is always summed (user earned it while in guest mode)
          const totalXp = registeredUser.xp + (state.user.xp || 0);
          const newLevel = Math.floor(totalXp / 100) + 1;

          // Streak logic: check if streaks can be combined based on dates
          const finalStreak = calculateMergedStreak(
            registeredUser.streak,
            registeredUser.lastStreakDate,
            state.user.streak,
            state.user.lastStreakDate
          );

          finalUser = {
            ...registeredUser,
            xp: totalXp,
            streak: finalStreak,
            lastStreakDate: state.user.lastStreakDate || registeredUser.lastStreakDate,
            level: newLevel,
            accountType: 'registered',
          };
        } else {
          // No anonymous user, use server data directly
          finalUser = {
            ...registeredUser,
            accountType: 'registered',
          };
        }

        set({
          user: finalUser,
          authToken,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          // Keep anonymousId for potential future reference
        });

        return finalUser;
      },
    }),
    {
      name: 'rangexp-user',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        authToken: state.authToken,
        refreshToken: state.refreshToken,
        anonymousId: state.anonymousId,
      }),
    }
  )
);
