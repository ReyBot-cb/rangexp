import { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@rangexp/theme';
import { Rex } from '../../components/Rex';
import { useUserStore } from '../../store';

export default function FirstActionScreen() {
  const router = useRouter();
  const { updateUser } = useUserStore();
  const [selectedUnit, setSelectedUnit] = useState<'MG_DL' | 'MMOL_L'>('MG_DL');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleStart = () => {
    updateUser({
      glucoseUnit: selectedUnit,
      notificationsEnabled,
    });
    router.replace('/(app)/');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Rex */}
      <View style={styles.rexContainer}>
        <Rex 
          mood="celebrate" 
          size="large"
          showSpeechBubble
          message="¡Casi listo! ⚡"
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Últimos ajustes</Text>
        <Text style={styles.subtitle}>Personaliza tu experiencia</Text>

        {/* Unit Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Unidad de glucosa</Text>
          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[
                styles.option,
                selectedUnit === 'MG_DL' && styles.optionSelected,
              ]}
              onPress={() => setSelectedUnit('MG_DL')}
            >
              <Text style={[
                styles.optionText,
                selectedUnit === 'MG_DL' && styles.optionTextSelected,
              ]}>mg/dL</Text>
              <Text style={styles.optionSubtext}>Más común en España y LatAm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.option,
                selectedUnit === 'MMOL_L' && styles.optionSelected,
              ]}
              onPress={() => setSelectedUnit('MMOL_L')}
            >
              <Text style={[
                styles.optionText,
                selectedUnit === 'MMOL_L' && styles.optionTextSelected,
              ]}>mmol/L</Text>
              <Text style={styles.optionSubtext}>Estándar internacional</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recordatorios</Text>
          <TouchableOpacity
            style={styles.notificationRow}
            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
          >
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>Notificaciones</Text>
              <Text style={styles.notificationSubtitle}>
                Recuerdos suaves para registrar tu glucosa
              </Text>
            </View>
            <View style={[
              styles.toggle,
              notificationsEnabled && styles.toggleActive,
            ]}>
              <View style={[
                styles.toggleKnob,
                notificationsEnabled && styles.toggleKnobActive,
              ]} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Start Button */}
      <TouchableOpacity style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>¡Empezar! 🎉</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background.light.primary,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  rexContainer: {
    marginBottom: theme.spacing.lg,
  },
  content: {
    flex: 1,
    width: '100%',
  },
  title: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize["2xl"],
    color: theme.colors.text.primary.light,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary.light,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text.primary.light,
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
    backgroundColor: theme.colors.background.light.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
  },
  optionText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text.secondary.light,
    marginBottom: 4,
  },
  optionTextSelected: {
    color: theme.colors.primary,
  },
  optionSubtext: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled.light,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background.light.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
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
  toggle: {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.text.disabled.light,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  toggleKnobActive: {
    marginLeft: 24,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
