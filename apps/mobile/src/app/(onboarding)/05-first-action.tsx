import { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Animated, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@rangexp/theme';
import { useSafeArea } from '../../components/SafeScreen';
import { Rex } from '../../components/Rex';
import { useUserStore } from '../../store';
import { ProgressDots } from '../../components/onboarding';

export default function FirstActionScreen() {
  const router = useRouter();
  const { insets } = useSafeArea();
  const { updateUser } = useUserStore();
  const [selectedUnit, setSelectedUnit] = useState<'MG_DL' | 'MMOL_L'>('MG_DL');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const cardAnims = useRef([new Animated.Value(0), new Animated.Value(0)]).current;

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
        150,
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
    updateUser({
      glucoseUnit: selectedUnit,
      notificationsEnabled,
    });
    router.replace('/(onboarding)/06-auth-prompt');
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, theme.spacing['2xl']) }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Progress */}
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
        <ProgressDots current={4} total={6} />
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
        <Rex mood="celebrate" size="large" showSpeechBubble message="¡Casi listo!" />
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
        <Text style={styles.title}>Últimos ajustes</Text>
        <Text style={styles.subtitle}>Personaliza tu experiencia</Text>
      </Animated.View>

      {/* Unit Selection */}
      <Animated.View
        style={[
          styles.section,
          {
            opacity: cardAnims[0],
            transform: [
              {
                translateY: cardAnims[0].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.sectionTitle}>Unidad de glucosa</Text>
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[styles.option, selectedUnit === 'MG_DL' && styles.optionSelected]}
            onPress={() => setSelectedUnit('MG_DL')}
            activeOpacity={0.8}
          >
            <View style={styles.optionHeader}>
              <Text style={[styles.optionValue, selectedUnit === 'MG_DL' && styles.optionValueSelected]}>
                mg/dL
              </Text>
              {selectedUnit === 'MG_DL' && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.optionSubtext}>Común en España y Latinoamérica</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, selectedUnit === 'MMOL_L' && styles.optionSelected]}
            onPress={() => setSelectedUnit('MMOL_L')}
            activeOpacity={0.8}
          >
            <View style={styles.optionHeader}>
              <Text style={[styles.optionValue, selectedUnit === 'MMOL_L' && styles.optionValueSelected]}>
                mmol/L
              </Text>
              {selectedUnit === 'MMOL_L' && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.optionSubtext}>Estándar internacional</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Notifications */}
      <Animated.View
        style={[
          styles.section,
          {
            opacity: cardAnims[1],
            transform: [
              {
                translateY: cardAnims[1].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.sectionTitle}>Recordatorios</Text>
        <View style={styles.notificationCard}>
          <View style={styles.notificationIcon}>
            <Text style={styles.notificationEmoji}>🔔</Text>
          </View>
          <View style={styles.notificationInfo}>
            <Text style={styles.notificationTitle}>Notificaciones</Text>
            <Text style={styles.notificationSubtitle}>
              Recordatorios suaves para registrar tu glucosa
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{
              false: theme.colors.background.light.secondary,
              true: theme.colors.primary,
            }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={theme.colors.background.light.secondary}
          />
        </View>
      </Animated.View>

      {/* Privacy note */}
      <View style={styles.privacyNote}>
        <Text style={styles.privacyIcon}>🔒</Text>
        <Text style={styles.privacyText}>
          Tus datos son privados y nunca se comparten sin tu permiso.
        </Text>
      </View>

      {/* Continue Button */}
      <Animated.View style={[styles.buttonContainer, { transform: [{ scale: buttonScale }] }]}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleContinue}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>Continuar</Text>
        </TouchableOpacity>
      </Animated.View>
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
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary.light,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text.secondary.light,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  option: {
    flex: 1,
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.soft,
  },
  optionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionValue: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.secondary.light,
  },
  optionValueSelected: {
    color: theme.colors.primary,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  optionSubtext: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled.light,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.soft,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  notificationEmoji: {
    fontSize: 22,
  },
  notificationInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  notificationTitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
    color: theme.colors.text.primary.light,
    marginBottom: 2,
  },
  notificationSubtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.glucose.normal + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  privacyIcon: {
    fontSize: 18,
    marginRight: theme.spacing.sm,
  },
  privacyText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
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
});
