import { View, StyleSheet } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@rangexp/theme';
import { useUserStore } from '../../store';
import { useEffect } from 'react';
import { Icon, IconPresets } from '../../components/Icon';

type TabIconProps = {
  focused: boolean;
  iconPreset: (focused: boolean) => {
    name: any;
    weight: any;
    color: string;
  };
};

function TabIcon({ focused, iconPreset }: TabIconProps) {
  const preset = iconPreset(focused);
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <Icon name={preset.name} size={24} color={preset.color} weight={preset.weight} />
    </View>
  );
}

export default function AppLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useUserStore();
  const insets = useSafeAreaInsets();

  // Tab bar height calculation: base height + safe area bottom
  const TAB_BAR_BASE_HEIGHT = 60;
  const tabBarHeight = TAB_BAR_BASE_HEIGHT + insets.bottom;

  useEffect(() => {
    if (!isAuthenticated && !pathname.includes('(auth)')) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, pathname]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background.light.card,
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
          height: tabBarHeight,
          paddingBottom: insets.bottom,
          paddingTop: 12,
          paddingHorizontal: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary.light,
        tabBarLabelStyle: {
          fontFamily: theme.typography.fontFamily.body,
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} iconPreset={IconPresets.tabHome} />
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Registrar',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} iconPreset={IconPresets.tabLog} />
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Logros',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} iconPreset={IconPresets.tabTrophy} />
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Social',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} iconPreset={IconPresets.tabSocial} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} iconPreset={IconPresets.tabProfile} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 32,
    borderRadius: 10,
  },
  tabIconFocused: {
    backgroundColor: theme.colors.primary + '15',
  },
});
