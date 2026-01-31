import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Friend {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  streak: number;
  isOnline: boolean;
  lastActive?: string;
}

export interface FriendRequest {
  id: string;
  fromUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
}

export interface ActivityItem {
  id: string;
  type: 'glucose' | 'achievement' | 'streak' | 'level' | 'friend';
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
}

interface SocialState {
  friends: Friend[];
  pendingRequests: FriendRequest[];
  activityFeed: ActivityItem[];
  friendCount: number;
  
  setFriends: (friends: Friend[]) => void;
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  setPendingRequests: (requests: FriendRequest[]) => void;
  acceptRequest: (requestId: string) => void;
  declineRequest: (requestId: string) => void;
  setActivityFeed: (feed: ActivityItem[]) => void;
  addActivityItem: (item: ActivityItem) => void;
  setFriendCount: (count: number) => void;
  likeActivity: (activityId: string) => void;
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      friends: [],
      pendingRequests: [],
      activityFeed: [],
      friendCount: 0,

      setFriends: (friends) => set({ friends, friendCount: friends.length }),

      addFriend: (friend) => set((state) => ({
        friends: [...state.friends, friend],
        friendCount: state.friendCount + 1,
      })),

      removeFriend: (friendId) => set((state) => ({
        friends: state.friends.filter((f) => f.id !== friendId),
        friendCount: Math.max(0, state.friendCount - 1),
      })),

      setPendingRequests: (requests) => set({ pendingRequests: requests }),

      acceptRequest: (requestId) => set((state) => ({
        pendingRequests: state.pendingRequests.filter((r) => r.id !== requestId),
      })),

      declineRequest: (requestId) => set((state) => ({
        pendingRequests: state.pendingRequests.filter((r) => r.id !== requestId),
      })),

      setActivityFeed: (feed) => set({ activityFeed: feed }),

      addActivityItem: (item) => set((state) => ({
        activityFeed: [item, ...state.activityFeed],
      })),

      setFriendCount: (count) => set({ friendCount: count }),

      likeActivity: (activityId) => set((state) => ({
        activityFeed: state.activityFeed.map((item) =>
          item.id === activityId ? { ...item, likes: item.likes + 1 } : item
        ),
      })),
    }),
    {
      name: 'rangexp-social',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        friends: state.friends,
        pendingRequests: state.pendingRequests,
      }),
    }
  )
);
