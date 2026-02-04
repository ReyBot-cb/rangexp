import { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@rangexp/theme';
import { useSafeArea } from '../../components/SafeScreen';
import { Rex } from '../../components/Rex';
import { ProgressDots } from '../../components/onboarding';

const philosophyItems = [
  {
    icon: '✨',
    title: 'Sin días perfectos',
    description: 'Solo consistencia. Un registro es siempre una victoria.',
    color: theme.colors.gamification.xp,
  },
  {
    icon: '🎯',
    title: 'Sin castigos',
    description: 'Los números no definen tu valor. Aprendemos de cada dato.',
    color: theme.colors.primary,
  },
  {
    icon: '💪',
    title: 'A tu ritmo',
    description: 'Tú decides qué funciona mejor para ti. Sin presiones.',
    color: theme.colors.glucose.normal,
  },
];

export default function PhilosophyScreen() {
  const router = useRouter();
  const { insets } = useSafeArea();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const itemAnims = useRef(philosophyItems.map(() => new Animated.Value(0))).current;

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
      // Stagger animation for items
      Animated.stagger(
        150,
        itemAnims.map((anim) =>
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
    router.replace('/(onboarding)/03-rex-intro');
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
        <ProgressDots current={1} total={6} />
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
        <Rex mood="support" size="large" />
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
        <Text style={styles.title}>Nuestra Filosofía</Text>
        <Text style={styles.subtitle}>Creemos en un enfoque diferente</Text>
      </Animated.View>

      {/* Philosophy Items */}
      <View style={styles.itemsContainer}>
        {philosophyItems.map((item, index) => (
          <Animated.View
            key={index}
            style={[
              styles.itemCard,
              {
                opacity: itemAnims[index],
                transform: [
                  {
                    translateX: itemAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemText}>{item.description}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

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
  rexContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.text.primary.light,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary.light,
  },
  itemsContainer: {
    gap: theme.spacing.md,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.soft,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
    color: theme.colors.text.primary.light,
    marginBottom: 2,
  },
  itemText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
    lineHeight: 20,
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
