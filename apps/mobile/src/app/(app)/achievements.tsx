import { useState, useRef, useEffect } from 'react';
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
import { useSafeArea } from '../../components/SafeScreen';
import { Rex } from '../../components/Rex';
import { Icon, IconName } from '../../components/Icon';
import { AchievementCard } from '../../components/AchievementCard';
import { useAchievements, useAchievementCategories, type Achievement } from '../../hooks/useAchievements';

const categoryIcons: Record<string, IconName> = {
  registros: 'chart-line',
  rachas: 'fire',
  niveles: 'chart-line-up',
  social: 'users',
  contextos: 'calendar',
  control: 'target',
  especiales: 'star',
};

export default function AchievementsScreen() {
  const router = useRouter();
  const { insets } = useSafeArea();
  const { data: achievements, refetch, isLoading } = useAchievements();
  const { categories } = useAchievementCategories();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

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

  // Animate progress bar when data loads
  useEffect(() => {
    if (achievements && achievements.length > 0) {
      const totalUnlocked = achievements.filter((a: Achievement) => a.unlocked).length;
      const total = achievements.length;
      Animated.timing(progressAnim, {
        toValue: total > 0 ? totalUnlocked / total : 0,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }
  }, [achievements]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Find the selected category to get its achievements
  const selectedCategoryData = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)
    : null;

  // Get last 3 unlocked achievements (sorted by unlockedAt, most recent first)
  const recentUnlockedAchievements = achievements
    ?.filter((a: Achievement) => a.unlocked && a.unlockedAt)
    .sort((a: Achievement, b: Achievement) =>
      new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
    )
    .slice(0, 3) || [];

  // When a category is selected, show all achievements from that category
  // Otherwise show only the last 3 unlocked
  const filteredAchievements = selectedCategory && selectedCategoryData
    ? selectedCategoryData.achievements
    : recentUnlockedAchievements;

  const totalUnlocked = achievements?.filter((a: Achievement) => a.unlocked).length || 0;
  const total = achievements?.length || 0;
  const progressPercentage = total > 0 ? Math.round((totalUnlocked / total) * 100) : 0;

  const getRexMood = () => {
    if (progressPercentage >= 80) return 'celebrate';
    if (progressPercentage >= 50) return 'happy';
    return 'neutral';
  };

  const getRexMessage = () => {
    if (progressPercentage >= 80) return '¡Increíble!';
    if (progressPercentage >= 50) return '¡Muy bien!';
    if (progressPercentage > 0) return '¡Sigue así!';
    return '¡A por los logros!';
  };

  return (
    <ScrollView
      style={styles.container}
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
          <Text style={styles.headerTitle}>Logros</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Rex & Summary */}
        <View style={styles.summarySection}>
          <Rex mood={getRexMood()} size="medium" showSpeechBubble message={getRexMessage()} />

          <View style={styles.summaryStats}>
            <View style={styles.summaryMainStat}>
              <Text style={styles.summaryValue}>{totalUnlocked}</Text>
              <Text style={styles.summaryLabel}>de {total} logros</Text>
            </View>

            {/* Animated Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{progressPercentage}% completado</Text>
            </View>
          </View>
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}
        >
          <TouchableOpacity
            style={[styles.categoryChip, !selectedCategory && styles.categoryChipSelected]}
            onPress={() => setSelectedCategory(null)}
            activeOpacity={0.8}
          >
            <Icon
              name="trophy"
              size={16}
              color={!selectedCategory ? '#FFFFFF' : theme.colors.text.secondary.light}
              weight={!selectedCategory ? 'fill' : 'regular'}
            />
            <Text
              style={[
                styles.categoryChipText,
                !selectedCategory && styles.categoryChipTextSelected,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && styles.categoryChipSelected,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
              activeOpacity={0.8}
            >
              <Icon
                name={categoryIcons[cat.id] || 'star'}
                size={16}
                color={
                  selectedCategory === cat.id ? '#FFFFFF' : theme.colors.text.secondary.light
                }
                weight={selectedCategory === cat.id ? 'fill' : 'regular'}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat.id && styles.categoryChipTextSelected,
                ]}
              >
                {cat.name}
              </Text>
              <View
                style={[
                  styles.categoryCount,
                  selectedCategory === cat.id && styles.categoryCountSelected,
                ]}
              >
                <Text
                  style={[
                    styles.categoryCountText,
                    selectedCategory === cat.id && styles.categoryCountTextSelected,
                  ]}
                >
                  {cat.unlockedCount}/{cat.totalCount}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory
              ? categories.find((c) => c.id === selectedCategory)?.name || 'Logros'
              : 'Últimos logros'}
          </Text>
          <Text style={styles.sectionCount}>
            {selectedCategory
              ? `${filteredAchievements?.length || 0} logros`
              : `${recentUnlockedAchievements.length} de ${totalUnlocked} obtenidos`}
          </Text>
        </View>

        {/* Achievements Grid */}
        <View style={styles.achievementsGrid}>
          {filteredAchievements?.map((achievement: Achievement, index: number) => (
            <Animated.View
              key={achievement.id}
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20 + index * 5, 0],
                    }),
                  },
                ],
              }}
            >
              <AchievementCard
                icon={achievement.icon as IconName}
                name={achievement.name}
                description={achievement.description}
                rarity={achievement.rarity}
                unlocked={achievement.unlocked}
                unlockedAt={achievement.unlockedAt}
                progress={achievement.progress}
                xpReward={achievement.xpReward}
              />
            </Animated.View>
          ))}
        </View>

        {/* Empty State */}
        {filteredAchievements?.length === 0 && (
          <View style={styles.emptyState}>
            <Icon
              name={selectedCategory ? 'magnifying-glass' : 'trophy'}
              size={48}
              color={theme.colors.text.disabled.light}
            />
            <Text style={styles.emptyText}>
              {selectedCategory
                ? 'No hay logros en esta categoría'
                : '¡Aún no has desbloqueado logros!'}
            </Text>
            {!selectedCategory && (
              <Text style={styles.emptySubtext}>
                Registra tu glucosa para empezar a ganar logros
              </Text>
            )}
          </View>
        )}

        {/* Category Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Por categoría</Text>
          <View style={styles.statsGrid}>
            {categories.map((cat) => {
              const progress =
                cat.totalCount > 0 ? (cat.unlockedCount / cat.totalCount) * 100 : 0;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.statCard,
                    selectedCategory === cat.id && styles.statCardSelected,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <Icon
                    name={categoryIcons[cat.id] || 'star'}
                    size={28}
                    color={
                      selectedCategory === cat.id
                        ? theme.colors.primary
                        : theme.colors.text.secondary.light
                    }
                    weight="duotone"
                  />
                  <Text style={styles.statName}>{cat.name}</Text>
                  <View style={styles.statProgressTrack}>
                    <View style={[styles.statProgressFill, { width: `${progress}%` }]} />
                  </View>
                  <Text style={styles.statCount}>
                    {cat.unlockedCount}/{cat.totalCount}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tip */}
        <View style={styles.tipContainer}>
          <Icon name="lightbulb" size={20} color={theme.colors.primary} weight="duotone" />
          <Text style={styles.tipText}>
            Registra tu glucosa diariamente para desbloquear más logros y ganar XP
          </Text>
        </View>
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
  summarySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  summaryStats: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  summaryMainStat: {
    marginBottom: theme.spacing.sm,
  },
  summaryValue: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize['3xl'],
    color: theme.colors.gamification.achievement,
  },
  summaryLabel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
  },
  progressContainer: {
    marginTop: theme.spacing.xs,
  },
  progressTrack: {
    height: 8,
    backgroundColor: theme.colors.background.light.secondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.gamification.achievement,
    borderRadius: 4,
  },
  progressText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary.light,
    marginTop: 4,
  },
  categoriesScroll: {
    marginBottom: theme.spacing.lg,
    marginHorizontal: -theme.spacing.lg,
  },
  categoriesContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.sm,
    gap: theme.spacing.xs,
    ...theme.shadows.soft,
  },
  categoryChipSelected: {
    backgroundColor: theme.colors.primary,
  },
  categoryChipText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  categoryCount: {
    backgroundColor: theme.colors.background.light.secondary,
    borderRadius: theme.borderRadius.full,
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.xs,
  },
  categoryCountSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryCountText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary.light,
  },
  categoryCountTextSelected: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary.light,
  },
  sectionCount: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'flex-start',
    marginBottom: theme.spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary.light,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.disabled.light,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  statsSection: {
    marginBottom: theme.spacing.lg,
  },
  statsTitle: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary.light,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.soft,
  },
  statCardSelected: {
    borderColor: theme.colors.primary,
  },
  statName: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary.light,
    fontWeight: '600',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  statProgressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: theme.colors.background.light.secondary,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  statProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.gamification.achievement,
    borderRadius: 3,
  },
  statCount: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  tipText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
    lineHeight: 20,
  },
});
