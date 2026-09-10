import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT } from '../typography';
import { useColors } from '../useColors';
import { useCloudUiStore } from './cloudUiStore';
import { useCloudAssets } from './useCloudAssets';

/** Top banner: write failure must be visible + retryable (no silent drop). */
export function CloudWriteBanner() {
  const c = useColors();
  const writeError = useCloudUiStore((s) => s.writeError);
  const { retryPending } = useCloudAssets();

  if (!writeError) return null;

  return (
    <View style={[styles.wrap, { backgroundColor: c.bannerDangerBg, borderColor: c.danger }]}>
      <Text style={[styles.msg, { color: c.danger }]} numberOfLines={2}>
        {writeError}
      </Text>
      <Pressable
        onPress={() => {
          void retryPending();
        }}
        hitSlop={8}
        style={[styles.btn, { backgroundColor: c.danger }]}>
        <Text style={[styles.btnText, { color: c.onTint }]}>重试</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  msg: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONT.medium,
    lineHeight: 18,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnText: {
    fontSize: 13,
    fontFamily: FONT.semibold,
  },
});
