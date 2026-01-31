import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Animated, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@rangexp/theme';
import { Rex } from '../../components/Rex';

const rexMessages = [
  "¡Hey! 👋",
  "Soy Rex, tu compañero en este viaje",
  "Estoy aquí para apoyarte",
  "en cada paso del camino",
];

export default function RexIntroScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const [messageIndex, setMessageIndex] = useState(0);

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

    // Rotate messages
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % rexMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const handleContinue = () => {
    router.replace('/(onboarding)/04-first-action');
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
          showSpeechBubble
          message={rexMessages[messageIndex]}
        />
      </Animated.View>

      {/* Content */}
      <Animated.View 
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY }] }
        ]}
      >
        <Text style={styles.title}>Conoce a Rex</Text>
        <Text style={styles.subtitle}>
          Rex es más que un personaje. Es tu compañero que:{'\n\n'}
          🎉 Celebra cada registro{'\n'}
          💡 Te da consejos personalizados{'\n'}
          ❤️ Te apoya cuando lo necesitas
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
    marginBottom: theme.spacing.lg,
  },
  content: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize["2xl"],
    color: theme.colors.text.primary.light,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary.light,
    textAlign: 'center',
    lineHeight: 24,
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
