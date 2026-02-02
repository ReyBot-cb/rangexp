import { act } from '@testing-library/react-native';
import { useGlucoseStore, GlucoseReading } from '../glucoseStore';

describe('glucoseStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useGlucoseStore.setState({
        readings: [],
        pendingSync: [],
        stats: null,
      });
    });
  });

  const mockReading: Omit<GlucoseReading, 'id' | 'synced' | 'status'> = {
    value: 120,
    unit: 'MG_DL',
    context: 'after_meal',
    notes: 'After lunch',
    timestamp: '2024-01-15T12:00:00Z',
  };

  describe('initial state', () => {
    it('should have empty readings array initially', () => {
      const state = useGlucoseStore.getState();
      expect(state.readings).toEqual([]);
    });

    it('should have empty pendingSync array initially', () => {
      const state = useGlucoseStore.getState();
      expect(state.pendingSync).toEqual([]);
    });

    it('should have null stats initially', () => {
      const state = useGlucoseStore.getState();
      expect(state.stats).toBeNull();
    });
  });

  describe('addReading', () => {
    it('should add a new reading with generated id', () => {
      act(() => {
        useGlucoseStore.getState().addReading(mockReading);
      });

      const state = useGlucoseStore.getState();
      expect(state.readings).toHaveLength(1);
      expect(state.readings[0].id).toBeDefined();
      expect(state.readings[0].value).toBe(120);
    });

    it('should set synced to false for new readings', () => {
      act(() => {
        useGlucoseStore.getState().addReading(mockReading);
      });

      const state = useGlucoseStore.getState();
      expect(state.readings[0].synced).toBe(false);
    });

    it('should add reading to pendingSync', () => {
      act(() => {
        useGlucoseStore.getState().addReading(mockReading);
      });

      const state = useGlucoseStore.getState();
      expect(state.pendingSync).toHaveLength(1);
    });

    it('should calculate normal status for value 120 mg/dL', () => {
      act(() => {
        useGlucoseStore.getState().addReading({ ...mockReading, value: 120 });
      });

      const state = useGlucoseStore.getState();
      expect(state.readings[0].status).toBe('normal');
    });

    it('should calculate low status for value below 70 mg/dL', () => {
      act(() => {
        useGlucoseStore.getState().addReading({ ...mockReading, value: 65 });
      });

      const state = useGlucoseStore.getState();
      expect(state.readings[0].status).toBe('low');
    });

    it('should calculate high status for value above 180 mg/dL', () => {
      act(() => {
        useGlucoseStore.getState().addReading({ ...mockReading, value: 200 });
      });

      const state = useGlucoseStore.getState();
      expect(state.readings[0].status).toBe('high');
    });

    it('should add new readings at the beginning of the array', () => {
      act(() => {
        useGlucoseStore.getState().addReading({ ...mockReading, value: 100 });
        useGlucoseStore.getState().addReading({ ...mockReading, value: 150 });
      });

      const state = useGlucoseStore.getState();
      expect(state.readings[0].value).toBe(150);
      expect(state.readings[1].value).toBe(100);
    });

    it('should update stats after adding reading', () => {
      act(() => {
        useGlucoseStore.getState().addReading(mockReading);
      });

      const state = useGlucoseStore.getState();
      expect(state.stats).not.toBeNull();
      expect(state.stats?.readingsCount).toBe(1);
    });
  });

  describe('updateReading', () => {
    it('should update an existing reading', () => {
      let readingId: string;

      act(() => {
        useGlucoseStore.getState().addReading(mockReading);
        readingId = useGlucoseStore.getState().readings[0].id;
        useGlucoseStore.getState().updateReading(readingId, { value: 130 });
      });

      const state = useGlucoseStore.getState();
      expect(state.readings[0].value).toBe(130);
    });

    it('should recalculate status when value changes', () => {
      let readingId: string;

      act(() => {
        useGlucoseStore.getState().addReading({ ...mockReading, value: 120 });
        readingId = useGlucoseStore.getState().readings[0].id;
        useGlucoseStore.getState().updateReading(readingId, { value: 200 });
      });

      const state = useGlucoseStore.getState();
      expect(state.readings[0].status).toBe('high');
    });

    it('should not modify other readings', () => {
      act(() => {
        useGlucoseStore.getState().addReading({ ...mockReading, value: 100 });
        useGlucoseStore.getState().addReading({ ...mockReading, value: 120 });
        const firstReadingId = useGlucoseStore.getState().readings[1].id;
        useGlucoseStore.getState().updateReading(firstReadingId, { value: 150 });
      });

      const state = useGlucoseStore.getState();
      expect(state.readings[0].value).toBe(120);
      expect(state.readings[1].value).toBe(150);
    });
  });

  describe('deleteReading', () => {
    it('should remove a reading by id', () => {
      let readingId: string;

      act(() => {
        useGlucoseStore.getState().addReading(mockReading);
        readingId = useGlucoseStore.getState().readings[0].id;
        useGlucoseStore.getState().deleteReading(readingId);
      });

      const state = useGlucoseStore.getState();
      expect(state.readings).toHaveLength(0);
    });

    it('should update stats after deletion', () => {
      let readingId: string;

      act(() => {
        useGlucoseStore.getState().addReading(mockReading);
        useGlucoseStore.getState().addReading({ ...mockReading, value: 100 });
        readingId = useGlucoseStore.getState().readings[0].id;
        useGlucoseStore.getState().deleteReading(readingId);
      });

      const state = useGlucoseStore.getState();
      expect(state.stats?.readingsCount).toBe(1);
    });
  });

  describe('setReadings', () => {
    it('should replace all readings', () => {
      const readings: GlucoseReading[] = [
        {
          id: 'reading-1',
          value: 100,
          unit: 'MG_DL',
          status: 'normal',
          context: 'fasting',
          timestamp: '2024-01-15T08:00:00Z',
          synced: true,
        },
        {
          id: 'reading-2',
          value: 150,
          unit: 'MG_DL',
          status: 'normal',
          context: 'after_meal',
          timestamp: '2024-01-15T12:00:00Z',
          synced: true,
        },
      ];

      act(() => {
        useGlucoseStore.getState().setReadings(readings);
      });

      const state = useGlucoseStore.getState();
      expect(state.readings).toHaveLength(2);
      expect(state.readings).toEqual(readings);
    });

    it('should update stats after setting readings', () => {
      const readings: GlucoseReading[] = [
        {
          id: 'reading-1',
          value: 100,
          unit: 'MG_DL',
          status: 'normal',
          context: 'fasting',
          timestamp: '2024-01-15T08:00:00Z',
          synced: true,
        },
      ];

      act(() => {
        useGlucoseStore.getState().setReadings(readings);
      });

      const state = useGlucoseStore.getState();
      expect(state.stats?.readingsCount).toBe(1);
    });
  });

  describe('syncPendingReadings', () => {
    it('should mark pending readings as synced', () => {
      act(() => {
        useGlucoseStore.getState().addReading(mockReading);
        useGlucoseStore.getState().syncPendingReadings();
      });

      const state = useGlucoseStore.getState();
      expect(state.readings[0].synced).toBe(true);
      expect(state.pendingSync).toHaveLength(0);
    });
  });

  describe('calculateStats', () => {
    it('should calculate average correctly', () => {
      act(() => {
        useGlucoseStore.getState().addReading({ ...mockReading, value: 100 });
        useGlucoseStore.getState().addReading({ ...mockReading, value: 120 });
        useGlucoseStore.getState().addReading({ ...mockReading, value: 140 });
      });

      const state = useGlucoseStore.getState();
      expect(state.stats?.average).toBe(120);
    });

    it('should count readings by status', () => {
      act(() => {
        useGlucoseStore.getState().addReading({ ...mockReading, value: 60 }); // low
        useGlucoseStore.getState().addReading({ ...mockReading, value: 100 }); // normal
        useGlucoseStore.getState().addReading({ ...mockReading, value: 120 }); // normal
        useGlucoseStore.getState().addReading({ ...mockReading, value: 200 }); // high
      });

      const state = useGlucoseStore.getState();
      expect(state.stats?.lowCount).toBe(1);
      expect(state.stats?.normalCount).toBe(2);
      expect(state.stats?.highCount).toBe(1);
    });

    it('should calculate time in range percentage', () => {
      act(() => {
        useGlucoseStore.getState().addReading({ ...mockReading, value: 100 }); // normal
        useGlucoseStore.getState().addReading({ ...mockReading, value: 120 }); // normal
        useGlucoseStore.getState().addReading({ ...mockReading, value: 200 }); // high
        useGlucoseStore.getState().addReading({ ...mockReading, value: 60 }); // low
      });

      const state = useGlucoseStore.getState();
      expect(state.stats?.timeInRange).toBe(50); // 2 out of 4 = 50%
    });

    it('should return zero stats for empty readings', () => {
      act(() => {
        useGlucoseStore.getState().calculateStats();
      });

      const state = useGlucoseStore.getState();
      expect(state.stats?.average).toBe(0);
      expect(state.stats?.readingsCount).toBe(0);
      expect(state.stats?.timeInRange).toBe(0);
    });
  });

  describe('getTodayReadings', () => {
    it('should return only today readings', () => {
      const today = new Date().toISOString();
      const yesterday = new Date(Date.now() - 86400000).toISOString();

      act(() => {
        useGlucoseStore.getState().addReading({ ...mockReading, timestamp: today });
        useGlucoseStore.getState().addReading({ ...mockReading, timestamp: yesterday });
      });

      const todayReadings = useGlucoseStore.getState().getTodayReadings();
      expect(todayReadings).toHaveLength(1);
    });
  });

  describe('getRecentReadings', () => {
    it('should return specified number of recent readings', () => {
      act(() => {
        for (let i = 0; i < 10; i++) {
          useGlucoseStore.getState().addReading({ ...mockReading, value: 100 + i });
        }
      });

      const recentReadings = useGlucoseStore.getState().getRecentReadings(5);
      expect(recentReadings).toHaveLength(5);
    });

    it('should return all readings if less than limit', () => {
      act(() => {
        useGlucoseStore.getState().addReading(mockReading);
        useGlucoseStore.getState().addReading(mockReading);
      });

      const recentReadings = useGlucoseStore.getState().getRecentReadings(10);
      expect(recentReadings).toHaveLength(2);
    });

    it('should default to 5 readings', () => {
      act(() => {
        for (let i = 0; i < 10; i++) {
          useGlucoseStore.getState().addReading({ ...mockReading, value: 100 + i });
        }
      });

      const recentReadings = useGlucoseStore.getState().getRecentReadings();
      expect(recentReadings).toHaveLength(5);
    });
  });
});
