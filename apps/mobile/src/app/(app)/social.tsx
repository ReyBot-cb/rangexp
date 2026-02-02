import { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@rangexp/theme';
import { useSafeArea } from '../../components/SafeScreen';
import { Rex } from '../../components/Rex';
import { Icon } from '../../components/Icon';
import { ActivityFeedItem } from '../../components/ActivityFeedItem';
import {
  useFriends,
  useFriendRequests,
  useActivityFeed,
  useAddFriend,
  useAcceptFriendRequest,
} from '../../hooks/useSocial';
import { useUserStore } from '../../store';
import { useSocialStore, Friend } from '../../store/socialStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

dayjs.extend(relativeTime);
dayjs.locale('es');

export default function SocialScreen() {
  const router = useRouter();
  const { insets } = useSafeArea();
  const { user } = useUserStore();
  const { friends, pendingRequests } = useSocialStore();
  const { data: friendsData } = useFriends();
  const { data: requestsData } = useFriendRequests();
  const { data: feed } = useActivityFeed();
  const addFriendMutation = useAddFriend();
  const acceptRequestMutation = useAcceptFriendRequest();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'feed'>('friends');
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    Animated.spring(tabIndicatorAnim, {
      toValue: activeTab === 'friends' ? 0 : 1,
      friction: 8,
      tension: 60,
      useNativeDriver: false,
    }).start();
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptRequestMutation.mutateAsync(requestId);
      Alert.alert('¡Amigo añadido!', 'Ahora puedes ver sus actividades');
    } catch (error) {
      Alert.alert('Error', 'No se pudo aceptar la solicitud');
    }
  };

  const handleAddFriend = () => {
    if (!searchQuery.trim()) {
      Alert.alert('Buscar', 'Ingresa un nombre o email para buscar');
      return;
    }
    Alert.alert('Buscar usuarios', `Buscando: ${searchQuery}`);
  };

  const friendCount = friendsData?.length || friends?.length || 0;
  const pendingCount = requestsData?.length || 0;

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
          <Text style={styles.headerTitle}>Social</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Rex & Stats */}
        <View style={styles.heroSection}>
          <Rex
            mood={friendCount > 0 ? 'happy' : 'neutral'}
            size="medium"
            showSpeechBubble
            message={friendCount > 0 ? '¡A celebrar juntos!' : '¡Añade amigos!'}
          />
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{friendCount}</Text>
              <Text style={styles.heroStatLabel}>Amigos</Text>
            </View>
            {pendingCount > 0 && (
              <View style={styles.heroStatBadge}>
                <Icon name="bell" size={12} color="#FFFFFF" weight="fill" />
                <Text style={styles.heroStatBadgeText}>{pendingCount} nuevas</Text>
              </View>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveTab('friends')}
              activeOpacity={0.8}
            >
              <Icon
                name="users"
                size={18}
                color={activeTab === 'friends' ? '#FFFFFF' : theme.colors.text.secondary.light}
                weight={activeTab === 'friends' ? 'fill' : 'regular'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'friends' && styles.tabTextSelected,
                ]}
              >
                Amigos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveTab('feed')}
              activeOpacity={0.8}
            >
              <Icon
                name="chat-circle"
                size={18}
                color={activeTab === 'feed' ? '#FFFFFF' : theme.colors.text.secondary.light}
                weight={activeTab === 'feed' ? 'fill' : 'regular'}
              />
              <Text
                style={[styles.tabText, activeTab === 'feed' && styles.tabTextSelected]}
              >
                Actividad
              </Text>
            </TouchableOpacity>
            <Animated.View
              style={[
                styles.tabIndicator,
                {
                  left: tabIndicatorAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '50%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {activeTab === 'friends' ? (
          <>
            {/* Pending Requests */}
            {requestsData && requestsData.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Solicitudes</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{requestsData.length}</Text>
                  </View>
                </View>
                {requestsData.map((request) => (
                  <View key={request.id} style={styles.requestCard}>
                    <View style={styles.requestAvatar}>
                      <Text style={styles.requestAvatarText}>
                        {request.fromUser.name[0]}
                      </Text>
                    </View>
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestName}>{request.fromUser.name}</Text>
                      <Text style={styles.requestTime}>
                        {dayjs(request.timestamp).fromNow()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAcceptRequest(request.id)}
                      activeOpacity={0.8}
                    >
                      <Icon name="check" size={18} color="#FFFFFF" weight="bold" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Search */}
            <View style={styles.searchSection}>
              <View style={styles.searchContainer}>
                <Icon
                  name="magnifying-glass"
                  size={20}
                  color={theme.colors.text.disabled.light}
                />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Buscar amigos..."
                  placeholderTextColor={theme.colors.text.disabled.light}
                  onSubmitEditing={handleAddFriend}
                />
              </View>
            </View>

            {/* Friends List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mis amigos</Text>
              {friendsData && friendsData.length > 0 ? (
                friendsData.map((friend: Friend) => (
                  <TouchableOpacity
                    key={friend.id}
                    style={styles.friendCard}
                    activeOpacity={0.8}
                  >
                    <View style={styles.friendAvatar}>
                      <Text style={styles.friendAvatarText}>{friend.name[0]}</Text>
                      {friend.isOnline && <View style={styles.onlineIndicator} />}
                    </View>
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <View style={styles.friendMeta}>
                        <Icon
                          name="star"
                          size={12}
                          color={theme.colors.text.secondary.light}
                          weight="fill"
                        />
                        <Text style={styles.friendLevel}>Nivel {friend.level}</Text>
                        <View style={styles.friendDot} />
                        <Icon
                          name="fire"
                          size={12}
                          color={theme.colors.gamification.streak}
                          weight="fill"
                        />
                        <Text style={styles.friendStreak}>{friend.streak}</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.cheersButton} activeOpacity={0.8}>
                      <Icon
                        name="hands-clapping"
                        size={22}
                        color={theme.colors.primary}
                        weight="duotone"
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Rex mood="neutral" size="medium" />
                  <Text style={styles.emptyTitle}>Sin amigos aún</Text>
                  <Text style={styles.emptyText}>
                    Busca amigos para compartir tu progreso y motivarse mutuamente
                  </Text>
                  <TouchableOpacity style={styles.inviteButton} activeOpacity={0.8}>
                    <Icon name="share" size={18} color="#FFFFFF" />
                    <Text style={styles.inviteButtonText}>Invitar amigos</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        ) : (
          /* Activity Feed */
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actividad reciente</Text>
            {feed && feed.length > 0 ? (
              feed.map((item) => (
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
              ))
            ) : (
              <View style={styles.emptyState}>
                <Rex mood="support" size="medium" />
                <Text style={styles.emptyTitle}>Sin actividad</Text>
                <Text style={styles.emptyText}>
                  Cuando tus amigos registren glucosa o logren objetivos, lo verás aquí
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Tip */}
        <View style={styles.tipContainer}>
          <Icon name="lightbulb" size={20} color={theme.colors.primary} weight="duotone" />
          <Text style={styles.tipText}>
            Celebra los logros de tus amigos para motivarlos en su camino
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
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  heroStats: {
    flex: 1,
    marginLeft: theme.spacing.md,
    alignItems: 'flex-start',
  },
  heroStat: {
    marginBottom: theme.spacing.xs,
  },
  heroStatValue: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize['3xl'],
    color: theme.colors.text.primary.light,
  },
  heroStatLabel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
  },
  heroStatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  heroStatBadgeText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tabsContainer: {
    marginBottom: theme.spacing.lg,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.light.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: 4,
    position: 'relative',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    zIndex: 1,
    gap: theme.spacing.xs,
  },
  tabText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text.secondary.light,
  },
  tabTextSelected: {
    color: '#FFFFFF',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '50%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary.light,
    marginBottom: theme.spacing.md,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    marginLeft: theme.spacing.sm,
  },
  badgeText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchSection: {
    marginBottom: theme.spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadows.soft,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary.light,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.soft,
  },
  requestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  requestAvatarText: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.lg,
    color: '#FFFFFF',
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
    color: theme.colors.text.primary.light,
  },
  requestTime: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
    marginTop: 2,
  },
  acceptButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glucose.normal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.soft,
  },
  friendAvatar: {
    position: 'relative',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  friendAvatarText: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.xl,
    color: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.glucose.normal,
    borderWidth: 2,
    borderColor: theme.colors.background.light.card,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
    color: theme.colors.text.primary.light,
    marginBottom: 4,
  },
  friendMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  friendLevel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
  },
  friendDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.text.disabled.light,
    marginHorizontal: 4,
  },
  friendStreak: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gamification.streak,
  },
  cheersButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary.light,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary.light,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  inviteButtonText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
    color: '#FFFFFF',
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
