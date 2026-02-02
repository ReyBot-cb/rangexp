import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Animated, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@rangexp/theme';
import { useSafeArea } from '../../components/SafeScreen';
import { Rex, RexMood } from '../../components/Rex';

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

const rexStates: { mood: RexMood; message: string; description: string }[] = [
  {
    mood: 'happy',
    message: '¡Hola! Soy Rex',
    description: 'Tu compañero en este viaje',
  },
  {
    mood: 'celebrate',
    message: '¡Lo lograste!',
    description: 'Celebro cada uno de tus logros',
  },
  {
    mood: 'support',
    message: 'Aquí estoy',
    description: 'Te apoyo en los días difíciles',
  },
];

export default function RexIntroScreen() {
  const router = useRouter();
  const { insets } = useSafeArea();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const [currentState, setCurrentState] = useState(0);
  const messageAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Rotate through Rex states
    const interval = setInterval(() => {
      Animated.timing(messageAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentState((prev) => (prev + 1) % rexStates.length);
        Animated.timing(messageAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleContinue = () => {
    router.replace('/(onboarding)/04-first-action');
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  const currentRex = rexStates[currentState];

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
        <ProgressDots current={2} total={4} />
      </View>

      {/* Rex */}
      <Animated.View
        style={[
          styles.rexContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Rex
          mood={currentRex.mood}
          size="xl"
          showSpeechBubble
          message={currentRex.message}
        />
      </Animated.View>

      {/* Title */}
      <Animated.View
        style={[
          styles.titleContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>Conoce a Rex</Text>
        <Animated.Text
          style={[
            styles.subtitle,
            {
              opacity: messageAnim,
              transform: [
                {
                  translateY: messageAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {currentRex.description}
        </Animated.Text>
      </Animated.View>

      {/* State indicators */}
      <View style={styles.statesContainer}>
        {rexStates.map((state, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.stateCard,
              currentState === index && styles.stateCardActive,
            ]}
            onPress={() => setCurrentState(index)}
            activeOpacity={0.8}
          >
            <Rex mood={state.mood} size="small" />
            <Text
              style={[
                styles.stateLabel,
                currentState === index && styles.stateLabelActive,
              ]}
            >
              {state.mood === 'happy' ? 'Feliz' : state.mood === 'celebrate' ? 'Celebra' : 'Apoya'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
        <Text style={styles.featuresTitle}>Rex siempre está contigo</Text>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>🎉</Text>
          <Text style={styles.featureText}>Celebra cada registro que hagas</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>💡</Text>
          <Text style={styles.featureText}>Te da consejos personalizados</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>❤️</Text>
          <Text style={styles.featureText}>Te apoya sin juzgarte nunca</Text>
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
            <Text style={styles.buttonText}>Continuar</Text>
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
    marginTop: theme.spacing.lg,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  title: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.text.primary.light,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.primary,
    fontWeight: '500',
    height: 28,
  },
  statesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  stateCard: {
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.light.secondary,
    minWidth: 80,
  },
  stateCardActive: {
    backgroundColor: theme.colors.primary + '15',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  stateLabel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary.light,
    marginTop: theme.spacing.xs,
  },
  stateLabelActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  featuresCard: {
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    ...theme.shadows.card,
  },
  featuresTitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text.secondary.light,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureIcon: {
    fontSize: 18,
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
