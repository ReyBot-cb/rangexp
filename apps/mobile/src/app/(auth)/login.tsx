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
import * as Haptics from 'expo-haptics';
import { theme } from '@rangexp/theme';
import { useSafeArea } from '../../components/SafeScreen';
import { useLogin } from '../../hooks/useUser';
import { useAppStore } from '../../store';
import { Rex } from '../../components/Rex';
import { Icon } from '../../components/Icon';

export default function LoginScreen() {
  const router = useRouter();
  const { insets } = useSafeArea();
  const loginMutation = useLogin();
  const { hasCompletedOnboarding } = useAppStore();

  // If onboarding is completed, user came from the app (as anonymous) and can go back
  const canGoBack = hasCompletedOnboarding;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    setError('');

    // Timeout de 10 segundos
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setError('Tiempo de espera agotado. Verifica tu conexión.');
    }, 10000);

    try {
      console.log('Intentando login con:', email);
      console.log('API URL:', process.env.EXPO_PUBLIC_API_BASE_URL);
      await loginMutation.mutateAsync({ email, password });
      clearTimeout(timeoutId);
      // Haptic feedback on successful login
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(app)');
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.log('Error de login:', err?.message || err);
      if (err?.message?.includes('Network') || err?.message?.includes('fetch')) {
        setError('Error de conexión. Verifica que el servidor esté activo.');
      } else {
        setError(
          err?.response?.data?.message || 'Credenciales incorrectas. Inténtalo de nuevo.'
        );
      }
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
          {/* Back Button (only show if user can go back to app) */}
          {canGoBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Icon name="arrow-left" size={20} color={theme.colors.text.primary.light} />
              <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
          )}

          {/* Rex Header */}
          <View style={styles.rexContainer}>
            <Rex
              mood="happy"
              size="large"
              animationState="greeting"
              showSpeechBubble
              message="¡Hola de nuevo!"
            />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.brandName}>RangeXp</Text>
            <Text style={styles.title}>Bienvenido de nuevo</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar tu aventura</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View
                style={[
                  styles.inputWrapper,
                  emailFocused && styles.inputWrapperFocused,
                  error && !email && styles.inputWrapperError,
                ]}
              >
                <Icon
                  name="envelope"
                  size={20}
                  color={
                    emailFocused
                      ? theme.colors.primary
                      : theme.colors.text.disabled.light
                  }
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError('');
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

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <View
                style={[
                  styles.inputWrapper,
                  passwordFocused && styles.inputWrapperFocused,
                  error && !password && styles.inputWrapperError,
                ]}
              >
                <Icon
                  name="lock"
                  size={20}
                  color={
                    passwordFocused
                      ? theme.colors.primary
                      : theme.colors.text.disabled.light
                  }
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError('');
                  }}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.text.disabled.light}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
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
                onPress={handleLogin}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isLoading}
                activeOpacity={0.9}
              >
                {isLoading ? (
                  <Text style={styles.buttonText}>Iniciando sesión...</Text>
                ) : (
                  <>
                    <Icon name="sign-out" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Iniciar Sesión</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
              <Text style={styles.linkText}>Regístrate</Text>
            </TouchableOpacity>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerContainer}>
            <Icon name="shield" size={14} color={theme.colors.text.disabled.light} />
            <Text style={styles.disclaimer}>
              Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  backButtonText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary.light,
  },
  rexContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
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
  },
});
