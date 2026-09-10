import { useUser } from '@clerk/expo';
import { useCallback, useEffect, useState } from 'react';

import { getLocalAvatar, setLocalAvatar } from './avatarStore';

type Metadata = { nickname?: unknown };

export type AvatarSaveResult = 'cloud' | 'local';

/**
 * Reads the signed-in user's identity for display and writes profile edits back
 * to Clerk.
 *
 * - Nickname lives in `unsafeMetadata.nickname`, which is writable from the
 *   frontend and therefore needs no Clerk Dashboard setting changes.
 * - Avatar prefers Clerk's CDN (`setProfileImage`), falling back to a
 *   per-user local copy when the upload is unavailable.
 */
export function useUserProfile() {
  const { user, isLoaded, isSignedIn } = useUser();
  const userId = user?.id;
  const [localAvatar, setLocalAvatarState] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setLocalAvatarState(null);
      return;
    }
    void getLocalAvatar(userId).then((uri) => {
      if (!cancelled) setLocalAvatarState(uri);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const meta = (user?.unsafeMetadata ?? {}) as Metadata;
  const nickname = typeof meta.nickname === 'string' ? meta.nickname : '';
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  const displayName =
    nickname ||
    user?.fullName ||
    user?.username ||
    (email ? email.split('@')[0] : '') ||
    '';

  // A Cloud image always wins; the local copy only fills the gap.
  const avatarUrl = user?.hasImage ? user.imageUrl : localAvatar;
  const glyph = (displayName.trim()[0] ?? '衡').toUpperCase();

  const saveNickname = useCallback(
    async (next: string) => {
      if (!user) throw new Error('未登录');
      // Deep-merges, so unrelated unsafeMetadata keys survive.
      await user.updateMetadata({ unsafeMetadata: { nickname: next.trim() } });
    },
    [user],
  );

  const saveAvatar = useCallback(
    async (uri: string): Promise<AvatarSaveResult> => {
      if (!user) throw new Error('未登录');
      try {
        const blob = await (await fetch(uri)).blob();
        await user.setProfileImage({ file: blob });
        await setLocalAvatar(user.id, null);
        setLocalAvatarState(null);
        return 'cloud';
      } catch {
        // Upload unavailable for this instance — keep it on-device instead of
        // failing the whole edit.
        await setLocalAvatar(user.id, uri);
        setLocalAvatarState(uri);
        return 'local';
      }
    },
    [user],
  );

  return {
    loaded: isLoaded,
    isSignedIn: !!isSignedIn,
    nickname,
    displayName: displayName || '衡物',
    email,
    avatarUrl,
    glyph,
    saveNickname,
    saveAvatar,
  };
}
