import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  userId: string | null;
  xp: number;
  streak: number;
  level: number;
  isPremium: boolean;
  rexCustomization: string;
  glucoseUnit: "MG_DL" | "MMOL_L";
  
  // Actions
  setUser: (user: Partial<UserState>) => void;
  addXp: (amount: number) => void;
  updateStreak: (days: number) => void;
  setPremium: (isPremium: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userId: null,
      xp: 0,
      streak: 0,
      level: 1,
      isPremium: false,
      rexCustomization: "default",
      glucoseUnit: "MG_DL",

      setUser: (userData) => set((state) => ({ ...state, ...userData })),
      
      addXp: (amount) => {
        const newXp = get().xp + amount;
        const newLevel = Math.floor(newXp / 100) + 1;
        set({ xp: newXp, level: newLevel });
      },
      
      updateStreak: (days) => set({ streak: days }),
      
      setPremium: (isPremium) => set({ isPremium }),
      
      logout: () => set({
        userId: null,
        xp: 0,
        streak: 0,
        level: 1,
        isPremium: false,
      }),
    }),
    {
      name: "rangexp-user",
      partialize: (state) => ({
        userId: state.userId,
        xp: state.xp,
        streak: state.streak,
        level: state.level,
        isPremium: state.isPremium,
        rexCustomization: state.rexCustomization,
        glucoseUnit: state.glucoseUnit,
      }),
    }
  )
);
