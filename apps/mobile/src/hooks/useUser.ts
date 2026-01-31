import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '../store';
import { apiClient } from '@rangexp/api-client';

export function useUser() {
  const { setUser } = useUserStore();

  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await apiClient.get('/auth/me');
      setUser(data.user);
      return data.user;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { setUser } = useUserStore();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await apiClient.post('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['user'], data.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { setUser } = useUserStore();

  return useMutation({
    mutationFn: async (userData: { email: string; password: string; name: string }) => {
      const { data } = await apiClient.post('/auth/register', userData);
      return data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['user'], data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { logout } = useUserStore();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
    onSuccess: () => {
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
      const { data } = await apiClient.put('/auth/profile', updates);
      return data;
    },
    onSuccess: (data) => {
      updateUser(data.user);
      queryClient.setQueryData(['user'], data.user);
    },
  });
}
