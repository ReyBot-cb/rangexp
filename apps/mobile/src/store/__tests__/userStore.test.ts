import { act } from '@testing-library/react-native';
import { useUserStore } from '../userStore';

describe('userStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useUserStore.getState().logout();
    });
  });

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'John Doe',
    avatar: 'https://example.com/avatar.jpg',
    xp: 150,
    level: 2,
    streak: 5,
    isPremium: false,
    rexCustomization: 'default',
    glucoseUnit: 'MG_DL' as const,
    notificationsEnabled: true,
    createdAt: '2024-01-01T00:00:00Z',
    friendsCount: 3,
  };

  describe('initial state', () => {
    it('should have null user initially', () => {
      const state = useUserStore.getState();
      expect(state.user).toBeNull();
    });

    it('should not be authenticated initially', () => {
      const state = useUserStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should have zero notification count initially', () => {
      const state = useUserStore.getState();
      expect(state.notificationsCount).toBe(0);
    });

    it('should have zero recent achievements initially', () => {
      const state = useUserStore.getState();
      expect(state.recentAchievements).toBe(0);
    });

    it('should have zero friend count initially', () => {
      const state = useUserStore.getState();
      expect(state.friendCount).toBe(0);
    });
  });

  describe('setUser', () => {
    it('should set user and update isAuthenticated to true', () => {
      act(() => {
        useUserStore.getState().setUser(mockUser);
      });

      const state = useUserStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should set friendCount from user data', () => {
      act(() => {
        useUserStore.getState().setUser(mockUser);
      });

      const state = useUserStore.getState();
      expect(state.friendCount).toBe(3);
    });

    it('should set friendCount to 0 if not provided', () => {
      const userWithoutFriends = { ...mockUser, friendsCount: undefined };

      act(() => {
        useUserStore.getState().setUser(userWithoutFriends);
      });

      const state = useUserStore.getState();
      expect(state.friendCount).toBe(0);
    });

    it('should set user to null and isAuthenticated to false when null is passed', () => {
      act(() => {
        useUserStore.getState().setUser(mockUser);
        useUserStore.getState().setUser(null);
      });

      const state = useUserStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('updateUser', () => {
    it('should update user fields', () => {
      act(() => {
        useUserStore.getState().setUser(mockUser);
        useUserStore.getState().updateUser({ name: 'Jane Doe' });
      });

      const state = useUserStore.getState();
      expect(state.user?.name).toBe('Jane Doe');
      expect(state.user?.email).toBe(mockUser.email);
    });

    it('should not update if user is null', () => {
      act(() => {
        useUserStore.getState().updateUser({ name: 'Jane Doe' });
      });

      const state = useUserStore.getState();
      expect(state.user).toBeNull();
    });

    it('should update multiple fields at once', () => {
      act(() => {
        useUserStore.getState().setUser(mockUser);
        useUserStore.getState().updateUser({
          name: 'Jane Doe',
          isPremium: true,
          glucoseUnit: 'MMOL_L',
        });
      });

      const state = useUserStore.getState();
      expect(state.user?.name).toBe('Jane Doe');
      expect(state.user?.isPremium).toBe(true);
      expect(state.user?.glucoseUnit).toBe('MMOL_L');
    });
  });

  describe('addXp', () => {
    it('should add XP to user', () => {
      act(() => {
        useUserStore.getState().setUser({ ...mockUser, xp: 0, level: 1 });
        useUserStore.getState().addXp(50);
      });

      const state = useUserStore.getState();
      expect(state.user?.xp).toBe(50);
    });

    it('should calculate level correctly when adding XP', () => {
      act(() => {
        useUserStore.getState().setUser({ ...mockUser, xp: 0, level: 1 });
        useUserStore.getState().addXp(150);
      });

      const state = useUserStore.getState();
      expect(state.user?.xp).toBe(150);
      expect(state.user?.level).toBe(2); // 150 XP / 100 = 1.5 -> floor + 1 = 2
    });

    it('should level up to level 3 at 200 XP', () => {
      act(() => {
        useUserStore.getState().setUser({ ...mockUser, xp: 0, level: 1 });
        useUserStore.getState().addXp(250);
      });

      const state = useUserStore.getState();
      expect(state.user?.level).toBe(3); // 250 / 100 = 2.5 -> floor + 1 = 3
    });

    it('should not modify state if user is null', () => {
      const initialState = useUserStore.getState();

      act(() => {
        useUserStore.getState().addXp(100);
      });

      const state = useUserStore.getState();
      expect(state.user).toBeNull();
      expect(state).toEqual(initialState);
    });

    it('should accumulate XP over multiple calls', () => {
      act(() => {
        useUserStore.getState().setUser({ ...mockUser, xp: 0, level: 1 });
        useUserStore.getState().addXp(50);
        useUserStore.getState().addXp(30);
        useUserStore.getState().addXp(20);
      });

      const state = useUserStore.getState();
      expect(state.user?.xp).toBe(100);
      expect(state.user?.level).toBe(2);
    });
  });

  describe('updateStreak', () => {
    it('should update user streak', () => {
      act(() => {
        useUserStore.getState().setUser(mockUser);
        useUserStore.getState().updateStreak(10);
      });

      const state = useUserStore.getState();
      expect(state.user?.streak).toBe(10);
    });

    it('should not modify state if user is null', () => {
      act(() => {
        useUserStore.getState().updateStreak(10);
      });

      const state = useUserStore.getState();
      expect(state.user).toBeNull();
    });
  });

  describe('setNotificationsCount', () => {
    it('should set notifications count', () => {
      act(() => {
        useUserStore.getState().setNotificationsCount(5);
      });

      const state = useUserStore.getState();
      expect(state.notificationsCount).toBe(5);
    });
  });

  describe('setRecentAchievements', () => {
    it('should set recent achievements count', () => {
      act(() => {
        useUserStore.getState().setRecentAchievements(3);
      });

      const state = useUserStore.getState();
      expect(state.recentAchievements).toBe(3);
    });
  });

  describe('setFriendCount', () => {
    it('should set friend count', () => {
      act(() => {
        useUserStore.getState().setFriendCount(10);
      });

      const state = useUserStore.getState();
      expect(state.friendCount).toBe(10);
    });
  });

  describe('setPremium', () => {
    it('should set premium status to true', () => {
      act(() => {
        useUserStore.getState().setUser(mockUser);
        useUserStore.getState().setPremium(true);
      });

      const state = useUserStore.getState();
      expect(state.user?.isPremium).toBe(true);
    });

    it('should set premium status to false', () => {
      act(() => {
        useUserStore.getState().setUser({ ...mockUser, isPremium: true });
        useUserStore.getState().setPremium(false);
      });

      const state = useUserStore.getState();
      expect(state.user?.isPremium).toBe(false);
    });

    it('should not modify state if user is null', () => {
      act(() => {
        useUserStore.getState().setPremium(true);
      });

      const state = useUserStore.getState();
      expect(state.user).toBeNull();
    });
  });

  describe('logout', () => {
    it('should reset all state on logout', () => {
      act(() => {
        useUserStore.getState().setUser(mockUser);
        useUserStore.getState().setNotificationsCount(5);
        useUserStore.getState().setRecentAchievements(3);
        useUserStore.getState().setFriendCount(10);
        useUserStore.getState().logout();
      });

      const state = useUserStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.notificationsCount).toBe(0);
      expect(state.recentAchievements).toBe(0);
      expect(state.friendCount).toBe(0);
    });
  });
});
