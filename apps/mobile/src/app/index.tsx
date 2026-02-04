import { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore, useAppStore } from '../store';
import { setAuthToken } from '@rangexp/api-client';
import { theme } from '@rangexp/theme';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, user, authToken, initializeAnonymousUser } = useUserStore();
  const { hasCompletedOnboarding } = useAppStore();
  const [splashAnim] = useState(new Animated.Value(0));

  // Sync persisted auth token with apiClient on app start
  useEffect(() => {
    if (authToken) {
      setAuthToken(authToken);
    }
  }, [authToken]);

  useEffect(() => {
    // Splash animation
    Animated.sequence([
      Animated.timing(splashAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(splashAnim, {
        toValue: 2,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigation flow:
      // 1. If onboarding not completed → onboarding
      // 2. If onboarding completed + authenticated → app
      // 3. If onboarding completed + not authenticated → initialize anonymous → app
      if (!hasCompletedOnboarding) {
        router.replace('/(onboarding)/01-welcome');
      } else if (isAuthenticated) {
        router.replace('/(app)');
      } else {
        // Initialize anonymous user if needed
        if (!user) {
          initializeAnonymousUser();
        }
        router.replace('/(app)');
      }
    });
  }, []);

  const opacity = splashAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 1, 0],
  });

  const scale = splashAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0.8, 1, 1.5],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        {/* Rex Logo */}
        <View style={styles.rexLogo}>
          <View style={styles.rexCircle}>
            <View style={styles.rexFace}>
              <View style={styles.rexEyes}>
                <View style={styles.rexEye} />
                <View style={styles.rexEye} />
              </View>
              <View style={styles.rexMouth} />
              <View style={styles.rexCheeks}>
                <View style={styles.rexCheek} />
                <View style={styles.rexCheek} />
              </View>
            </View>
          </View>
        </View>
        
        <Animated.Text style={styles.title}>RangeXp</Animated.Text>
        <Animated.Text style={styles.subtitle}>
          Tu compañero en el manejo de la diabetes
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  rexLogo: {
    marginBottom: 24,
  },
  rexCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.rex.body,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.rex,
  },
  rexFace: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rexEyes: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 35,
  },
  rexEye: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.text.primary.light,
  },
  rexMouth: {
    width: 30,
    height: 15,
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.text.primary.light,
    borderRadius: 15,
    marginTop: 5,
  },
  rexCheeks: {
    flexDirection: 'row',
    gap: 40,
    position: 'absolute',
    bottom: 25,
  },
  rexCheek: {
    width: 12,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(236, 72, 153, 0.4)',
  },
  title: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: 36,
    color: theme.colors.primary,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary.light,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
