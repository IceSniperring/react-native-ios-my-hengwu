import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';

import { UserAvatar } from '../../src/components/UserAvatar';
import { useUserProfile } from '../../src/cloud/useUserProfile';
import { ProfileForm } from '../../src/native/ProfileForm';
import { pickAvatarImage } from '../../src/pickImage';
import { useColors } from '../../src/useColors';

/**
 * Profile editor — nickname (Clerk `unsafeMetadata`) and avatar.
 *
 * The avatar hero stays React Native (`expo-image` + the picker) and the form
 * body is the SwiftUI `ProfileForm`, matching how the asset screens split
 * native controls from RN chrome.
 */
export default function EditProfileScreen() {
  const c = useColors();
  const profile = useUserProfile();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const back = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/profile');
  }, []);

  const onPickAvatar = async () => {
    setError(null);
    try {
      const uri = await pickAvatarImage();
      if (!uri) return;
      setBusy(true);
      const result = await profile.saveAvatar(uri);
      if (result === 'local') {
        setError('头像已存到本机：云端上传当前不可用，换设备不会同步');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '头像更新失败');
    } finally {
      setBusy(false);
    }
  };

  const onSave = async (nickname: string) => {
    setError(null);
    setBusy(true);
    try {
      await profile.saveNickname(nickname);
      back();
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setBusy(false);
    }
  };

  return (
    // Root is a Pressable so a tap outside the field dismisses the keyboard;
    // the buttons inside claim their own touches first.
    <Pressable
      accessible={false}
      onPress={Keyboard.dismiss}
      style={[styles.root, { backgroundColor: c.bg }]}>
      <View style={styles.hero}>
        <UserAvatar uri={profile.avatarUrl} glyph={profile.glyph} size={88} />
      </View>
      <ProfileForm
        nickname={profile.nickname}
        email={profile.email}
        avatarUrl={profile.avatarUrl}
        busy={busy}
        error={error}
        fallbackGlyph={profile.glyph}
        onPickAvatar={() => {
          void onPickAvatar();
        }}
        onSave={(next) => {
          void onSave(next);
        }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { alignItems: 'center', paddingTop: 20 },
});
