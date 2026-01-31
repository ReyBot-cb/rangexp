import { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { theme } from '@rangexp/theme';
import { AchievementBadge } from '../../components/AchievementBadge';
import { useAchievements, useAchievementCategories } from '../../hooks/useAchievements';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  targetValue: number;
  currentValue: number;
}

export default function AchievementsScreen() {
  const { data: achievements, refetch, isLoading } = useAchievements();
  const { categories } = useAchievementCategories();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filteredAchievements = selectedCategory
    ? achievements?.filter(a => {
        if (selectedCategory === 'streaks') return a.id.includes('streak') || a.id.includes('day');
        if (selectedCategory === 'glucose') return a.id.includes('glucose') || a.id.includes('reading');
        if (selectedCategory === 'consistency') return a.id.includes('week') || a.id.includes('month');
        if (selectedCategory === 'special') return !a.id.includes('streak') && !a.id.includes('day') && !a.id.includes('glucose') && !a.id.includes('reading') && !a.id.includes('week') && !a.id.includes('month');
        return true;
      })
    : achievements;

  const totalUnlocked = achievements?.filter(a => a.unlocked).length || 0;
  const total = achievements?.length || 0;

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Logros 🏆</Text>
        <Text style={styles.subtitle}>
          {totalUnlocked} de {total} desbloqueados
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressCard}>
        <View style={styles.progressTrack}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${total > 0 ? (totalUnlocked / total) * 100 : 0}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {total > 0 ? Math.round((totalUnlocked / total) * 100) : 0}% completado
        </Text>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categories}
      >
        <TouchableOpacity
          style={[styles.categoryChip, !selectedCategory && styles.categoryChipSelected]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[
            styles.categoryChipText,
            !selectedCategory && styles.categoryChipTextSelected,
          ]}>Todos</Text>
        </TouchableOpacity>
        
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipSelected]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={[
              styles.categoryChipText,
              selectedCategory === cat.id && styles.categoryChipTextSelected,
            ]}>
              {cat.name} ({cat.unlockedCount}/{cat.totalCount})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Achievements Grid */}
      <View style={styles.achievementsGrid}>
        {filteredAchievements?.map((achievement: Achievement) => (
          <AchievementBadge
            key={achievement.id}
            icon={achievement.icon}
            name={achievement.name}
            rarity={achievement.rarity}
            unlocked={achievement.unlocked}
            description={achievement.unlocked ? achievement.description : undefined}
            progress={achievement.progress}
            size="medium"
          />
        ))}
      </View>

      {/* Stats Summary */}
      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>Estadísticas</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>
              {categories.find(c => c.id === 'streaks')?.unlockedCount || 0}
            </Text>
            <Text style={styles.statLabel}>Rachas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🩸</Text>
            <Text style={styles.statValue}>
              {categories.find(c => c.id === 'glucose')?.unlockedCount || 0}
            </Text>
            <Text style={styles.statLabel}>Glucosa</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>📅</Text>
            <Text style={styles.statValue}>
              {categories.find(c => c.id === 'consistency')?.unlockedCount || 0}
            </Text>
            <Text style={styles.statLabel}>Consistencia</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>
              {categories.find(c => c.id === 'special')?.unlockedCount || 0}
            </Text>
            <Text style={styles.statLabel}>Especiales</Text>
          </View>
        </View>
      </View>
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
    marginBottom: theme.spacing.md,
  },
  title: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize["2xl"],
    color: theme.colors.text.primary.light,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
  },
  progressCard: {
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.soft,
  },
  progressTrack: {
    height: 12,
    backgroundColor: theme.colors.background.light.secondary,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.gamification.achievement,
    borderRadius: 6,
  },
  progressText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
    textAlign: 'center',
  },
  categoriesContainer: {
    marginBottom: theme.spacing.lg,
  },
  categories: {
    paddingRight: theme.spacing.md,
  },
  categoryChip: {
    backgroundColor: theme.colors.background.light.secondary,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.sm,
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
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  statsSection: {
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.soft,
  },
  statsTitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text.primary.light,
    marginBottom: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.primary.light,
  },
  statLabel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary.light,
  },
});
