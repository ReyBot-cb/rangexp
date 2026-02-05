import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGlucoseStore, GlucoseContext, GlucoseReading } from '../store/glucoseStore';
import { useUserStore } from '../store/userStore';
import { apiClient, getAuthToken } from '@rangexp/api-client';
import { addLocalXp, updateLocalStreak, isAnonymousUser } from '../services/syncService';
import { GAMIFICATION } from '@rangexp/types';

interface GlucoseReadingsResponse {
  data: Array<{
    id: string;
    value: number;
    unit: 'MG_DL' | 'MMOL_L';
    note?: string;
    recordedAt: string;
    context?: string;
  }>;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Transform backend reading to local format
function transformBackendReading(reading: GlucoseReadingsResponse['data'][0]): GlucoseReading {
  const value = reading.value;
  let status: 'low' | 'normal' | 'high' = 'normal';
  if (value < 70) status = 'low';
  else if (value > 180) status = 'high';

  return {
    id: reading.id,
    value: reading.value,
    unit: reading.unit,
    status,
    context: (reading.context?.toLowerCase() || 'other') as GlucoseContext,
    notes: reading.note,
    timestamp: reading.recordedAt,
    synced: true,
  };
}

export function useGlucoseReadings(options?: { startDate?: string; endDate?: string }) {
  const { readings: localReadings, setReadings } = useGlucoseStore();
  const { user } = useUserStore();
  const isAnonymous = user?.accountType === 'anonymous';

  return useQuery({
    queryKey: ['glucose-readings', options, isAnonymous],
    queryFn: async () => {
      // Anonymous users: return local readings only
      if (isAnonymous || !getAuthToken()) {
        return localReadings;
      }

      // Registered users: fetch from backend
      let url = '/glucose';
      const params = new URLSearchParams();
      if (options?.startDate) params.append('startDate', options.startDate);
      if (options?.endDate) params.append('endDate', options.endDate);
      params.append('limit', '100'); // Get more readings
      if (params.toString()) url += `?${params.toString()}`;

      const { data } = await apiClient.get<GlucoseReadingsResponse>(url);
      const readings = data.data.map(transformBackendReading);

      // Update local store for caching (but mark as synced)
      setReadings(readings);

      return readings;
    },
    staleTime: isAnonymous ? Infinity : 2 * 60 * 1000, // Anonymous data doesn't stale
  });
}

export function useAddGlucose() {
  const queryClient = useQueryClient();
  const { addReading } = useGlucoseStore();
  const { user } = useUserStore();
  const isAnonymous = user?.accountType === 'anonymous';

  return useMutation({
    mutationFn: async (reading: { value: number; context: GlucoseContext; notes?: string; timestamp?: string }) => {
      const recordedAt = reading.timestamp || new Date().toISOString();

      if (isAnonymous || !getAuthToken()) {
        // Anonymous user: save locally only
        addReading({
          value: reading.value,
          context: reading.context,
          notes: reading.notes,
          timestamp: recordedAt,
          unit: 'MG_DL',
        });

        // Update local XP and streak
        addLocalXp(GAMIFICATION.XP.GLUCOSE_LOG);
        updateLocalStreak();

        return { ...reading, isLocal: true };
      }

      // Registered user: send to backend only (backend handles XP/streak)
      const payload = {
        value: reading.value,
        unit: 'MG_DL',
        context: reading.context.toUpperCase(),
        recordedAt,
        ...(reading.notes && { note: reading.notes }),
      };

      await apiClient.post('/glucose', payload);

      return { ...reading, isLocal: false };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['glucose-readings'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });

      // Only refresh user data for registered users (backend updates XP/streak)
      if (!isAnonymous && getAuthToken()) {
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
    },
  });
}

export function useDeleteGlucose() {
  const queryClient = useQueryClient();
  const { deleteReading } = useGlucoseStore();
  const { user } = useUserStore();
  const isAnonymous = user?.accountType === 'anonymous';

  return useMutation({
    mutationFn: async (id: string) => {
      if (isAnonymous || !getAuthToken()) {
        // Anonymous user: delete locally only
        deleteReading(id);
        return id;
      }

      // Registered user: delete from backend
      await apiClient.delete(`/glucose/${id}`);
      deleteReading(id); // Also remove from local cache

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glucose-readings'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useGlucoseStats() {
  const { data: readings } = useGlucoseReadings();

  if (!readings || readings.length === 0) {
    return {
      average: 0,
      readingsCount: 0,
      lowCount: 0,
      normalCount: 0,
      highCount: 0,
      timeInRange: 0,
    };
  }

  const total = readings.reduce((sum: number, r) => sum + r.value, 0);
  const average = Math.round(total / readings.length);

  const lowCount = readings.filter((r) => r.status === 'low').length;
  const normalCount = readings.filter((r) => r.status === 'normal').length;
  const highCount = readings.filter((r) => r.status === 'high').length;

  const timeInRange = Math.round((normalCount / readings.length) * 100);

  return {
    average,
    readingsCount: readings.length,
    lowCount,
    normalCount,
    highCount,
    timeInRange,
  };
}

export function useTodayStats() {
  const { data: readings } = useGlucoseReadings();
  const today = new Date().toDateString();

  const todayReadings = readings?.filter(
    (r) => new Date(r.timestamp).toDateString() === today
  ) || [];

  const total = todayReadings.reduce((sum: number, r) => sum + r.value, 0);
  const average = todayReadings.length > 0 ? Math.round(total / todayReadings.length) : 0;

  return {
    readings: todayReadings,
    count: todayReadings.length,
    average,
  };
}
