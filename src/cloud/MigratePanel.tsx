import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ConfirmDialog } from '../native/ConfirmDialog';
import { useStore } from '../store';
import { FONT } from '../typography';
import { useColors } from '../useColors';
import { useCloudUiStore } from './cloudUiStore';
import { useCloudAssets } from './useCloudAssets';

/** One-tap migrate entry + confirmation dialog (native on iOS). */
export function MigratePanel() {
  const c = useColors();
  const assets = useStore((s) => s.assets);
  const wishes = useStore((s) => s.wishes);
  const plans = useStore((s) => s.plans);
  const migrated = useCloudUiStore((s) => s.migrated);
  const migrating = useCloudUiStore((s) => s.migrating);
  const migrateError = useCloudUiStore((s) => s.migrateError);
  const { migrateToCloud } = useCloudAssets();
  const [sheet, setSheet] = useState(false);

  const localCount = assets.length + wishes.length + plans.length;

  if (migrated) {
    return (
      <View style={[styles.banner, { backgroundColor: c.bannerWarnBg }]}>
        <Text style={[styles.bannerText, { color: c.text }]}>云端已同步 · 换机登录可继续</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      <View style={[styles.banner, { backgroundColor: c.bannerWarnBg }]}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.bannerText, { color: c.text }]}>本地数据尚未上云</Text>
          <Text style={{ fontSize: 12, color: c.textSecondary, lineHeight: 16 }}>
            检测到本机有 {localCount} 条资产与账本记录。全量替换会覆盖该账号云端已有数据。
          </Text>
        </View>
      </View>

      {migrateError ? (
        <Text style={{ color: c.danger, fontSize: 13 }}>迁移未完成：{migrateError}</Text>
      ) : null}

      <Pressable
        disabled={migrating}
        onPress={() => setSheet(true)}
        style={[styles.cta, { backgroundColor: c.tint, opacity: migrating ? 0.7 : 1 }]}>
        {migrating ? (
          <ActivityIndicator color={c.onTint} />
        ) : (
          <Text style={[styles.ctaText, { color: c.onTint }]}>一键迁移到云端</Text>
        )}
      </Pressable>

      <ConfirmDialog
        visible={sheet}
        title="用本机数据替换云端？"
        message="此操作不可撤销。云端现有资产将被本机这份替换。失败可重试，本机数据保留。"
        confirmLabel="确认替换并迁移"
        destructive
        busy={migrating}
        onCancel={() => setSheet(false)}
        onConfirm={() => {
          void migrateToCloud();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerText: { fontFamily: FONT.semibold, fontSize: 14 },
  cta: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: { fontFamily: FONT.semibold, fontSize: 16 },
});
