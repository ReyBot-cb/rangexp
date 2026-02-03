// Must be imported before uuid
import 'react-native-get-random-values';

import { Slot } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { setAuthToken } from '@rangexp/api-client';
import { useUserStore } from '../store';

export default function App() {
  const colorScheme = useColorScheme();
  const authToken = useUserStore((state) => state.authToken);

  // Restore auth token to apiClient when app starts or token changes
  useEffect(() => {
    if (authToken) {
      setAuthToken(authToken);
    }
  }, [authToken]);

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
