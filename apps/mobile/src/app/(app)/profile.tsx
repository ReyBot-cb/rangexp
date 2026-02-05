import { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { theme } from '@rangexp/theme';
import { useSafeArea } from '../../components/SafeScreen';
import { Rex } from '../../components/Rex';
import { Icon, IconName } from '../../components/Icon';
import { XpProgressBar } from '../../components/XpProgressBar';
import { useUserStore } from '../../store';
import { useLogout } from '../../hooks/useUser';

const isAnonymous = (user: { accountType?: string } | null) =>
  !user || user.accountType === 'anonymous';

type SettingItemProps = {
  icon: IconName;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
};

function SettingItem({ icon, label, value, onPress, rightElement }: SettingItemProps) {
  const content = (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Icon name={icon} size={20} color={theme.colors.primary} weight="duotone" />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {value && <Text style={styles.settingValue}>{value}</Text>}
      </View>
      {rightElement || (
        <Icon name="caret-right" size={20} color={theme.colors.text.disabled.light} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { insets } = useSafeArea();
  const { user, updateUser } = useUserStore();
  const logoutMutation = useLogout();
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.notificationsEnabled ?? true
  );

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          try {
            await logoutMutation.mutateAsync();
          } catch (error) {
            console.log('API logout failed, proceeding with local logout');
          }
          // Haptic feedback on logout
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleUpdateNotifications = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    updateUser({ notificationsEnabled: enabled });
  };

  const handleUpdateUnit = () => {
    const newUnit = user?.glucoseUnit === 'MG_DL' ? 'MMOL_L' : 'MG_DL';
    updateUser({ glucoseUnit: newUnit });
    Alert.alert(
      'Unidad actualizada',
      `Ahora usas ${newUnit === 'MG_DL' ? 'mg/dL' : 'mmol/L'}`
    );
  };

  const xpProgress = (user?.xp || 0) % 100;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + theme.spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={20} color={theme.colors.text.primary.light} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Profile Card */}
        <Animated.View
          style={[
            styles.profileCard,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.avatarContainer}>
            <Rex mood="happy" size="large" />
          </View>
          <Text style={styles.name}>
            {isAnonymous(user) ? 'Invitado' : user?.name || 'Usuario'}
          </Text>
          <Text style={styles.email}>
            {isAnonymous(user) ? 'Usando la app sin cuenta' : user?.email || ''}
          </Text>

          {/* Level Badge & XP */}
          <View style={styles.levelContainer}>
            <View style={styles.levelBadge}>
              <Icon name="star" size={16} color={theme.colors.gamification.xp} weight="fill" />
              <Text style={styles.levelText}>Nivel {user?.level || 1}</Text>
            </View>
          </View>

          <View style={styles.xpContainer}>
            <XpProgressBar
              currentXp={xpProgress}
              nextLevelXp={100}
              level={user?.level || 1}
              showDetails
            />
          </View>
        </Animated.View>

        {/* Register CTA for anonymous users */}
        {isAnonymous(user) && (
          <TouchableOpacity
            style={styles.registerCard}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.9}
          >
            <View style={styles.registerIcon}>
              <Icon name="user-plus" size={24} color={theme.colors.primary} weight="duotone" />
            </View>
            <View style={styles.registerInfo}>
              <Text style={styles.registerTitle}>Crea tu cuenta</Text>
              <Text style={styles.registerSubtitle}>
                Guarda tu progreso, compite con amigos y accede desde cualquier dispositivo
              </Text>
            </View>
            <Icon name="caret-right" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        )}

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Icon name="lightning" size={24} color={theme.colors.gamification.xp} weight="fill" />
            <Text style={styles.statValue}>{user?.xp || 0}</Text>
            <Text style={styles.statLabel}>XP Total</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="fire" size={24} color={theme.colors.gamification.streak} weight="fill" />
            <Text style={styles.statValue}>{user?.streak || 0}</Text>
            <Text style={styles.statLabel}>Racha</Text>
          </View>
          <View style={styles.statCard}>
            <Icon
              name={user?.isPremium ? 'crown' : 'star'}
              size={24}
              color={user?.isPremium ? theme.colors.gamification.xp : theme.colors.text.secondary.light}
              weight="fill"
            />
            <Text style={styles.statValue}>{user?.isPremium ? 'Pro' : 'Free'}</Text>
            <Text style={styles.statLabel}>Plan</Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ajustes</Text>

          <SettingItem
            icon="syringe"
            label="Unidad de glucosa"
            value={user?.glucoseUnit === 'MG_DL' ? 'mg/dL' : 'mmol/L'}
            onPress={handleUpdateUnit}
          />

          <SettingItem
            icon="bell"
            label="Notificaciones"
            value="Recordatorios suaves"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleUpdateNotifications}
                trackColor={{
                  false: theme.colors.background.light.secondary,
                  true: theme.colors.primary,
                }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={theme.colors.background.light.secondary}
              />
            }
          />
        </View>

        {/* Premium Card - only for registered non-premium users */}
        {!isAnonymous(user) && !user?.isPremium && (
          <TouchableOpacity
            style={styles.premiumCard}
            onPress={() => Alert.alert('Premium', 'Próximamente')}
            activeOpacity={0.9}
          >
            <View style={styles.premiumGlow} />
            <Icon name="sparkle" size={32} color="#FFFFFF" weight="fill" />
            <View style={styles.premiumInfo}>
              <Text style={styles.premiumTitle}>Upgrade a Premium</Text>
              <Text style={styles.premiumSubtitle}>
                Más funciones, más logros, sin anuncios
              </Text>
            </View>
            <Icon name="caret-right" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acerca de</Text>

          <SettingItem
            icon="heart"
            label="Conoce a Rex"
            onPress={() =>
              Alert.alert('Rex', 'Tu compañero en el manejo de la diabetes')
            }
          />

          <SettingItem
            icon="shield"
            label="Privacidad"
            onPress={() => Alert.alert('Política de privacidad', 'Próximamente')}
          />

          <SettingItem
            icon="scroll"
            label="Términos de servicio"
            onPress={() => Alert.alert('Términos', 'Próximamente')}
          />

          <SettingItem
            icon="info"
            label="Versión"
            rightElement={
              <Text style={styles.versionText}>0.0.1</Text>
            }
          />
        </View>

        {/* Logout Button for registered users, Auth buttons for anonymous */}
        {isAnonymous(user) ? (
          <View style={styles.authButtonsContainer}>
            <TouchableOpacity
              style={styles.authButton}
              onPress={() => router.push('/(auth)/register')}
              activeOpacity={0.8}
            >
              <Icon name="user-plus" size={20} color="#FFFFFF" />
              <Text style={styles.authButtonText}>Registrarse</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.authButtonSecondary}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.8}
            >
              <Icon name="sign-in" size={20} color={theme.colors.primary} />
              <Text style={styles.authButtonSecondaryText}>Iniciar sesion</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Icon name="sign-out" size={20} color={theme.colors.states.error} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Hecho con</Text>
          <Icon name="heart" size={14} color={theme.colors.states.error} weight="fill" />
          <Text style={styles.footerText}>para ti</Text>
        </View>
        <Text style={styles.footerSubtext}>RangeXp 2024</Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light.primary,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
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
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.primary.light,
  },
  headerSpacer: {
    width: 40,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.card,
  },
  avatarContainer: {
    marginBottom: theme.spacing.md,
  },
  name: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.text.primary.light,
    marginBottom: 4,
  },
  email: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
    marginBottom: theme.spacing.md,
  },
  levelContainer: {
    marginBottom: theme.spacing.md,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gamification.xp + '20',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  levelText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.gamification.xp,
  },
  xpContainer: {
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.soft,
  },
  statValue: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.primary.light,
    marginTop: theme.spacing.xs,
  },
  statLabel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary.light,
    marginTop: 2,
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.soft,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary.light,
  },
  settingValue: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
    marginTop: 2,
  },
  versionText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gamification.xp,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    overflow: 'hidden',
    gap: theme.spacing.md,
    ...theme.shadows.medium,
  },
  premiumGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  premiumInfo: {
    flex: 1,
  },
  premiumTitle: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  premiumSubtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  registerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: theme.colors.primary + '30',
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  registerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerInfo: {
    flex: 1,
  },
  registerTitle: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text.primary.light,
    marginBottom: 2,
  },
  registerSubtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
    lineHeight: 18,
  },
  authButtonsContainer: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadows.medium,
  },
  authButtonText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  authButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  authButtonSecondaryText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.light.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  logoutText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.states.error,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
    gap: theme.spacing.xs,
  },
  footerText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
  },
  footerSubtext: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled.light,
    textAlign: 'center',
    marginTop: 4,
  },
});
