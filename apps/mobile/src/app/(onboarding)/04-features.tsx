import { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@rangexp/theme';
import { useSafeArea } from '../../components/SafeScreen';
import { Rex } from '../../components/Rex';
import { ProgressDots, OnboardingButton, FeatureCard } from '../../components/onboarding';

export default function FeaturesScreen() {
  const router = useRouter();
  const { insets } = useSafeArea();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const cardAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

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
    ]).start(() => {
      Animated.stagger(
        100,
        cardAnims.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          })
        )
      ).start();
    });
  }, []);

  const handleContinue = () => {
    router.replace('/(onboarding)/05-first-action');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: Math.max(insets.bottom, theme.spacing['2xl']) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Progress */}
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
        <ProgressDots current={3} total={6} />
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
        <Rex mood="celebrate" size="large" showSpeechBubble message="¡Mira todo esto!" />
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
        <Text style={styles.title}>Tu progreso, gamificado</Text>
        <Text style={styles.subtitle}>
          Convierte el manejo de tu diabetes en una experiencia motivadora
        </Text>
      </Animated.View>

      {/* Feature Cards */}
      <View style={styles.featuresContainer}>
        <Animated.View
          style={{
            opacity: cardAnims[0],
            transform: [
              {
                translateY: cardAnims[0].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
          <FeatureCard
            icon="lightning"
            iconColor={theme.colors.gamification.xp}
            title="Gana XP"
            description="Cada registro de glucosa te da puntos de experiencia. ¡Sube de nivel!"
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: cardAnims[1],
            transform: [
              {
                translateY: cardAnims[1].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
          <FeatureCard
            icon="fire"
            iconColor={theme.colors.gamification.streak}
            title="Mantén tu racha"
            description="Registra cada día para mantener tu racha activa y desbloquear recompensas"
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: cardAnims[2],
            transform: [
              {
                translateY: cardAnims[2].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
          <FeatureCard
            icon="trophy"
            iconColor={theme.colors.gamification.achievement}
            title="Desbloquea logros"
            description="Completa retos especiales y colecciona insignias únicas"
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: cardAnims[3],
            transform: [
              {
                translateY: cardAnims[3].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
          <FeatureCard
            icon="heart"
            iconColor={theme.colors.rex.happy}
            title="Rex evoluciona contigo"
            description="Tu compañero refleja tu progreso y te anima en cada paso"
          />
        </Animated.View>
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <OnboardingButton onPress={handleContinue}>
          Continuar
        </OnboardingButton>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light.primary,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
  },
  rexContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.text.primary.light,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary.light,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  featuresContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  footer: {
    marginTop: 'auto',
  },
});
