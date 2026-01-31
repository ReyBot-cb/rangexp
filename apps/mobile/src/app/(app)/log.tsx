import { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@rangexp/theme';
import { Rex } from '../../components/Rex';
import { useAddGlucose } from '../../hooks/useGlucose';
import { useUserStore } from '../../store';
import { GlucoseStatus } from '../../store/glucoseStore';

const contexts = [
  { id: 'fasting', label: 'En ayunas', icon: '🌅' },
  { id: 'before_meal', label: 'Antes de comer', icon: '🍽️' },
  { id: 'after_meal', label: 'Después de comer', icon: '😋' },
  { id: 'bedtime', label: 'Antes de dormir', icon: '🌙' },
  { id: 'other', label: 'Otro', icon: '📍' },
];

export default function LogScreen() {
  const router = useRouter();
  const addGlucose = useAddGlucose();
  const { user, addXp } = useUserStore();
  
  const [value, setValue] = useState('');
  const [selectedContext, setSelectedContext] = useState('fasting');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numericValue = parseInt(value, 10);
  const isValidValue = !isNaN(numericValue) && numericValue > 0 && numericValue < 600;

  const getStatus = (val: number): GlucoseStatus => {
    if (val < 70) return 'low';
    if (val > 180) return 'high';
    return 'normal';
  };

  const getStatusMessage = (status: GlucoseStatus) => {
    switch (status) {
      case 'low':
        return { text: 'Un poco bajo', color: theme.colors.glucose.low };
      case 'high':
        return { text: 'Un poco alto', color: theme.colors.glucose.high };
      default:
        return { text: '¡En rango! ✨', color: theme.colors.glucose.normal };
    }
  };

  const handleSubmit = async () => {
    if (!isValidValue) {
      Alert.alert('Valor inválido', 'Por favor ingresa un valor entre 1 y 599');
      return;
    }

    setIsSubmitting(true);

    try {
      await addGlucose.mutateAsync({
        value: numericValue,
        context: selectedContext,
        notes: notes || undefined,
      });

      addXp(10);

      Alert.alert(
        '¡Registrado! 🎉',
        `+10 XP ganados\n\n${getStatusMessage(getStatus(numericValue)).text}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el registro. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const status = isValidValue ? getStatus(numericValue) : 'normal';
  const statusMessage = getStatusMessage(status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header with Rex */}
      <View style={styles.header}>
        <Rex 
          mood={isValidValue ? (status === 'normal' ? 'celebrate' : 'support') : 'neutral'}
          size="large"
          showSpeechBubble
          message={isValidValue ? statusMessage.text : '¿Cuánto marcó?'}
        />
      </View>

      {/* Glucose Value Input */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Valor de glucosa</Text>
        <View style={styles.valueContainer}>
          <TextInput
            style={styles.valueInput}
            value={value}
            onChangeText={setValue}
            placeholder="--"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            maxLength={3}
          />
          <Text style={styles.unit}>mg/dL</Text>
        </View>
      </View>

      {/* Context Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>¿Cuándo?</Text>
        <View style={styles.contextGrid}>
          {contexts.map((ctx) => (
            <TouchableOpacity
              key={ctx.id}
              style={[
                styles.contextOption,
                selectedContext === ctx.id && styles.contextOptionSelected,
              ]}
              onPress={() => setSelectedContext(ctx.id)}
            >
              <Text style={styles.contextIcon}>{ctx.icon}</Text>
              <Text style={[
                styles.contextLabel,
                selectedContext === ctx.id && styles.contextLabelSelected,
              ]}>{ctx.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.label}>Notas (opcional)</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="¿Comiste algo especial? ¿Hiciste ejercicio?"
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={200}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.submitButton, !isValidValue && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!isValidValue || isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Guardando...' : '💾 Guardar (+10 XP)'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light.primary,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  inputSection: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text.primary.light,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.soft,
  },
  valueInput: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 64,
    fontWeight: '700',
    color: theme.colors.text.primary.light,
    textAlign: 'center',
    minWidth: 100,
  },
  unit: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.secondary.light,
    marginLeft: theme.spacing.sm,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  contextGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  contextOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.background.light.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  contextOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
  },
  contextIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  contextLabel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
    textAlign: 'center',
  },
  contextLabelSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: theme.colors.background.light.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary.light,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
    ...theme.shadows.medium,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
