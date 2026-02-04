// Must be imported before uuid
import 'react-native-get-random-values';

import { Slot } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { setAuthToken, setRefreshToken, configureAuth } from '@rangexp/api-client';
import { useUserStore } from '../store';

export default function App() {
  const colorScheme = useColorScheme();
  const authToken = useUserStore((state) => state.authToken);
  const refreshToken = useUserStore((state) => state.refreshToken);
  const setStoreAuthToken = useUserStore((state) => state.setAuthToken);
  const logout = useUserStore((state) => state.logout);
  const isConfigured = useRef(false);

  // Configure auth callbacks once on mount
  useEffect(() => {
    if (!isConfigured.current) {
      configureAuth({
        getRefreshToken: () => useUserStore.getState().refreshToken,
        onTokenRefreshed: (newToken) => {
          console.log('[App] Token refreshed, updating store...');
          setStoreAuthToken(newToken);
          setAuthToken(newToken);
        },
        onRefreshFailed: () => {
          console.log('[App] Token refresh failed, logging out...');
          setAuthToken(null);
          setRefreshToken(null);
          logout();
        },
      });
      isConfigured.current = true;
    }
  }, [setStoreAuthToken, logout]);

  // Restore auth tokens to apiClient when app starts or tokens change
  useEffect(() => {
    setAuthToken(authToken);
  }, [authToken]);

  useEffect(() => {
    setRefreshToken(refreshToken);
  }, [refreshToken]);

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Slot />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
