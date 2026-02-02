import { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@rangexp/theme';
import { useSafeArea } from '../../components/SafeScreen';
import { Rex } from '../../components/Rex';

const { width } = Dimensions.get('window');

// Progress indicator component
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.dotsContainer}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === current && styles.dotActive,
            index < current && styles.dotCompleted,
          ]}
        />
      ))}
    </View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const { insets } = useSafeArea();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const rexScale = useRef(new Animated.Value(0.8)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(rexScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    router.replace('/(onboarding)/02-philosophy');
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
        <ProgressDots current={0} total={4} />
      </View>

      {/* Rex */}
      <Animated.View
        style={[
          styles.rexContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: rexScale }],
          },
        ]}
      >
        <Rex mood="happy" size="xl" animationState="greeting" />
      </Animated.View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.greeting}>¡Hola! Soy Rex</Text>
        <Text style={styles.title}>Tu compañero en el{'\n'}manejo de la diabetes</Text>
        <Text style={styles.subtitle}>
          RangeXp te ayuda a construir hábitos saludables sin presión ni estrés.
        </Text>
      </Animated.View>

      {/* Features */}
      <Animated.View
        style={[
          styles.featuresCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>🎯</Text>
          <Text style={styles.featureText}>Registra tu glucosa fácilmente</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>🏆</Text>
          <Text style={styles.featureText}>Gana XP y desbloquea logros</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>❤️</Text>
          <Text style={styles.featureText}>Sin juicios, solo apoyo</Text>
        </View>
      </Animated.View>

      {/* Continue Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, theme.spacing['2xl']) }]}>
        <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>Comenzar</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light.primary,
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.background.light.secondary,
  },
  dotActive: {
    width: 24,
    backgroundColor: theme.colors.primary,
  },
  dotCompleted: {
    backgroundColor: theme.colors.primaryLight,
  },
  rexContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  content: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  greeting: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.text.primary.light,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary.light,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: theme.spacing.md,
  },
  featuresCard: {
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    ...theme.shadows.card,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: theme.spacing.md,
  },
  featureText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary.light,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 18,
    paddingHorizontal: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  buttonText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonArrow: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.lg,
    color: '#FFFFFF',
    marginLeft: theme.spacing.sm,
  },
});
