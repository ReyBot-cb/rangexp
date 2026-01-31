import { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@rangexp/theme';
import { Rex } from '../../components/Rex';
import { GlucoseCard } from '../../components/GlucoseCard';
import { XpProgressBar } from '../../components/XpProgressBar';
import { AchievementBadge } from '../../components/AchievementBadge';
import { ActivityFeedItem } from '../../components/ActivityFeedItem';
import { useUserStore } from '../../store';
import { useGlucoseStore } from '../../store/glucoseStore';
import { useRecentAchievements } from '../../hooks/useAchievements';
import { useActivityFeed } from '../../hooks/useSocial';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

dayjs.extend(relativeTime);
dayjs.locale('es');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const { readings, stats } = useGlucoseStore();
  const recentAchievements = useRecentAchievements();
  const { data: feed } = useActivityFeed();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const latestReading = readings[0];
  const xpProgress = (user?.xp || 0) % 100;

  const getRexMood = () => {
    if (!latestReading) return 'neutral';
    if (latestReading.status === 'normal') return 'happy';
    return 'support';
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header with Rex */}
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            {user?.name ? `¡Hola, ${user.name.split(' ')[0]}! 👋` : '¡Hola! 👋'}
          </Text>
          <Text style={styles.dateText}>
            {dayjs().format('dddd, D [de] MMMM')}
          </Text>
        </View>
        
        <Rex 
          mood={getRexMood()} 
          size="medium"
          showSpeechBubble
          message={latestReading 
            ? latestReading.status === 'normal' 
              ? '¡Genial! ¡En rango! ✨'
              : '¡Vamos bien! 💪'
            : '¿Listo para registrar?'
          }
        />
      </View>

      {/* Streak Card */}
      <View style={styles.streakCard}>
        <View style={styles.streakContent}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View>
            <Text style={styles.streakValue}>{user?.streak || 0} días</Text>
            <Text style={styles.streakLabel}>Tu racha actual</Text>
          </View>
        </View>
        <View style={styles.streakFire}>
          <Text style={styles.fireText}>🔥</Text>
          <Text style={styles.fireText}>🔥</Text>
          <Text style={styles.fireText}>🔥</Text>
        </View>
      </View>

      {/* XP Progress */}
      <View style={styles.xpCard}>
        <View style={styles.xpHeader}>
          <Text style={styles.xpTitle}>Progreso</Text>
          <Text style={styles.xpLevel}>Nivel {user?.level || 1}</Text>
        </View>
        <XpProgressBar
          currentXp={xpProgress}
          nextLevelXp={100}
          level={user?.level || 1}
        />
      </View>

      {/* Today's Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hoy</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>Registros</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.average || '--'}</Text>
            <Text style={styles.statLabel}>Promedio</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: stats?.timeInRange && stats.timeInRange >= 70 ? theme.colors.glucose.normal : theme.colors.glucose.high }]}>
              {stats?.timeInRange || '--'}%
            </Text>
            <Text style={styles.statLabel}>En rango</Text>
          </View>
        </View>
      </View>

      {/* Latest Reading */}
      {latestReading && (
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
      )}

      {/* Recent Achievements */}
      {recentAchievements && recentAchievements.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Logros recientes</Text>
            <TouchableOpacity onPress={() => router.replace('/(app)/achievements')}>
              <Text style={styles.seeAllText}>Ver todos</Text>
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

      {/* Activity Feed */}
      {feed && feed.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Actividad de amigos</Text>
            <TouchableOpacity onPress={() => router.replace('/(app)/social')}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {feed.slice(0, 3).map((item) => (
            <ActivityFeedItem
              key={item.id}
              type={item.type as any}
              userId={item.userId}
              userName={item.userName}
              content={item.content}
              timestamp={dayjs(item.timestamp).fromNow()}
              likes={item.likes}
              comments={item.comments}
            />
          ))}
        </View>
      )}

      {/* Quick Add Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.replace('/(app)/log')}
      >
        <Text style={styles.addButtonText}>+ Registrar glucosa</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  greeting: {
    flex: 1,
  },
  greetingText: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize["2xl"],
    color: theme.colors.text.primary.light,
    marginBottom: 4,
  },
  dateText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
  },
  streakCard: {
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  streakEmoji: {
    fontSize: 32,
  },
  streakValue: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.gamification.streak,
  },
  streakLabel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
  },
  streakFire: {
    flexDirection: 'row',
    gap: 4,
  },
  fireText: {
    fontSize: 20,
  },
  xpCard: {
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  xpTitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text.primary.light,
  },
  xpLevel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text.primary.light,
    marginBottom: theme.spacing.sm,
  },
  seeAllText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  statValue: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: '700',
    color: theme.colors.text.primary.light,
  },
  statLabel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary.light,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
    ...theme.shadows.medium,
  },
  addButtonText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
