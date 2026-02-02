import { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@rangexp/theme';
import { SafeScreen, useSafeArea } from '../../components/SafeScreen';
import { Rex } from '../../components/Rex';
import { Icon } from '../../components/Icon';
import { GlucoseCard } from '../../components/GlucoseCard';
import { XpProgressBar } from '../../components/XpProgressBar';
import { AchievementBadge } from '../../components/AchievementBadge';
import { useUserStore } from '../../store';
import { useGlucoseStore } from '../../store/glucoseStore';
import { useRecentAchievements } from '../../hooks/useAchievements';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

dayjs.extend(relativeTime);
dayjs.locale('es');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const { readings, stats, getTodayReadings } = useGlucoseStore();
  const recentAchievements = useRecentAchievements();
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const todayReadings = getTodayReadings();
  const latestReading = readings[0];
  const xpProgress = (user?.xp || 0) % 100;

  const getRexMood = () => {
    if (!latestReading) return 'neutral';
    if (latestReading.status === 'normal') return 'happy';
    return 'support';
  };

  const getRexMessage = () => {
    if (!latestReading) return '¿Listo para registrar?';
    if (latestReading.status === 'normal') return '¡En rango!';
    return '¡Vamos bien!';
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  const { insets } = useSafeArea();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + theme.spacing.md }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>
                {user?.name ? `¡Hola, ${user.name.split(' ')[0]}!` : '¡Hola!'}
              </Text>
              <Text style={styles.date}>{dayjs().format('dddd, D [de] MMMM')}</Text>
            </View>
            <Rex
              mood={getRexMood()}
              size="medium"
              showSpeechBubble
              message={getRexMessage()}
            />
          </View>

          {/* Streak */}
          <View style={styles.streakRow}>
            <View style={styles.streakIconContainer}>
              <Icon name="fire" size={24} color={theme.colors.gamification.streak} weight="fill" />
            </View>
            <Text style={styles.streakValue}>{user?.streak || 0} días</Text>
            <Text style={styles.streakLabel}>de racha</Text>
          </View>

          {/* XP Progress */}
          <View style={styles.xpSection}>
            <XpProgressBar
              currentXp={xpProgress}
              nextLevelXp={100}
              level={user?.level || 1}
              showDetails
            />
          </View>

          {/* Today Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hoy</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon
                  name="drop"
                  size={20}
                  color={theme.colors.primary}
                  weight="duotone"
                  style={{ marginBottom: 4 }}
                />
                <Text style={styles.statValue}>{todayReadings.length}</Text>
                <Text style={styles.statLabel}>Registros</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Icon
                  name="chart-line"
                  size={20}
                  color={theme.colors.primary}
                  weight="duotone"
                  style={{ marginBottom: 4 }}
                />
                <Text style={styles.statValue}>{stats?.average || '--'}</Text>
                <Text style={styles.statLabel}>Promedio</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Icon
                  name="target"
                  size={20}
                  color={
                    (stats?.timeInRange || 0) >= 70
                      ? theme.colors.glucose.normal
                      : theme.colors.primary
                  }
                  weight="duotone"
                  style={{ marginBottom: 4 }}
                />
                <Text
                  style={[
                    styles.statValue,
                    {
                      color:
                        (stats?.timeInRange || 0) >= 70
                          ? theme.colors.glucose.normal
                          : theme.colors.text.primary.light,
                    },
                  ]}
                >
                  {stats?.timeInRange || '--'}%
                </Text>
                <Text style={styles.statLabel}>En rango</Text>
              </View>
            </View>
          </View>

          {/* Latest Reading */}
          {latestReading ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Último registro</Text>
              <GlucoseCard
                value={latestReading.value}
                unit="mg/dL"
                status={latestReading.status as 'low' | 'normal' | 'high'}
                timestamp={dayjs(latestReading.timestamp).fromNow()}
                trend="stable"
                showRex
              />
            </View>
          ) : (
            <View style={styles.emptySection}>
              <Icon
                name="drop"
                size={48}
                color={theme.colors.text.disabled.light}
                weight="duotone"
              />
              <Text style={styles.emptyText}>
                Aún no hay registros hoy.{'\n'}¡Registra tu primera glucosa!
              </Text>
            </View>
          )}

          {/* Recent Achievements */}
          {recentAchievements && recentAchievements.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Logros recientes</Text>
                <TouchableOpacity
                  style={styles.seeAllButton}
                  onPress={() => router.push('/(app)/achievements')}
                >
                  <Text style={styles.seeAllText}>Ver todos</Text>
                  <Icon name="caret-right" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {recentAchievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    icon={achievement.icon}
                    name={achievement.name}
                    rarity={achievement.rarity as any}
                    unlocked={true}
                    size="medium"
                    style={{ marginRight: theme.spacing.sm }}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Spacer for button */}
          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, theme.spacing.xl) }]}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(app)/log')}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
          >
            <Icon name="plus" size={22} color="#FFFFFF" weight="bold" />
            <Text style={styles.addButtonText}>Registrar glucosa</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.text.primary.light,
    marginBottom: 4,
  },
  date: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
    textTransform: 'capitalize',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  streakIconContainer: {
    marginRight: theme.spacing.sm,
  },
  streakValue: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.gamification.streak,
    marginRight: theme.spacing.xs,
  },
  streakLabel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary.light,
  },
  xpSection: {
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary.light,
    marginBottom: theme.spacing.sm,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    marginRight: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.soft,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: theme.colors.background.light.secondary,
  },
  statValue: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: '700',
    color: theme.colors.text.primary.light,
  },
  statLabel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary.light,
    marginTop: 2,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary.light,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: theme.spacing.md,
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
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    ...theme.shadows.medium,
  },
  addButtonText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
