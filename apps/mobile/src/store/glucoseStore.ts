import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export type GlucoseStatus = 'low' | 'normal' | 'high';
export type GlucoseContext = 'fasting' | 'before_meal' | 'after_meal' | 'bedtime' | 'other';

export interface GlucoseReading {
  id: string;
  value: number;
  unit: 'MG_DL' | 'MMOL_L';
  status: GlucoseStatus;
  context: GlucoseContext;
  notes?: string;
  timestamp: string;
  synced: boolean;
}

export interface GlucoseStats {
  average: number;
  readingsCount: number;
  lowCount: number;
  normalCount: number;
  highCount: number;
  timeInRange: number;
}

const calculateStatus = (value: number, unit: 'MG_DL' | 'MMOL_L'): GlucoseStatus => {
  const mgDl = unit === 'MMOL_L' ? value * 18.0182 : value;
  
  if (mgDl < 70) return 'low';
  if (mgDl > 180) return 'high';
  return 'normal';
};

const calculateStats = (readings: GlucoseReading[]): GlucoseStats => {
  if (readings.length === 0) {
    return {
      average: 0,
      readingsCount: 0,
      lowCount: 0,
      normalCount: 0,
      highCount: 0,
      timeInRange: 0,
    };
  }

  const total = readings.reduce((sum, r) => sum + r.value, 0);
  const average = total / readings.length;
  
  const lowCount = readings.filter(r => r.status === 'low').length;
  const normalCount = readings.filter(r => r.status === 'normal').length;
  const highCount = readings.filter(r => r.status === 'high').length;
  
  const timeInRange = (normalCount / readings.length) * 100;

  return {
    average: Math.round(average),
    readingsCount: readings.length,
    lowCount,
    normalCount,
    highCount,
    timeInRange: Math.round(timeInRange),
  };
};

export const useGlucoseStore = create<{
  readings: GlucoseReading[];
  pendingSync: GlucoseReading[];
  stats: GlucoseStats | null;
  
  addReading: (reading: Omit<GlucoseReading, 'id' | 'synced' | 'status'>) => void;
  updateReading: (id: string, updates: Partial<GlucoseReading>) => void;
  deleteReading: (id: string) => void;
  setReadings: (readings: GlucoseReading[]) => void;
  syncPendingReadings: () => void;
  calculateStats: () => void;
  getTodayReadings: () => GlucoseReading[];
  getRecentReadings: (limit?: number) => GlucoseReading[];
}>()(
  persist(
    (set, get) => ({
      readings: [],
      pendingSync: [],
      stats: null,

      addReading: (readingData) => {
        const newReading: GlucoseReading = {
          ...readingData,
          id: uuidv4(),
          status: calculateStatus(readingData.value, readingData.unit),
          synced: false,
        };

        set((state) => ({
          readings: [newReading, ...state.readings],
          pendingSync: [...state.pendingSync, newReading],
        }));

        get().calculateStats();
      },

      updateReading: (id, updates) => {
        set((state) => ({
          readings: state.readings.map((r) =>
            r.id === id ? { ...r, ...updates, status: calculateStatus(updates.value || r.value, r.unit) } : r
          ),
        }));
        get().calculateStats();
      },

      deleteReading: (id) => {
        set((state) => ({
          readings: state.readings.filter((r) => r.id !== id),
        }));
        get().calculateStats();
      },

      setReadings: (readings) => {
        set({ readings });
        get().calculateStats();
      },

      syncPendingReadings: () => {
        set((state) => ({
          readings: state.readings.map((r) =>
            state.pendingSync.find((p) => p.id === r.id) ? { ...r, synced: true } : r
          ),
          pendingSync: [],
        }));
      },

      calculateStats: () => {
        const stats = calculateStats(get().readings);
        set({ stats });
      },

      getTodayReadings: () => {
        const today = new Date().toDateString();
        return get().readings.filter((r) => new Date(r.timestamp).toDateString() === today);
      },

      getRecentReadings: (limit = 5) => {
        return get().readings.slice(0, limit);
      },
    }),
    {
      name: 'rangexp-glucose',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        readings: state.readings,
      }),
    }
  )
);
