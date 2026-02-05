/**
 * Sync Service
 *
 * Handles synchronization between local storage (for anonymous users)
 * and the backend (for registered users).
 *
 * Rules:
 * - Anonymous users: All data stored locally
 * - Registered users: All data from backend, nothing stored locally
 * - On login/register: Sync local data to backend, then clear local storage
 */

import { apiClient, getAuthToken } from '@rangexp/api-client';
import { GAMIFICATION } from '@rangexp/types';
import { useGlucoseStore, GlucoseReading } from '../store/glucoseStore';
import { useUserStore } from '../store/userStore';

interface SyncResult {
  success: boolean;
  syncedReadings: number;
  syncedXp: number;
  errors: string[];
}

/**
 * Check if user is registered (has auth token)
 */
export function isRegisteredUser(): boolean {
  const token = getAuthToken();
  const { user } = useUserStore.getState();
  return !!token && user?.accountType === 'registered';
}

/**
 * Check if user is anonymous (guest)
 */
export function isAnonymousUser(): boolean {
  const { user } = useUserStore.getState();
  return user?.accountType === 'anonymous';
}

/**
 * Get pending local data that needs to be synced
 */
export function getPendingLocalData() {
  const { readings } = useGlucoseStore.getState();
  const { user } = useUserStore.getState();

  const pendingReadings = readings.filter(r => !r.synced);
  const localXp = user?.accountType === 'anonymous' ? (user?.xp || 0) : 0;
  const localStreak = user?.accountType === 'anonymous' ? (user?.streak || 0) : 0;

  return {
    pendingReadings,
    localXp,
    localStreak,
    hasDataToSync: pendingReadings.length > 0 || localXp > 0,
  };
}

/**
 * Sync a single glucose reading to the backend
 */
async function syncReadingToBackend(reading: GlucoseReading): Promise<boolean> {
  try {
    await apiClient.post('/glucose', {
      value: reading.value,
      unit: reading.unit,
      context: reading.context.toUpperCase(),
      recordedAt: reading.timestamp,
      ...(reading.notes && { note: reading.notes }),
    });
    return true;
  } catch (error) {
    console.error('[SyncService] Failed to sync reading:', reading.id, error);
    return false;
  }
}

/**
 * Sync extra XP to the backend (XP not from glucose readings)
 */
async function syncExtraXpToBackend(extraXp: number): Promise<boolean> {
  if (extraXp <= 0) return true;

  try {
    await apiClient.post('/gamification/xp', {
      amount: extraXp,
      reason: 'ANONYMOUS_MERGE',
    });
    return true;
  } catch (error) {
    console.error('[SyncService] Failed to sync extra XP:', error);
    return false;
  }
}

/**
 * Sync all local data to backend
 * Called after successful login/register
 */
export async function syncLocalDataToBackend(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    syncedReadings: 0,
    syncedXp: 0,
    errors: [],
  };

  const { pendingReadings, localXp } = getPendingLocalData();

  // Sync readings
  for (const reading of pendingReadings) {
    const synced = await syncReadingToBackend(reading);
    if (synced) {
      result.syncedReadings++;
    } else {
      result.errors.push(`Failed to sync reading ${reading.id}`);
      result.success = false;
    }
  }

  // Calculate extra XP (XP not from glucose readings)
  // Each glucose reading gives GLUCOSE_LOG XP, so subtract that from local XP
  const xpFromReadings = pendingReadings.length * GAMIFICATION.XP.GLUCOSE_LOG;
  const extraXp = Math.max(0, localXp - xpFromReadings);

  if (extraXp > 0) {
    const xpSynced = await syncExtraXpToBackend(extraXp);
    if (xpSynced) {
      result.syncedXp = extraXp;
    } else {
      result.errors.push('Failed to sync extra XP');
      result.success = false;
    }
  }

  return result;
}

/**
 * Clear all local data after successful sync
 * Called after login/register when data has been synced to backend
 */
export function clearLocalData(): void {
  const { clearReadings } = useGlucoseStore.getState();
  clearReadings();

  console.log('[SyncService] Local data cleared');
}

/**
 * Full sync flow for login/register
 * 1. Sync pending data to backend
 * 2. Clear local storage
 */
export async function performFullSync(): Promise<SyncResult> {
  console.log('[SyncService] Starting full sync...');

  const result = await syncLocalDataToBackend();

  if (result.success) {
    clearLocalData();
    console.log('[SyncService] Full sync completed successfully');
  } else {
    console.warn('[SyncService] Full sync completed with errors:', result.errors);
    // Still clear local data even if some syncs failed
    // to avoid duplicate data
    clearLocalData();
  }

  return result;
}

/**
 * Add XP locally for anonymous users
 * For registered users, XP is handled by the backend
 */
export function addLocalXp(amount: number): void {
  if (isAnonymousUser()) {
    const { addXp } = useUserStore.getState();
    addXp(amount);
  }
  // For registered users, XP is added by backend via API calls
}

/**
 * Update streak locally for anonymous users
 * For registered users, streak is handled by the backend
 */
export function updateLocalStreak(): void {
  if (isAnonymousUser()) {
    const { user, updateStreak } = useUserStore.getState();
    const today = new Date().toISOString().split('T')[0];
    const lastDate = user?.lastStreakDate;

    if (!lastDate) {
      // First activity
      updateStreak(1);
    } else if (lastDate === today) {
      // Same day, streak already counted
      return;
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === yesterdayStr) {
        // Consecutive day
        updateStreak((user?.streak || 0) + 1);
      } else {
        // Streak broken
        updateStreak(1);
      }
    }
  }
  // For registered users, streak is updated by backend
}
