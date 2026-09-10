import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Local avatar fallback.
 *
 * Clerk's `setProfileImage` uploads to the Clerk CDN, which is the preferred
 * path (it syncs across devices). When that upload is unavailable, we keep the
 * picked image on-device so the user still sees their avatar — scoped per user
 * so switching accounts does not leak one avatar into another.
 */
const KEY = (userId: string) => `hengwu-avatar-${userId}`;

export async function getLocalAvatar(userId: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEY(userId));
  } catch {
    return null;
  }
}

export async function setLocalAvatar(userId: string, uri: string | null): Promise<void> {
  try {
    if (uri) await AsyncStorage.setItem(KEY(userId), uri);
    else await AsyncStorage.removeItem(KEY(userId));
  } catch {
    // Non-fatal: the avatar simply will not persist locally.
  }
}
