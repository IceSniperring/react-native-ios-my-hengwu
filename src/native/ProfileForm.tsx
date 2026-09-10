import { Camera } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { GlassSurface } from '../components/GlassSurface';
import { FONT } from '../typography';
import { useColors } from '../useColors';
import type { ProfileFormProps } from './forms';

/**
 * Nickname editor, styled to match the sign-in screen's iOS 26 language:
 * filled rounded fields, a capsule primary action, and a Liquid Glass secondary
 * action. The avatar hero is rendered by the route, not here.
 */
export function ProfileForm({
  nickname,
  email,
  busy,
  error,
  fallbackGlyph,
  onPickAvatar,
  onSave,
}: ProfileFormProps) {
  const c = useColors();
  const [name, setName] = useState(nickname);
  const dirty = name.trim() !== nickname.trim();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.identity, { color: c.textSecondary }]}>
        {email ?? `${fallbackGlyph} 已登录`}
      </Text>

      <Text style={[styles.label, { color: c.textSecondary }]}>昵称</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="给自己起个名字"
        placeholderTextColor={c.textTertiary}
        editable={!busy}
        style={[styles.field, { backgroundColor: c.input, color: c.text }]}
      />

      {error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: c.danger }]}>
          {error}
        </Text>
      ) : null}

      <Pressable
        disabled={busy || !dirty}
        accessibilityRole="button"
        onPress={() => onSave(name)}
        style={({ pressed }) => [
          styles.cta,
          {
            backgroundColor: busy || !dirty ? c.chip : c.tint,
            opacity: pressed && dirty ? 0.85 : 1,
          },
        ]}>
        <Text style={[styles.ctaText, { color: busy || !dirty ? c.textTertiary : c.onTint }]}>
          {busy ? '保存中…' : '保存'}
        </Text>
      </Pressable>

      <GlassSurface interactive style={styles.secondary} fallbackStyle={{ backgroundColor: c.chip }}>
        <Pressable
          accessibilityRole="button"
          onPress={onPickAvatar}
          style={({ pressed }) => [styles.secondaryHit, { opacity: pressed ? 0.6 : 1 }]}>
          <Camera size={17} color={c.tint} strokeWidth={2.2} />
          <Text style={[styles.secondaryText, { color: c.tint }]}>更换头像</Text>
        </Pressable>
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 8 },
  identity: { fontSize: 14, fontFamily: FONT.regular, marginBottom: 20 },
  label: { fontSize: 13, fontFamily: FONT.medium, marginBottom: 8 },
  field: {
    height: 54,
    borderRadius: 18,
    paddingHorizontal: 18,
    fontSize: 17,
    fontFamily: FONT.regular,
  },
  error: { marginTop: 12, fontSize: 13, fontFamily: FONT.regular },
  cta: {
    marginTop: 24,
    alignSelf: 'stretch',
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontSize: 17, fontFamily: FONT.semibold },
  secondary: {
    marginTop: 12,
    alignSelf: 'stretch',
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(128,128,128,0.25)',
  },
  secondaryHit: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryText: { fontSize: 17, fontFamily: FONT.medium },
});
