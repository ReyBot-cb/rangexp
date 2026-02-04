import { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@rangexp/theme';
import { useSafeArea } from '../../components/SafeScreen';
import { Rex } from '../../components/Rex';
import { Icon } from '../../components/Icon';
import { ProgressDots, OnboardingButton } from '../../components/onboarding';
import { useAppStore, useUserStore } from '../../store';

export default function AuthPromptScreen() {
  const router = useRouter();
  const { insets } = useSafeArea();
  const { completeOnboarding } = useAppStore();
  const { initializeAnonymousUser } = useUserStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const cardAnims = useRef([
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

  const handleRegister = () => {
    completeOnboarding();
    router.replace('/(auth)/register');
  };

  const handleLogin = () => {
    completeOnboarding();
    router.replace('/(auth)/login');
  };

  const handleSkip = () => {
    completeOnboarding();
    initializeAnonymousUser();
    router.replace('/(app)');
  };

  const benefits = [
    {
      icon: 'cloud' as const,
      title: 'Sincroniza tus datos',
      description: 'Accede desde cualquier dispositivo',
    },
    {
      icon: 'users' as const,
      title: 'Conecta con amigos',
      description: 'Comparte logros y motívense mutuamente',
    },
    {
      icon: 'trophy' as const,
      title: 'Compite en rankings',
      description: 'Sube en las tablas de clasificación',
    },
  ];

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
        <ProgressDots current={5} total={6} />
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
        <Rex mood="celebrate" size="large" showSpeechBubble message="¡Todo listo!" />
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
        <Text style={styles.title}>Una última cosa...</Text>
        <Text style={styles.subtitle}>
          Crea una cuenta para desbloquear todas las funciones
        </Text>
      </Animated.View>

      {/* Benefits */}
      <View style={styles.benefitsContainer}>
        {benefits.map((benefit, index) => (
          <Animated.View
            key={benefit.title}
            style={[
              styles.benefitCard,
              {
                opacity: cardAnims[index],
                transform: [
                  {
                    translateY: cardAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.benefitIcon}>
              <Icon name={benefit.icon} size={20} color={theme.colors.primary} weight="duotone" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>{benefit.title}</Text>
              <Text style={styles.benefitDescription}>{benefit.description}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

      {/* CTAs */}
      <View style={styles.ctaContainer}>
        <OnboardingButton onPress={handleRegister} variant="primary">
          Registrarse
        </OnboardingButton>

        <OnboardingButton onPress={handleLogin} variant="secondary">
          Iniciar sesion
        </OnboardingButton>

        <OnboardingButton onPress={handleSkip} variant="text">
          Continuar sin cuenta
        </OnboardingButton>
      </View>

      {/* Note */}
      <View style={styles.noteContainer}>
        <Icon name="info" size={14} color={theme.colors.text.disabled.light} />
        <Text style={styles.noteText}>
          Puedes crear una cuenta en cualquier momento desde tu perfil
        </Text>
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
  benefitsContainer: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.soft,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
    color: theme.colors.text.primary.light,
    marginBottom: 2,
  },
  benefitDescription: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
  },
  ctaContainer: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  noteText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled.light,
    textAlign: 'center',
  },
});
