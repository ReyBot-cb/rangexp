import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore, User as StoreUser } from '../store';
import { apiClient, setAuthToken, setRefreshToken, getAuthToken } from '@rangexp/api-client';
import { User as ApiUser } from '@rangexp/types';
import { performFullSync, getPendingLocalData } from '../services/syncService';

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
    notificationsEnabled: true,
    createdAt: apiUser.createdAt,
    accountType: 'registered',
  };
}

export function useUser() {
  const { setUser, user } = useUserStore();
  const isAnonymous = user?.accountType === 'anonymous';

  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      // Anonymous users: return local user data
      if (isAnonymous || !getAuthToken()) {
        return user;
      }

      // Registered users: fetch from backend
      const { data } = await apiClient.get<AuthResponse>('/auth/me');
      const storeUser = mapApiUserToStoreUser(data.user);
      setUser(storeUser);
      return storeUser;
    },
    staleTime: isAnonymous ? Infinity : 5 * 60 * 1000,
    enabled: !!user, // Only run if user exists
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { linkAccount, user: currentUser, anonymousId } = useUserStore();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      // Capture pending local data before login
      const pendingData = getPendingLocalData();

      const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);

      return {
        user: mapApiUserToStoreUser(data.user),
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        pendingData,
      };
    },
    onSuccess: async ({ user, accessToken, refreshToken, pendingData }) => {
      // Set auth tokens
      if (accessToken) {
        setAuthToken(accessToken);
      }
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }

      // Link account (merges anonymous data if exists)
      const mergedUser = linkAccount(user, accessToken || '', refreshToken);
      queryClient.setQueryData(['user'], mergedUser);

      // Sync local data to backend and clear local storage
      if (pendingData.hasDataToSync) {
        console.log('[useLogin] Syncing local data to backend...');
        await performFullSync();
        console.log('[useLogin] Sync complete');
      }

      // Refresh all data from backend
      queryClient.invalidateQueries({ queryKey: ['glucose-readings'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { linkAccount, anonymousId, user: currentUser } = useUserStore();

  return useMutation({
    mutationFn: async (userData: { email: string; password: string; name: string }) => {
      // Capture pending local data before register
      const pendingData = getPendingLocalData();

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
        pendingData,
      };
    },
    onSuccess: async ({ user, accessToken, refreshToken, pendingData }) => {
      // Set auth tokens
      if (accessToken) {
        setAuthToken(accessToken);
      }
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }

      // Link account (merges anonymous data if exists)
      const mergedUser = linkAccount(user, accessToken || '', refreshToken);
      queryClient.setQueryData(['user'], mergedUser);

      // Sync local data to backend and clear local storage
      if (pendingData.hasDataToSync) {
        console.log('[useRegister] Syncing local data to backend...');
        await performFullSync();
        console.log('[useRegister] Sync complete');
      }

      // Refresh all data from backend
      queryClient.invalidateQueries({ queryKey: ['glucose-readings'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
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
        console.log('[useLogout] API logout failed, proceeding with local logout');
      }
    },
    onSettled: () => {
      // Clear auth tokens
      setAuthToken(null);
      setRefreshToken(null);
      setStoreToken(null);
      setStoreRefreshToken(null);

      // Logout user (this will allow re-initializing as anonymous)
      logout();

      // Clear all cached data
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
