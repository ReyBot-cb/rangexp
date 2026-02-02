import { renderHook, waitFor, act } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { apiClient } from '@rangexp/api-client';
import { useGlucoseReadings, useAddGlucose, useDeleteGlucose } from '../useGlucose';
import { useGlucoseStore } from '../../store/glucoseStore';

// Mock the api client
jest.mock('@rangexp/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock the glucose store
jest.mock('../../store/glucoseStore', () => ({
  useGlucoseStore: jest.fn(),
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockUseGlucoseStore = useGlucoseStore as jest.MockedFunction<typeof useGlucoseStore>;

describe('useGlucose hooks', () => {
  let queryClient: QueryClient;

  const mockReadings = [
    {
      id: 'reading-1',
      value: 120,
      unit: 'MG_DL',
      status: 'normal',
      context: 'after_meal',
      timestamp: '2024-01-15T12:00:00Z',
      synced: true,
    },
    {
      id: 'reading-2',
      value: 100,
      unit: 'MG_DL',
      status: 'normal',
      context: 'fasting',
      timestamp: '2024-01-15T08:00:00Z',
      synced: true,
    },
  ];

  const mockStoreActions = {
    setReadings: jest.fn(),
    addReading: jest.fn(),
    deleteReading: jest.fn(),
    pendingSync: [] as any[],
    syncPendingReadings: jest.fn(),
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
    mockUseGlucoseStore.mockReturnValue(mockStoreActions as any);
  });

  describe('useGlucoseReadings', () => {
    it('should fetch readings and update store', async () => {
      mockApiClient.get.mockResolvedValue({ data: { readings: mockReadings } });

      const { result } = renderHook(() => useGlucoseReadings(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.get).toHaveBeenCalledWith('/glucose');
      expect(mockStoreActions.setReadings).toHaveBeenCalledWith(mockReadings);
    });

    it('should pass date filters to API', async () => {
      mockApiClient.get.mockResolvedValue({ data: { readings: [] } });

      const { result } = renderHook(
        () => useGlucoseReadings({ startDate: '2024-01-01', endDate: '2024-01-31' }),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/glucose?startDate=2024-01-01&endDate=2024-01-31'
      );
    });

    it('should handle API error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useGlucoseReadings(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useAddGlucose', () => {
    it('should add reading to store and sync with API', async () => {
      const newReading = {
        value: 130,
        context: 'after_meal' as const,
        notes: 'After dinner',
      };

      const pendingReading = {
        ...newReading,
        id: 'pending-1',
        unit: 'MG_DL',
        status: 'normal',
        timestamp: expect.any(String),
        synced: false,
      };

      mockStoreActions.pendingSync = [pendingReading];
      mockApiClient.post.mockResolvedValue({ data: pendingReading });

      const { result } = renderHook(() => useAddGlucose(), { wrapper });

      act(() => {
        result.current.mutate(newReading);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockStoreActions.addReading).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 130,
          context: 'after_meal',
          notes: 'After dinner',
          unit: 'MG_DL',
        })
      );
    });

    it('should use provided timestamp or default to current time', async () => {
      const customTimestamp = '2024-01-15T14:00:00Z';
      const newReading = {
        value: 110,
        context: 'before_meal' as const,
        timestamp: customTimestamp,
      };

      mockApiClient.post.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useAddGlucose(), { wrapper });

      act(() => {
        result.current.mutate(newReading);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockStoreActions.addReading).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: customTimestamp,
        })
      );
    });
  });

  describe('useDeleteGlucose', () => {
    it('should delete reading from store and API', async () => {
      mockApiClient.delete.mockResolvedValue({});

      const { result } = renderHook(() => useDeleteGlucose(), { wrapper });

      act(() => {
        result.current.mutate('reading-1');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockStoreActions.deleteReading).toHaveBeenCalledWith('reading-1');
      expect(mockApiClient.delete).toHaveBeenCalledWith('/glucose/reading-1');
    });

    it('should handle deletion error', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Not found'));

      const { result } = renderHook(() => useDeleteGlucose(), { wrapper });

      act(() => {
        result.current.mutate('non-existent');
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });
});
