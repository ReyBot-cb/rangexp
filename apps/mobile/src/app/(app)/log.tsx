import { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@rangexp/theme';
import { useSafeArea } from '../../components/SafeScreen';
import { Rex } from '../../components/Rex';
import { Icon, IconName } from '../../components/Icon';
import { useAddGlucose } from '../../hooks/useGlucose';
import { useUserStore } from '../../store';
import { GlucoseStatus, GlucoseContext } from '../../store/glucoseStore';

const contexts: { id: string; label: string; icon: IconName }[] = [
  { id: 'fasting', label: 'En ayunas', icon: 'sun-horizon' },
  { id: 'before_meal', label: 'Antes de comer', icon: 'fork-knife' },
  { id: 'after_meal', label: 'Después de comer', icon: 'cooking-pot' },
  { id: 'bedtime', label: 'Antes de dormir', icon: 'moon-stars' },
  { id: 'other', label: 'Otro', icon: 'map-pin' },
];

export default function LogScreen() {
  const router = useRouter();
  const addGlucose = useAddGlucose();
  const { user, addXp } = useUserStore();

  const [value, setValue] = useState('');
  const [selectedContext, setSelectedContext] = useState('fasting');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

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
  }, []);

  const numericValue = parseInt(value, 10);
  const isValidValue = !isNaN(numericValue) && numericValue > 0 && numericValue < 600;

  const getStatus = (val: number): GlucoseStatus => {
    if (val < 70) return 'low';
    if (val > 180) return 'high';
    return 'normal';
  };

  const getStatusInfo = (status: GlucoseStatus) => {
    switch (status) {
      case 'low':
        return {
          text: 'Un poco bajo',
          color: theme.colors.glucose.low,
          bgColor: theme.colors.glucose.low + '15',
        };
      case 'high':
        return {
          text: 'Un poco alto',
          color: theme.colors.glucose.high,
          bgColor: theme.colors.glucose.high + '15',
        };
      default:
        return {
          text: '¡En rango!',
          color: theme.colors.glucose.normal,
          bgColor: theme.colors.glucose.normal + '15',
        };
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
        context: selectedContext as GlucoseContext,
        notes: notes || undefined,
      });

      addXp(10);

      Alert.alert(
        '¡Registrado!',
        `+10 XP ganados\n\n${getStatusInfo(getStatus(numericValue)).text}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el registro. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  const { insets } = useSafeArea();

  const status = isValidValue ? getStatus(numericValue) : 'normal';
  const statusInfo = getStatusInfo(status);

  const getRexMood = () => {
    if (!isValidValue) return 'neutral';
    if (status === 'normal') return 'celebrate';
    return 'support';
  };

  const getRexMessage = () => {
    if (!isValidValue) return '¿Cuánto marcó?';
    return statusInfo.text;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + theme.spacing.md }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Icon name="arrow-left" size={20} color={theme.colors.text.primary.light} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Registrar glucosa</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Rex */}
          <View style={styles.rexContainer}>
            <Rex mood={getRexMood()} size="large" showSpeechBubble message={getRexMessage()} />
          </View>

          {/* Glucose Value Input */}
          <View style={styles.inputSection}>
            <View
              style={[
                styles.valueContainer,
                isValidValue && { borderColor: statusInfo.color, borderWidth: 2 },
              ]}
            >
              <TextInput
                style={[styles.valueInput, isValidValue && { color: statusInfo.color }]}
                value={value}
                onChangeText={setValue}
                placeholder="---"
                placeholderTextColor={theme.colors.text.disabled.light}
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={styles.unit}>mg/dL</Text>
            </View>

            {/* Status indicator */}
            {isValidValue && (
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                <Icon
                  name={status === 'normal' ? 'check-circle' : 'info'}
                  size={16}
                  color={statusInfo.color}
                  weight="fill"
                />
                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                  {statusInfo.text}
                </Text>
              </View>
            )}
          </View>

          {/* Context Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>¿Cuándo?</Text>
            <View style={styles.contextGrid}>
              {contexts.map((ctx) => (
                <TouchableOpacity
                  key={ctx.id}
                  style={[
                    styles.contextOption,
                    selectedContext === ctx.id && styles.contextOptionSelected,
                  ]}
                  onPress={() => setSelectedContext(ctx.id)}
                  activeOpacity={0.8}
                >
                  <Icon
                    name={ctx.icon}
                    size={28}
                    color={
                      selectedContext === ctx.id
                        ? theme.colors.primary
                        : theme.colors.text.secondary.light
                    }
                    weight={selectedContext === ctx.id ? 'fill' : 'duotone'}
                  />
                  <Text
                    style={[
                      styles.contextLabel,
                      selectedContext === ctx.id && styles.contextLabelSelected,
                    ]}
                  >
                    {ctx.label}
                  </Text>
                  {selectedContext === ctx.id && (
                    <View style={styles.checkIndicator}>
                      <Icon name="check" size={12} color="#FFFFFF" weight="bold" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas (opcional)</Text>
            <View style={styles.notesContainer}>
              <Icon
                name="note"
                size={20}
                color={theme.colors.text.disabled.light}
                style={styles.notesIcon}
              />
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="¿Comiste algo especial? ¿Hiciste ejercicio?"
                placeholderTextColor={theme.colors.text.disabled.light}
                multiline
                maxLength={200}
              />
            </View>
            <Text style={styles.charCount}>{notes.length}/200</Text>
          </View>

          {/* XP Preview */}
          <View style={styles.xpPreview}>
            <Icon name="lightning" size={18} color={theme.colors.gamification.xp} weight="fill" />
            <Text style={styles.xpText}>+10 XP al guardar</Text>
          </View>

          {/* Spacer for button */}
          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, theme.spacing.xl) }]}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[styles.submitButton, !isValidValue && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={!isValidValue || isSubmitting}
            activeOpacity={0.9}
          >
            <Icon name="floppy-disk" size={20} color="#FFFFFF" weight="fill" />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Guardando...' : 'Guardar registro'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.light.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary.light,
  },
  headerSpacer: {
    width: 40,
  },
  rexContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  inputSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.soft,
  },
  valueInput: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 72,
    fontWeight: '700',
    color: theme.colors.text.primary.light,
    textAlign: 'center',
    minWidth: 140,
  },
  unit: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.secondary.light,
    marginLeft: theme.spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  statusText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
  },
  section: {
    marginBottom: theme.spacing.lg,
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
  contextGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  contextOption: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    ...theme.shadows.soft,
  },
  contextOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },
  contextLabel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  contextLabelSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  checkIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.soft,
  },
  notesIcon: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  notesInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.primary.light,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled.light,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  xpPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gamification.xp + '15',
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  xpText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gamification.xp,
    fontWeight: '600',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.background.light.primary,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    ...theme.shadows.medium,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
