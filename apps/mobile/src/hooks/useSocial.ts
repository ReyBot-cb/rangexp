import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSocialStore } from '../store/socialStore';
import { apiClient } from '@rangexp/api-client';
import type { Friend, FriendRequest, ActivityItem } from '../store/socialStore';
import type { User } from '@rangexp/types';

interface FriendsResponse {
  friends: Friend[];
}

interface FriendRequestsResponse {
  requests: FriendRequest[];
}

interface ActivityFeedResponse {
  activities: ActivityItem[];
}

interface SearchUsersResponse {
  users: User[];
}

export function useFriends() {
  const { setFriends } = useSocialStore();

  return useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const { data } = await apiClient.get<FriendsResponse>('/friends');
      setFriends(data.friends);
      return data.friends;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFriendRequests() {
  const { setPendingRequests } = useSocialStore();

  return useQuery({
    queryKey: ['friend-requests'],
    queryFn: async () => {
      const { data } = await apiClient.get<FriendRequestsResponse>('/friends/requests');
      setPendingRequests(data.requests);
      return data.requests;
    },
    staleTime: 30 * 1000,
  });
}

export function useActivityFeed() {
  const { setActivityFeed } = useSocialStore();

  return useQuery({
    queryKey: ['activity-feed'],
    queryFn: async () => {
      const { data } = await apiClient.get<ActivityFeedResponse>('/feed');
      setActivityFeed(data.activities);
      return data.activities;
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useAddFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friendId: string) => {
      const { data } = await apiClient.post(`/friends/${friendId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['activity-feed'] });
    },
  });
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();
  const { acceptRequest } = useSocialStore();

  return useMutation({
    mutationFn: async (requestId: string) => {
      acceptRequest(requestId);
      const { data } = await apiClient.post(`/friends/requests/${requestId}/accept`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    },
  });
}

export function useDeclineFriendRequest() {
  const queryClient = useQueryClient();
  const { declineRequest } = useSocialStore();

  return useMutation({
    mutationFn: async (requestId: string) => {
      declineRequest(requestId);
      await apiClient.delete(`/friends/requests/${requestId}`);
      return requestId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    },
  });
}

export function useLikeActivity() {
  const queryClient = useQueryClient();
  const { likeActivity } = useSocialStore();

  return useMutation({
    mutationFn: async (activityId: string) => {
      likeActivity(activityId);
      await apiClient.post(`/feed/${activityId}/like`);
      return activityId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-feed'] });
    },
  });
}

export function useSearchUsers() {
  return useMutation({
    mutationFn: async (query: string) => {
      const { data } = await apiClient.get<SearchUsersResponse>(`/users/search?q=${encodeURIComponent(query)}`);
      return data.users;
    },
  });
}
