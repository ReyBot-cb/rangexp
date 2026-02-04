import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  hasCompletedOnboarding: boolean;
  onboardingCompletedAt: string | null;

  // Actions
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      onboardingCompletedAt: null,

      completeOnboarding: () => set({
        hasCompletedOnboarding: true,
        onboardingCompletedAt: new Date().toISOString(),
      }),

      resetOnboarding: () => set({
        hasCompletedOnboarding: false,
        onboardingCompletedAt: null,
      }),
    }),
    {
      name: 'rangexp-app',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
