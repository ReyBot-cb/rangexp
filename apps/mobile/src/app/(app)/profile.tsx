import { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@rangexp/theme';
import { Rex } from '../../components/Rex';
import { useUserStore } from '../../store';
import { useLogout } from '../../hooks/useUser';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useUserStore();
  const logoutMutation = useLogout();
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled ?? true);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar sesión', 
          style: 'destructive',
          onPress: async () => {
            await logoutMutation.mutateAsync();
            router.replace('/(auth)/login');
          }
        },
      ]
    );
  };

  const handleUpdateNotifications = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    updateUser({ notificationsEnabled: enabled });
  };

  const handleUpdateUnit = () => {
    const newUnit = user?.glucoseUnit === 'MG_DL' ? 'MMOL_L' : 'MG_DL';
    updateUser({ glucoseUnit: newUnit });
    Alert.alert('Unidad actualizada', `Ahora usas ${newUnit === 'MG_DL' ? 'mg/dL' : 'mmol/L'}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header with Rex */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Rex mood="happy" size="large" />
        </View>
        <Text style={styles.name}>{user?.name || 'Usuario'}</Text>
        <Text style={styles.email}>{user?.email || 'email@ejemplo.com'}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Nivel {user?.level || 1}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.xp || 0}</Text>
          <Text style={styles.statLabel}>XP Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.streak || 0}</Text>
          <Text style={styles.statLabel}>Días seguidos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.isPremium ? '✨' : 'Free'}</Text>
          <Text style={styles.statLabel}>Plan</Text>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Ajustes</Text>

        {/* Unit Toggle */}
        <TouchableOpacity style={styles.settingItem} onPress={handleUpdateUnit}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Unidad de glucosa</Text>
            <Text style={styles.settingValue}>
              {user?.glucoseUnit === 'MG_DL' ? 'mg/dL' : 'mmol/L'}
            </Text>
          </View>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>

        {/* Notifications Toggle */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Notificaciones</Text>
            <Text style={styles.settingValue}>
              Recordatorios suaves
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleUpdateNotifications}
            trackColor={{ false: theme.colors.background.light.secondary, true: theme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Premium */}
      {!user?.isPremium && (
        <TouchableOpacity style={styles.premiumCard} onPress={() => Alert.alert('Premium', 'Próximamente')}>
          <Text style={styles.premiumEmoji}>⭐</Text>
          <View style={styles.premiumInfo}>
            <Text style={styles.premiumTitle}>Upgrade a Premium</Text>
            <Text style={styles.premiumSubtitle}>Más funciones, más logros</Text>
          </View>
          <Text style={styles.premiumArrow}>→</Text>
        </TouchableOpacity>
      )}

      {/* About */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Acerca de</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Rex', 'Tu compañero en el manejo de la diabetes')}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>🐾 Conoce a Rex</Text>
          </View>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Política de privacidad', 'Próximamente')}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Privacidad</Text>
          </View>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Términos', 'Próximamente')}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Términos de servicio</Text>
          </View>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Versión', '0.0.1')}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Versión</Text>
          </View>
          <Text style={styles.settingValue}>0.0.1</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      {/* Made with love */}
      <Text style={styles.footer}>
        Hecho con ❤️ para ti
      </Text>
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
  avatarContainer: {
    marginBottom: theme.spacing.md,
  },
  name: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize["2xl"],
    color: theme.colors.text.primary.light,
    marginBottom: 4,
  },
  email: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
    marginBottom: theme.spacing.sm,
  },
  levelBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
  },
  levelText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.soft,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.background.light.secondary,
    marginHorizontal: theme.spacing.sm,
  },
  statValue: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.primary.light,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary.light,
  },
  settingsSection: {
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
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.soft,
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
  settingArrow: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.disabled.light,
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  premiumEmoji: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  premiumInfo: {
    flex: 1,
  },
  premiumTitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  premiumSubtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  premiumArrow: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.lg,
    color: '#FFFFFF',
  },
  logoutButton: {
    backgroundColor: theme.colors.background.light.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  logoutText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.states.error,
    fontWeight: '600',
  },
  footer: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.disabled.light,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});
