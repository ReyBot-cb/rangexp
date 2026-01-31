import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { theme } from '@rangexp/theme';
import { useUserStore } from '../../store';
import { useEffect } from 'react';

export default function AppLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useUserStore();

  useEffect(() => {
    if (!isAuthenticated && !pathname.includes('(auth)')) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, pathname]);

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background.light.primary,
        },
        headerTitleStyle: {
          fontFamily: theme.typography.fontFamily.heading,
          fontSize: theme.typography.fontSize.xl,
          color: theme.colors.text.primary.light,
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background.light.card,
          borderTopWidth: 0,
          elevation: 8,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary.light,
        tabBarLabelStyle: {
          fontFamily: theme.typography.fontFamily.body,
          fontSize: theme.typography.fontSize.xs,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused }) => (
          <View style={[
            styles.tabIcon, 
            focused && { backgroundColor: 'rgba(124, 58, 237, 0.1)' }
          ]}>
            <Text style={styles.tabIconText}>
              {focused ? '🏠' : '🏠'}
            </Text>
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Registro',
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Logros',
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Amigos',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  tabIconText: {
    fontSize: 22,
  },
});
