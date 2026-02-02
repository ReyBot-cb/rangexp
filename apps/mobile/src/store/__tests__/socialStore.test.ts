import { act } from '@testing-library/react-native';
import { useSocialStore, Friend, FriendRequest, ActivityItem } from '../socialStore';

describe('socialStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useSocialStore.setState({
        friends: [],
        pendingRequests: [],
        activityFeed: [],
        friendCount: 0,
      });
    });
  });

  const mockFriend: Friend = {
    id: 'friend-1',
    name: 'Jane Doe',
    avatar: 'https://example.com/avatar.jpg',
    level: 5,
    streak: 10,
    isOnline: true,
    lastActive: '2024-01-15T10:00:00Z',
  };

  const mockFriendRequest: FriendRequest = {
    id: 'request-1',
    fromUser: {
      id: 'user-2',
      name: 'Bob Smith',
      avatar: 'https://example.com/bob.jpg',
    },
    timestamp: '2024-01-15T10:00:00Z',
  };

  const mockActivity: ActivityItem = {
    id: 'activity-1',
    type: 'glucose',
    userId: 'user-1',
    userName: 'John Doe',
    userAvatar: 'https://example.com/john.jpg',
    content: 'Recorded a glucose reading of 120 mg/dL',
    timestamp: '2024-01-15T10:00:00Z',
    likes: 5,
    comments: 2,
  };

  describe('initial state', () => {
    it('should have empty friends array initially', () => {
      const state = useSocialStore.getState();
      expect(state.friends).toEqual([]);
    });

    it('should have empty pendingRequests array initially', () => {
      const state = useSocialStore.getState();
      expect(state.pendingRequests).toEqual([]);
    });

    it('should have empty activityFeed array initially', () => {
      const state = useSocialStore.getState();
      expect(state.activityFeed).toEqual([]);
    });

    it('should have zero friend count initially', () => {
      const state = useSocialStore.getState();
      expect(state.friendCount).toBe(0);
    });
  });

  describe('setFriends', () => {
    it('should set friends array', () => {
      const friends = [mockFriend];

      act(() => {
        useSocialStore.getState().setFriends(friends);
      });

      const state = useSocialStore.getState();
      expect(state.friends).toEqual(friends);
    });

    it('should update friendCount to match friends array length', () => {
      const friends = [mockFriend, { ...mockFriend, id: 'friend-2' }];

      act(() => {
        useSocialStore.getState().setFriends(friends);
      });

      const state = useSocialStore.getState();
      expect(state.friendCount).toBe(2);
    });

    it('should handle empty array', () => {
      act(() => {
        useSocialStore.getState().setFriends([mockFriend]);
        useSocialStore.getState().setFriends([]);
      });

      const state = useSocialStore.getState();
      expect(state.friends).toEqual([]);
      expect(state.friendCount).toBe(0);
    });
  });

  describe('addFriend', () => {
    it('should add a friend to the array', () => {
      act(() => {
        useSocialStore.getState().addFriend(mockFriend);
      });

      const state = useSocialStore.getState();
      expect(state.friends).toContainEqual(mockFriend);
    });

    it('should increment friendCount', () => {
      act(() => {
        useSocialStore.getState().addFriend(mockFriend);
      });

      const state = useSocialStore.getState();
      expect(state.friendCount).toBe(1);
    });

    it('should add multiple friends', () => {
      act(() => {
        useSocialStore.getState().addFriend(mockFriend);
        useSocialStore.getState().addFriend({ ...mockFriend, id: 'friend-2', name: 'Alice' });
      });

      const state = useSocialStore.getState();
      expect(state.friends).toHaveLength(2);
      expect(state.friendCount).toBe(2);
    });
  });

  describe('removeFriend', () => {
    it('should remove a friend by id', () => {
      act(() => {
        useSocialStore.getState().addFriend(mockFriend);
        useSocialStore.getState().removeFriend('friend-1');
      });

      const state = useSocialStore.getState();
      expect(state.friends).toHaveLength(0);
    });

    it('should decrement friendCount', () => {
      act(() => {
        useSocialStore.getState().addFriend(mockFriend);
        useSocialStore.getState().addFriend({ ...mockFriend, id: 'friend-2' });
        useSocialStore.getState().removeFriend('friend-1');
      });

      const state = useSocialStore.getState();
      expect(state.friendCount).toBe(1);
    });

    it('should not go below zero for friendCount', () => {
      act(() => {
        useSocialStore.getState().removeFriend('non-existent');
      });

      const state = useSocialStore.getState();
      expect(state.friendCount).toBe(0);
    });

    it('should not remove other friends', () => {
      const friend2 = { ...mockFriend, id: 'friend-2', name: 'Alice' };

      act(() => {
        useSocialStore.getState().addFriend(mockFriend);
        useSocialStore.getState().addFriend(friend2);
        useSocialStore.getState().removeFriend('friend-1');
      });

      const state = useSocialStore.getState();
      expect(state.friends).toEqual([friend2]);
    });
  });

  describe('setPendingRequests', () => {
    it('should set pending requests array', () => {
      const requests = [mockFriendRequest];

      act(() => {
        useSocialStore.getState().setPendingRequests(requests);
      });

      const state = useSocialStore.getState();
      expect(state.pendingRequests).toEqual(requests);
    });
  });

  describe('acceptRequest', () => {
    it('should remove request from pendingRequests', () => {
      act(() => {
        useSocialStore.getState().setPendingRequests([mockFriendRequest]);
        useSocialStore.getState().acceptRequest('request-1');
      });

      const state = useSocialStore.getState();
      expect(state.pendingRequests).toHaveLength(0);
    });

    it('should not remove other requests', () => {
      const request2 = { ...mockFriendRequest, id: 'request-2' };

      act(() => {
        useSocialStore.getState().setPendingRequests([mockFriendRequest, request2]);
        useSocialStore.getState().acceptRequest('request-1');
      });

      const state = useSocialStore.getState();
      expect(state.pendingRequests).toEqual([request2]);
    });
  });

  describe('declineRequest', () => {
    it('should remove request from pendingRequests', () => {
      act(() => {
        useSocialStore.getState().setPendingRequests([mockFriendRequest]);
        useSocialStore.getState().declineRequest('request-1');
      });

      const state = useSocialStore.getState();
      expect(state.pendingRequests).toHaveLength(0);
    });
  });

  describe('setActivityFeed', () => {
    it('should set activity feed array', () => {
      const feed = [mockActivity];

      act(() => {
        useSocialStore.getState().setActivityFeed(feed);
      });

      const state = useSocialStore.getState();
      expect(state.activityFeed).toEqual(feed);
    });
  });

  describe('addActivityItem', () => {
    it('should add activity item at the beginning', () => {
      const newActivity = { ...mockActivity, id: 'activity-2' };

      act(() => {
        useSocialStore.getState().setActivityFeed([mockActivity]);
        useSocialStore.getState().addActivityItem(newActivity);
      });

      const state = useSocialStore.getState();
      expect(state.activityFeed[0]).toEqual(newActivity);
      expect(state.activityFeed[1]).toEqual(mockActivity);
    });
  });

  describe('setFriendCount', () => {
    it('should set friend count directly', () => {
      act(() => {
        useSocialStore.getState().setFriendCount(10);
      });

      const state = useSocialStore.getState();
      expect(state.friendCount).toBe(10);
    });
  });

  describe('likeActivity', () => {
    it('should increment likes for an activity', () => {
      act(() => {
        useSocialStore.getState().setActivityFeed([mockActivity]);
        useSocialStore.getState().likeActivity('activity-1');
      });

      const state = useSocialStore.getState();
      expect(state.activityFeed[0].likes).toBe(6);
    });

    it('should not modify other activities', () => {
      const activity2 = { ...mockActivity, id: 'activity-2', likes: 3 };

      act(() => {
        useSocialStore.getState().setActivityFeed([mockActivity, activity2]);
        useSocialStore.getState().likeActivity('activity-1');
      });

      const state = useSocialStore.getState();
      expect(state.activityFeed[1].likes).toBe(3);
    });

    it('should handle liking non-existent activity gracefully', () => {
      act(() => {
        useSocialStore.getState().setActivityFeed([mockActivity]);
        useSocialStore.getState().likeActivity('non-existent');
      });

      const state = useSocialStore.getState();
      expect(state.activityFeed[0].likes).toBe(5);
    });
  });
});
