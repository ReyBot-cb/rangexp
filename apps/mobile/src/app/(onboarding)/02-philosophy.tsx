import { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@rangexp/theme';
import { Rex } from '../../components/Rex';

export default function PhilosophyScreen() {
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
    router.replace('/(onboarding)/03-rex-intro');
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
          mood="support" 
          size="large"
        />
      </Animated.View>

      {/* Content */}
      <Animated.View 
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY }] }
        ]}
      >
        <Text style={styles.title}>Nuestra Filosofía</Text>
        
        <View style={styles.philosophyItem}>
          <Text style={styles.icon}>✨</Text>
          <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>Sin días perfectos</Text>
            <Text style={styles.itemText}>Solo consistencia. Un registro es siempre una victoria.</Text>
          </View>
        </View>

        <View style={styles.philosophyItem}>
          <Text style={styles.icon}>🎯</Text>
          <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>Sin castigos</Text>
            <Text style={styles.itemText}>Los números no definen tu valor. Aprendemos de cada dato.</Text>
          </View>
        </View>

        <View style={styles.philosophyItem}>
          <Text style={styles.icon}>💪</Text>
          <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>A tu ritmo</Text>
            <Text style={styles.itemText}>Tú decides qué funciona mejor para ti.</Text>
          </View>
        </View>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize["2xl"],
    color: theme.colors.text.primary.light,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  philosophyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  icon: {
    fontSize: 28,
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text.primary.light,
    marginBottom: 4,
  },
  itemText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
    lineHeight: 20,
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
