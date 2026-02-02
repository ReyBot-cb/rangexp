import { renderHook, waitFor, act } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { apiClient } from '@rangexp/api-client';
import { useUser, useLogin, useRegister, useLogout, useUpdateProfile } from '../useUser';
import { useUserStore } from '../../store';

// Mock the api client
jest.mock('@rangexp/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

// Mock the user store
jest.mock('../../store', () => ({
  useUserStore: jest.fn(),
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockUseUserStore = useUserStore as jest.MockedFunction<typeof useUserStore>;

describe('useUser hooks', () => {
  let queryClient: QueryClient;

  const mockApiUser = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
    xp: 150,
    level: 2,
    streak: 5,
    isPremium: false,
    rexCustomization: 'default',
    glucoseUnit: 'MG_DL' as const,
    createdAt: '2024-01-01T00:00:00Z',
  };

  const mockStoreActions = {
    setUser: jest.fn(),
    updateUser: jest.fn(),
    logout: jest.fn(),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    jest.clearAllMocks();
    mockUseUserStore.mockReturnValue(mockStoreActions as any);
  });

  describe('useUser', () => {
    it('should fetch user and update store on success', async () => {
      mockApiClient.get.mockResolvedValue({ data: { user: mockApiUser } });

      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(mockStoreActions.setUser).toHaveBeenCalled();
    });

    it('should map API user to store user format', async () => {
      mockApiClient.get.mockResolvedValue({ data: { user: mockApiUser } });

      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockStoreActions.setUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-1',
          name: 'John Doe',
          email: 'test@example.com',
        })
      );
    });

    it('should handle API error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useLogin', () => {
    it('should login user and update store', async () => {
      mockApiClient.post.mockResolvedValue({ data: { user: mockApiUser } });

      const { result } = renderHook(() => useLogin(), { wrapper });

      act(() => {
        result.current.mutate({ email: 'test@example.com', password: 'password123' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockStoreActions.setUser).toHaveBeenCalled();
    });

    it('should handle login failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useLogin(), { wrapper });

      act(() => {
        result.current.mutate({ email: 'test@example.com', password: 'wrongpassword' });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockStoreActions.setUser).not.toHaveBeenCalled();
    });
  });

  describe('useRegister', () => {
    it('should register user and update store', async () => {
      mockApiClient.post.mockResolvedValue({ data: { user: mockApiUser } });

      const { result } = renderHook(() => useRegister(), { wrapper });

      act(() => {
        result.current.mutate({
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register', {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New User',
      });
      expect(mockStoreActions.setUser).toHaveBeenCalled();
    });

    it('should handle registration failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Email already exists'));

      const { result } = renderHook(() => useRegister(), { wrapper });

      act(() => {
        result.current.mutate({
          email: 'existing@example.com',
          password: 'password123',
          name: 'User',
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useLogout', () => {
    it('should logout and clear store', async () => {
      mockApiClient.post.mockResolvedValue({});

      const { result } = renderHook(() => useLogout(), { wrapper });

      act(() => {
        result.current.mutate();
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/logout');
      expect(mockStoreActions.logout).toHaveBeenCalled();
    });

    it('should still logout locally even if API fails', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useLogout(), { wrapper });

      act(() => {
        result.current.mutate();
      });

      // Wait for mutation to complete (error state)
      await waitFor(() => expect(result.current.isError || result.current.isSuccess).toBe(true));

      expect(mockStoreActions.logout).toHaveBeenCalled();
    });
  });

  describe('useUpdateProfile', () => {
    it('should update profile and store', async () => {
      const updatedUser = { ...mockApiUser, firstName: 'Jane' };
      mockApiClient.put.mockResolvedValue({ data: { user: updatedUser } });

      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      act(() => {
        result.current.mutate({ name: 'Jane' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.put).toHaveBeenCalledWith('/auth/profile', { name: 'Jane' });
      expect(mockStoreActions.updateUser).toHaveBeenCalled();
    });
  });
});
