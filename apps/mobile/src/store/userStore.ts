import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type GlucoseUnit = 'MG_DL' | 'MMOL_L';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  streak: number;
  isPremium: boolean;
  rexCustomization: string;
  glucoseUnit: GlucoseUnit;
  notificationsEnabled: boolean;
  createdAt: string;
  friendsCount?: number;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  notificationsCount: number;
  recentAchievements: number;
  friendCount: number;
  
  // Actions
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  addXp: (amount: number) => void;
  updateStreak: (days: number) => void;
  setNotificationsCount: (count: number) => void;
  setRecentAchievements: (count: number) => void;
  setFriendCount: (count: number) => void;
  setPremium: (isPremium: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      notificationsCount: 0,
      recentAchievements: 0,
      friendCount: 0,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        friendCount: user?.friendsCount || 0,
      }),
      
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
        user: state.user ? { ...state.user, streak: days } : null,
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
        notificationsCount: 0,
        recentAchievements: 0,
        friendCount: 0,
      }),
    }),
    {
      name: 'rangexp-user',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
