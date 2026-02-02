import { renderHook, waitFor, act } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { apiClient } from '@rangexp/api-client';
import {
  useFriends,
  useFriendRequests,
  useActivityFeed,
  useAddFriend,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useLikeActivity,
  useSearchUsers,
} from '../useSocial';
import { useSocialStore } from '../../store/socialStore';

// Mock the api client
jest.mock('@rangexp/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock the social store
jest.mock('../../store/socialStore', () => ({
  useSocialStore: jest.fn(),
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockUseSocialStore = useSocialStore as jest.MockedFunction<typeof useSocialStore>;

describe('useSocial hooks', () => {
  let queryClient: QueryClient;

  const mockFriends = [
    {
      id: 'friend-1',
      name: 'Jane Doe',
      avatar: 'https://example.com/avatar.jpg',
      level: 5,
      streak: 10,
      isOnline: true,
    },
  ];

  const mockRequests = [
    {
      id: 'request-1',
      fromUser: {
        id: 'user-2',
        name: 'Bob Smith',
        avatar: null,
      },
      timestamp: '2024-01-15T10:00:00Z',
    },
  ];

  const mockActivities = [
    {
      id: 'activity-1',
      type: 'glucose',
      userId: 'user-1',
      userName: 'John Doe',
      content: 'Recorded a glucose reading',
      timestamp: '2024-01-15T10:00:00Z',
      likes: 5,
      comments: 2,
    },
  ];

  const mockStoreActions = {
    setFriends: jest.fn(),
    setPendingRequests: jest.fn(),
    setActivityFeed: jest.fn(),
    acceptRequest: jest.fn(),
    declineRequest: jest.fn(),
    likeActivity: jest.fn(),
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
    mockUseSocialStore.mockReturnValue(mockStoreActions as any);
  });

  describe('useFriends', () => {
    it('should fetch friends and update store', async () => {
      mockApiClient.get.mockResolvedValue({ data: { friends: mockFriends } });

      const { result } = renderHook(() => useFriends(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.get).toHaveBeenCalledWith('/friends');
      expect(mockStoreActions.setFriends).toHaveBeenCalledWith(mockFriends);
    });
  });

  describe('useFriendRequests', () => {
    it('should fetch friend requests and update store', async () => {
      mockApiClient.get.mockResolvedValue({ data: { requests: mockRequests } });

      const { result } = renderHook(() => useFriendRequests(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.get).toHaveBeenCalledWith('/friends/requests');
      expect(mockStoreActions.setPendingRequests).toHaveBeenCalledWith(mockRequests);
    });
  });

  describe('useActivityFeed', () => {
    it('should fetch activity feed and update store', async () => {
      mockApiClient.get.mockResolvedValue({ data: { activities: mockActivities } });

      const { result } = renderHook(() => useActivityFeed(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.get).toHaveBeenCalledWith('/feed');
      expect(mockStoreActions.setActivityFeed).toHaveBeenCalledWith(mockActivities);
    });
  });

  describe('useAddFriend', () => {
    it('should send friend request via API', async () => {
      mockApiClient.post.mockResolvedValue({ data: { message: 'Request sent' } });

      const { result } = renderHook(() => useAddFriend(), { wrapper });

      act(() => {
        result.current.mutate('user-2');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.post).toHaveBeenCalledWith('/friends/user-2');
    });
  });

  describe('useAcceptFriendRequest', () => {
    it('should accept request in store and call API', async () => {
      mockApiClient.post.mockResolvedValue({ data: { message: 'Accepted' } });

      const { result } = renderHook(() => useAcceptFriendRequest(), { wrapper });

      act(() => {
        result.current.mutate('request-1');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockStoreActions.acceptRequest).toHaveBeenCalledWith('request-1');
      expect(mockApiClient.post).toHaveBeenCalledWith('/friends/requests/request-1/accept');
    });
  });

  describe('useDeclineFriendRequest', () => {
    it('should decline request in store and call API', async () => {
      mockApiClient.delete.mockResolvedValue({});

      const { result } = renderHook(() => useDeclineFriendRequest(), { wrapper });

      act(() => {
        result.current.mutate('request-1');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockStoreActions.declineRequest).toHaveBeenCalledWith('request-1');
      expect(mockApiClient.delete).toHaveBeenCalledWith('/friends/requests/request-1');
    });
  });

  describe('useLikeActivity', () => {
    it('should like activity in store and call API', async () => {
      mockApiClient.post.mockResolvedValue({});

      const { result } = renderHook(() => useLikeActivity(), { wrapper });

      act(() => {
        result.current.mutate('activity-1');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockStoreActions.likeActivity).toHaveBeenCalledWith('activity-1');
      expect(mockApiClient.post).toHaveBeenCalledWith('/feed/activity-1/like');
    });
  });

  describe('useSearchUsers', () => {
    it('should search users via API', async () => {
      const searchResults = [
        { id: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      ];
      mockApiClient.get.mockResolvedValue({ data: { users: searchResults } });

      const { result } = renderHook(() => useSearchUsers(), { wrapper });

      act(() => {
        result.current.mutate('john');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.get).toHaveBeenCalledWith('/users/search?q=john');
      expect(result.current.data).toEqual(searchResults);
    });

    it('should encode search query', async () => {
      mockApiClient.get.mockResolvedValue({ data: { users: [] } });

      const { result } = renderHook(() => useSearchUsers(), { wrapper });

      act(() => {
        result.current.mutate('john doe');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.get).toHaveBeenCalledWith('/users/search?q=john%20doe');
    });
  });
});
