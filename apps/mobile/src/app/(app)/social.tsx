import { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl, Alert } from 'react-native';
import { theme } from '@rangexp/theme';
import { ActivityFeedItem } from '../../components/ActivityFeedItem';
import { useFriends, useFriendRequests, useActivityFeed, useAddFriend, useAcceptFriendRequest } from '../../hooks/useSocial';
import { useUserStore } from '../../store';
import { useSocialStore, Friend } from '../../store/socialStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

dayjs.extend(relativeTime);
dayjs.locale('es');

export default function SocialScreen() {
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

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptRequestMutation.mutateAsync(requestId);
      Alert.alert('¡Amigo añadido! 🎉', 'Ahora puedes ver sus actividades');
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

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Amigos 👥</Text>
        <Text style={styles.subtitle}>
          Tienes {friends?.length || 0} amigos
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.tabSelected]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'friends' && styles.tabTextSelected,
          ]}>Amigos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'feed' && styles.tabSelected]}
          onPress={() => setActiveTab('feed')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'feed' && styles.tabTextSelected,
          ]}>Actividad</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'friends' ? (
        <>
          {/* Pending Requests */}
          {requestsData && requestsData.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Solicitudes pendientes</Text>
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
                      hace {dayjs(request.timestamp).fromNow()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAcceptRequest(request.id)}
                  >
                    <Text style={styles.acceptButtonText}>✓</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Search */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar amigos..."
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleAddFriend}>
              <Text style={styles.searchButtonText}>🔍</Text>
            </TouchableOpacity>
          </View>

          {/* Friends List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mis amigos</Text>
            {friendsData && friendsData.length > 0 ? (
              friendsData.map((friend: Friend) => (
                <View key={friend.id} style={styles.friendCard}>
                  <View style={styles.friendAvatar}>
                    <Text style={styles.friendAvatarText}>{friend.name[0]}</Text>
                    {friend.isOnline && <View style={styles.onlineIndicator} />}
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{friend.name}</Text>
                    <Text style={styles.friendLevel}>Nivel {friend.level}</Text>
                  </View>
                  <View style={styles.friendStreak}>
                    <Text style={styles.streakEmoji}>🔥</Text>
                    <Text style={styles.streakCount}>{friend.streak}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>👋</Text>
                <Text style={styles.emptyText}>Aún no tienes amigos</Text>
                <Text style={styles.emptySubtext}>
                  ¡Añade amigos para compartir tu progreso!
                </Text>
              </View>
            )}
          </View>
        </>
      ) : (
        /* Activity Feed */
        <View style={styles.section}>
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
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>Sin actividad aún</Text>
              <Text style={styles.emptySubtext}>
                Añade amigos para ver sus actividades
              </Text>
            </View>
          )}
        </View>
      )}
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.light.secondary,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    marginBottom: theme.spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  tabSelected: {
    backgroundColor: theme.colors.primary,
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
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text.primary.light,
    marginBottom: theme.spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  searchInput: {
    flex: 1,
    backgroundColor: theme.colors.background.light.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    paddingLeft: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary.light,
    marginRight: theme.spacing.sm,
  },
  searchButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 18,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.md,
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
  },
  acceptButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glucose.normal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.soft,
  },
  friendAvatar: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  friendAvatarText: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.lg,
    color: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
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
  },
  friendLevel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
  },
  friendStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  streakEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  streakCount: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.gamification.streak,
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text.primary.light,
    marginBottom: 4,
  },
  emptySubtext: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary.light,
    textAlign: 'center',
  },
});
