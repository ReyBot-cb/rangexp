import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore, User as StoreUser } from '../store';
import { apiClient, setAuthToken } from '@rangexp/api-client';
import { User as ApiUser } from '@rangexp/types';

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
    isPremium: apiUser.isPremium,
    rexCustomization: apiUser.rexCustomization,
    glucoseUnit: apiUser.glucoseUnit,
    notificationsEnabled: true, // Default value
    createdAt: apiUser.createdAt,
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

export function useLogin() {
  const queryClient = useQueryClient();
  const { setUser, setAuthToken: setStoreToken } = useUserStore();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
      if (data.accessToken) {
        setAuthToken(data.accessToken); // Set in apiClient for immediate use
        setStoreToken(data.accessToken); // Persist in store
      }
      return mapApiUserToStoreUser(data.user);
    },
    onSuccess: (storeUser) => {
      setUser(storeUser);
      queryClient.setQueryData(['user'], storeUser);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { setUser, setAuthToken: setStoreToken } = useUserStore();

  return useMutation({
    mutationFn: async (userData: { email: string; password: string; name: string }) => {
      // Backend expects firstName, not name
      const { data } = await apiClient.post<AuthResponse>('/auth/register', {
        email: userData.email,
        password: userData.password,
        firstName: userData.name,
      });
      if (data.accessToken) {
        setAuthToken(data.accessToken); // Set in apiClient for immediate use
        setStoreToken(data.accessToken); // Persist in store
      }
      return mapApiUserToStoreUser(data.user);
    },
    onSuccess: (storeUser) => {
      setUser(storeUser);
      queryClient.setQueryData(['user'], storeUser);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { logout, setAuthToken: setStoreToken } = useUserStore();

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
      setStoreToken(null); // Clear from store
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
