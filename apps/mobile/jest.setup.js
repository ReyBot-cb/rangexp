import '@testing-library/jest-native/extend-expect';

// Polyfill setImmediate for jsdom
global.setImmediate = global.setImmediate || ((fn, ...args) => setTimeout(fn, 0, ...args));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  Link: 'Link',
  Stack: {
    Screen: 'Screen',
  },
  Tabs: {
    Screen: 'Screen',
  },
}));

// Mock expo-av (Video component)
jest.mock('expo-av', () => ({
  Video: 'Video',
  ResizeMode: {
    CONTAIN: 'contain',
    COVER: 'cover',
    STRETCH: 'stretch',
  },
  Audio: {
    setAudioModeAsync: jest.fn(),
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: 'SafeAreaView',
}));

// Mock @rangexp/api-client
jest.mock('@rangexp/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock @rangexp/theme
jest.mock('@rangexp/theme', () => ({
  theme: {
    colors: {
      primary: '#7C3AED',
      glucose: {
        low: '#EF4444',
        normal: '#10B981',
        high: '#F59E0B',
      },
      gamification: {
        xp: '#8B5CF6',
        xpLight: '#C4B5FD',
        streak: '#F97316',
        achievement: '#10B981',
        rare: '#3B82F6',
        epic: '#8B5CF6',
        legendary: '#F59E0B',
      },
      rex: {
        support: '#3B82F6',
      },
      text: {
        primary: { light: '#1F2937', dark: '#F9FAFB' },
        secondary: { light: '#6B7280', dark: '#9CA3AF' },
        disabled: { light: '#9CA3AF', dark: '#6B7280' },
      },
      background: {
        light: {
          primary: '#FFFFFF',
          secondary: '#F3F4F6',
          card: '#FFFFFF',
        },
        dark: {
          primary: '#111827',
          secondary: '#1F2937',
          card: '#1F2937',
        },
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      full: 9999,
    },
    typography: {
      fontFamily: {
        heading: 'System',
        body: 'System',
        mono: 'Courier',
      },
      fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
      },
    },
    shadows: {
      soft: {},
      card: {},
      medium: {},
      rex: {},
    },
  },
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
}));

// Silence console warnings during tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Animated') || args[0].includes('useNativeDriver'))
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

// Global test timeout
jest.setTimeout(10000);
