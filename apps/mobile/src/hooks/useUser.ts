import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore, useGlucoseStore, User as StoreUser } from '../store';
import { GlucoseReading } from '../store/glucoseStore';
import { apiClient, setAuthToken, setRefreshToken } from '@rangexp/api-client';
import { User as ApiUser, GAMIFICATION } from '@rangexp/types';

interface AuthResponse {
  user: ApiUser;
  accessToken?: string;
  refreshToken?: string;
}

// Map API User to Store User
function mapApiUserToStoreUser(apiUser: ApiUser): StoreUser {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: [apiUser.firstName, apiUser.lastName].filter(Boolean).join(' ') || apiUser.email,
    avatar: apiUser.avatarUrl || undefined,
    xp: apiUser.xp,
    level: apiUser.level,
    streak: apiUser.streak,
    lastStreakDate: apiUser.lastStreakDate || undefined,
    isPremium: apiUser.isPremium,
    rexCustomization: apiUser.rexCustomization,
    glucoseUnit: apiUser.glucoseUnit,
    notificationsEnabled: true, // Default value
    createdAt: apiUser.createdAt,
    accountType: 'registered',
  };
}

export function useUser() {
  const { setUser } = useUserStore();

  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await apiClient.get<AuthResponse>('/auth/me');
      const storeUser = mapApiUserToStoreUser(data.user);
      setUser(storeUser);
      return storeUser;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Helper to sync pending glucose readings to backend
async function syncPendingReadingsToBackend(readings: GlucoseReading[]) {
  const pendingReadings = readings.filter(r => !r.synced);

  for (const reading of pendingReadings) {
    try {
      await apiClient.post('/glucose', {
        value: reading.value,
        unit: reading.unit,
        context: reading.context.toUpperCase(),
        recordedAt: reading.timestamp,
        ...(reading.notes && { note: reading.notes }),
      });
    } catch (error) {
      console.log('Failed to sync reading:', reading.id, error);
    }
  }
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { linkAccount, user: currentUser } = useUserStore();
  const { clearReadings, readings } = useGlucoseStore();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      // Capture anonymous data before login
      const anonymousXp = currentUser?.accountType === 'anonymous' ? currentUser.xp : 0;
      const pendingReadings = readings.filter(r => !r.synced);

      const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return {
        user: mapApiUserToStoreUser(data.user),
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        anonymousXp,
        pendingReadings,
      };
    },
    onSuccess: async ({ user, accessToken, refreshToken, anonymousXp, pendingReadings }) => {
      if (accessToken) {
        setAuthToken(accessToken);
      }
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }

      const mergedUser = linkAccount(user, accessToken || '', refreshToken);
      queryClient.setQueryData(['user'], mergedUser);

      // Sync pending glucose readings to backend (this also triggers XP/streak on backend)
      if (pendingReadings.length > 0 && accessToken) {
        await syncPendingReadingsToBackend(pendingReadings);
      }

      // Sync any additional anonymous XP that wasn't from glucose readings
      // (Each glucose reading gives 5 XP on backend, so subtract that)
      const xpFromReadings = pendingReadings.length * GAMIFICATION.XP.GLUCOSE_LOG;
      const extraXp = anonymousXp - xpFromReadings;
      if (extraXp > 0 && accessToken) {
        try {
          await apiClient.post('/gamification/xp', {
            amount: extraXp,
            reason: 'anonymous_merge'
          });
        } catch (error) {
          console.log('Failed to sync extra XP to backend:', error);
        }
      }

      // Clear local readings after syncing
      clearReadings();

      queryClient.invalidateQueries({ queryKey: ['glucose-readings'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { linkAccount, anonymousId, user: currentUser } = useUserStore();
  const { clearReadings, readings } = useGlucoseStore();

  return useMutation({
    mutationFn: async (userData: { email: string; password: string; name: string }) => {
      // Capture anonymous data before register
      const anonymousXp = currentUser?.accountType === 'anonymous' ? currentUser.xp : 0;
      const pendingReadings = readings.filter(r => !r.synced);

      const { data } = await apiClient.post<AuthResponse>('/auth/register', {
        email: userData.email,
        password: userData.password,
        firstName: userData.name,
        anonymousId: anonymousId || undefined,
      });
      return {
        user: mapApiUserToStoreUser(data.user),
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        anonymousXp,
        pendingReadings,
      };
    },
    onSuccess: async ({ user, accessToken, refreshToken, anonymousXp, pendingReadings }) => {
      if (accessToken) {
        setAuthToken(accessToken);
      }
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }

      const mergedUser = linkAccount(user, accessToken || '', refreshToken);
      queryClient.setQueryData(['user'], mergedUser);

      // Sync pending glucose readings to backend (this also triggers XP/streak on backend)
      if (pendingReadings.length > 0 && accessToken) {
        await syncPendingReadingsToBackend(pendingReadings);
      }

      // Sync any additional anonymous XP that wasn't from glucose readings
      const xpFromReadings = pendingReadings.length * GAMIFICATION.XP.GLUCOSE_LOG;
      const extraXp = anonymousXp - xpFromReadings;
      if (extraXp > 0 && accessToken) {
        try {
          await apiClient.post('/gamification/xp', {
            amount: extraXp,
            reason: 'anonymous_merge'
          });
        } catch (error) {
          console.log('Failed to sync extra XP to backend:', error);
        }
      }

      // Clear local readings after syncing
      clearReadings();

      queryClient.invalidateQueries({ queryKey: ['glucose-readings'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { logout, setAuthToken: setStoreToken, setRefreshToken: setStoreRefreshToken } = useUserStore();

  return useMutation({
    mutationFn: async () => {
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        // Ignore API errors - we'll logout locally anyway
        console.log('API logout failed, proceeding with local logout');
      }
    },
    onSettled: () => {
      // Always perform local logout, regardless of API success/failure
      setAuthToken(null); // Clear from apiClient
      setRefreshToken(null); // Clear from apiClient
      setStoreToken(null); // Clear from store
      setStoreRefreshToken(null); // Clear from store
      logout();
      queryClient.clear();
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { updateUser } = useUserStore();

  return useMutation({
    mutationFn: async (updates: Partial<{ name: string; glucoseUnit: string; notificationsEnabled: boolean }>) => {
      const { data } = await apiClient.put<AuthResponse>('/auth/profile', updates);
      return mapApiUserToStoreUser(data.user);
    },
    onSuccess: (storeUser) => {
      updateUser(storeUser);
      queryClient.setQueryData(['user'], storeUser);
    },
  });
}
