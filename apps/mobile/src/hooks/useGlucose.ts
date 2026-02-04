import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGlucoseStore, GlucoseContext, GlucoseReading } from '../store/glucoseStore';
import { useUserStore } from '../store/userStore';
import { apiClient, getAuthToken } from '@rangexp/api-client';

interface GlucoseReadingsResponse {
  readings: GlucoseReading[];
}

export function useGlucoseReadings(options?: { startDate?: string; endDate?: string }) {
  const { setReadings, readings: localReadings } = useGlucoseStore();
  const { isAuthenticated } = useUserStore();

  return useQuery({
    queryKey: ['glucose-readings', options],
    queryFn: async () => {
      // Only fetch from backend if authenticated
      if (!isAuthenticated || !getAuthToken()) {
        return localReadings;
      }

      let url = '/glucose';
      if (options?.startDate || options?.endDate) {
        const params = new URLSearchParams();
        if (options.startDate) params.append('startDate', options.startDate);
        if (options.endDate) params.append('endDate', options.endDate);
        url += `?${params.toString()}`;
      }
      const { data } = await apiClient.get<GlucoseReadingsResponse>(url);
      setReadings(data.readings);
      return data.readings;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useAddGlucose() {
  const queryClient = useQueryClient();
  const { addReading, syncPendingReadings } = useGlucoseStore();
  const { isAuthenticated } = useUserStore();

  return useMutation({
    mutationFn: async (reading: { value: number; context: GlucoseContext; notes?: string; timestamp?: string }) => {
      const recordedAt = reading.timestamp || new Date().toISOString();

      addReading({
        value: reading.value,
        context: reading.context,
        notes: reading.notes,
        timestamp: recordedAt,
        unit: 'MG_DL',
      });
      console.log('reading', reading)
      // Only sync to backend if user is authenticated
      if (isAuthenticated && getAuthToken()) {
        const payload = {
          value: reading.value,
          unit: 'MG_DL',
          context: reading.context.toUpperCase(),
          recordedAt,
          ...(reading.notes && { note: reading.notes }),
        };

        const response = await apiClient.post('/glucose', payload);
        console.log('response', response);
        syncPendingReadings();
      }

      return reading;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glucose-readings'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeleteGlucose() {
  const queryClient = useQueryClient();
  const { deleteReading } = useGlucoseStore();
  const { isAuthenticated } = useUserStore();

  return useMutation({
    mutationFn: async (id: string) => {
      deleteReading(id);

      // Only delete from backend if authenticated
      if (isAuthenticated && getAuthToken()) {
        await apiClient.delete(`/glucose/${id}`);
      }

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

  if (!readings) return null;

  const total = readings.reduce((sum: number, r: any) => sum + r.value, 0);
  const average = readings.length > 0 ? Math.round(total / readings.length) : 0;
  
  const lowCount = readings.filter((r: any) => r.status === 'low').length;
  const normalCount = readings.filter((r: any) => r.status === 'normal').length;
  const highCount = readings.filter((r: any) => r.status === 'high').length;
  
  const timeInRange = readings.length > 0 
    ? Math.round((normalCount / readings.length) * 100) 
    : 0;

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
    (r: any) => new Date(r.timestamp).toDateString() === today
  ) || [];

  const total = todayReadings.reduce((sum: number, r: any) => sum + r.value, 0);
  const average = todayReadings.length > 0 ? Math.round(total / todayReadings.length) : 0;

  return {
    readings: todayReadings,
    count: todayReadings.length,
    average,
  };
}
