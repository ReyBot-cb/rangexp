import { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@rangexp/theme';
import { Rex } from '../../components/Rex';

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    router.replace('/(onboarding)/02-philosophy');
  };

  return (
    <View style={styles.container}>
      {/* Rex */}
      <Animated.View 
        style={[
          styles.rexContainer,
          { opacity: fadeAnim, transform: [{ translateY }] }
        ]}
      >
        <Rex 
          mood="happy" 
          size="xl" 
          animationState="greeting"
        />
      </Animated.View>

      {/* Content */}
      <Animated.View 
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY }] }
        ]}
      >
        <Text style={styles.title}>¡Hola! Soy Rex 👋</Text>
        <Text style={styles.subtitle}>
          RangeXp te ayuda a construir hábitos saludables{'\n'}sin presión ni estrés.
        </Text>
        <Text style={styles.description}>
          Estoy aquí para acompañarte en cada paso,{'\n'}celebrando tus logros y apoyándote cuando lo necesites.
        </Text>
      </Animated.View>

      {/* Continue Button */}
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continuar →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  rexContainer: {
    marginBottom: theme.spacing.xl,
  },
  content: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize["3xl"],
    color: theme.colors.text.primary.light,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary.light,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary.light,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    position: 'absolute',
    bottom: theme.spacing["2xl"],
  },
  buttonText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
