import { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@rangexp/theme';
import { useSafeArea } from '../../components/SafeScreen';
import { useRegister } from '../../hooks/useUser';
import { Rex } from '../../components/Rex';
import { Icon } from '../../components/Icon';

export default function RegisterScreen() {
  const router = useRouter();
  const { insets } = useSafeArea();
  const registerMutation = useRegister();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Focus states
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const clearError = () => setError('');

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await registerMutation.mutateAsync({ email, password, name });
      router.replace('/(onboarding)/01-welcome');
    } catch (err) {
      setError('Error al crear la cuenta. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password)
      return { level: 0, label: '', color: theme.colors.text.disabled.light };
    if (password.length < 8)
      return { level: 1, label: 'Débil', color: theme.colors.glucose.high };
    if (password.length < 12)
      return { level: 2, label: 'Media', color: theme.colors.glucose.low };
    return { level: 3, label: 'Fuerte', color: theme.colors.glucose.normal };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Rex Header */}
          <View style={styles.rexContainer}>
            <Rex mood="celebrate" size="medium" showSpeechBubble message="¡Vamos a empezar!" />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.brandName}>RangeXp</Text>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>Únete y mejora tu control de glucosa</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre</Text>
              <View
                style={[styles.inputWrapper, nameFocused && styles.inputWrapperFocused]}
              >
                <Icon
                  name="user"
                  size={20}
                  color={nameFocused ? theme.colors.primary : theme.colors.text.disabled.light}
                />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    clearError();
                  }}
                  placeholder="¿Cómo te llamas?"
                  placeholderTextColor={theme.colors.text.disabled.light}
                  autoComplete="name"
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View
                style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}
              >
                <Icon
                  name="envelope"
                  size={20}
                  color={emailFocused ? theme.colors.primary : theme.colors.text.disabled.light}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    clearError();
                  }}
                  placeholder="tu@email.com"
                  placeholderTextColor={theme.colors.text.disabled.light}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <View
                style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}
              >
                <Icon
                  name="lock"
                  size={20}
                  color={passwordFocused ? theme.colors.primary : theme.colors.text.disabled.light}
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearError();
                  }}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor={theme.colors.text.disabled.light}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon
                    name={showPassword ? 'eye-slash' : 'eye'}
                    size={20}
                    color={theme.colors.text.disabled.light}
                  />
                </TouchableOpacity>
              </View>
              {password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBar}>
                    {[1, 2, 3].map((level) => (
                      <View
                        key={level}
                        style={[
                          styles.strengthSegment,
                          {
                            backgroundColor:
                              level <= passwordStrength.level
                                ? passwordStrength.color
                                : theme.colors.background.light.secondary,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Icon
                    name={passwordStrength.level >= 3 ? 'shield-check' : 'shield'}
                    size={14}
                    color={passwordStrength.color}
                    weight={passwordStrength.level >= 2 ? 'fill' : 'regular'}
                  />
                  <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                    {passwordStrength.label}
                  </Text>
                </View>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <View
                style={[
                  styles.inputWrapper,
                  confirmFocused && styles.inputWrapperFocused,
                  confirmPassword && password !== confirmPassword && styles.inputWrapperError,
                ]}
              >
                <Icon
                  name="lock-key"
                  size={20}
                  color={
                    confirmPassword && password !== confirmPassword
                      ? theme.colors.states.error
                      : confirmFocused
                        ? theme.colors.primary
                        : theme.colors.text.disabled.light
                  }
                />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    clearError();
                  }}
                  placeholder="Repite la contraseña"
                  placeholderTextColor={theme.colors.text.disabled.light}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="new-password"
                  onFocus={() => setConfirmFocused(true)}
                  onBlur={() => setConfirmFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon
                    name={showConfirmPassword ? 'eye-slash' : 'eye'}
                    size={20}
                    color={theme.colors.text.disabled.light}
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword && password === confirmPassword && (
                <View style={styles.matchIndicator}>
                  <Icon name="check-circle" size={14} color={theme.colors.glucose.normal} weight="fill" />
                  <Text style={styles.matchText}>Las contraseñas coinciden</Text>
                </View>
              )}
              {confirmPassword && password !== confirmPassword && (
                <View style={styles.matchIndicator}>
                  <Icon name="x-circle" size={14} color={theme.colors.states.error} weight="fill" />
                  <Text style={styles.noMatchText}>Las contraseñas no coinciden</Text>
                </View>
              )}
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Icon
                  name="warning-circle"
                  size={18}
                  color={theme.colors.states.error}
                  weight="fill"
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isLoading}
                activeOpacity={0.9}
              >
                {isLoading ? (
                  <Text style={styles.buttonText}>Creando cuenta...</Text>
                ) : (
                  <>
                    <Icon name="sparkle" size={20} color="#FFFFFF" weight="fill" />
                    <Text style={styles.buttonText}>Crear Cuenta</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.linkText}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerContainer}>
            <Icon name="shield" size={14} color={theme.colors.text.disabled.light} />
            <Text style={styles.disclaimer}>
              Al crear tu cuenta, aceptas nuestros Términos de Servicio y Política de
              Privacidad
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  rexContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  brandName: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.primary,
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.text.primary.light,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary.light,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.card,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text.primary.light,
    marginBottom: theme.spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.light.secondary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: theme.spacing.sm,
  },
  inputWrapperFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background.light.card,
  },
  inputWrapperError: {
    borderColor: theme.colors.states.error,
    backgroundColor: '#FEF2F2',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.primary.light,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  strengthBar: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  matchText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.glucose.normal,
  },
  noMatchText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.states.error,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.states.error + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.states.error,
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
    ...theme.shadows.medium,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  footerText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary.light,
  },
  linkText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  disclaimer: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled.light,
    textAlign: 'center',
    flex: 1,
  },
});
