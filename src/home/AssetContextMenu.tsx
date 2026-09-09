import { MenuView } from '@expo/ui/community/menu';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Alert, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { todayISO } from '../calc';
import { useStore } from '../store';
import type { Asset } from '../types';

type Props = {
  asset: Asset;
  children: ReactNode;
  size?: number;
  style?: StyleProp<ViewStyle>;
  selectMode: boolean;
  onEnterSelect: (id: string) => void;
};

type ActionId =
  | 'edit'
  | 'duplicate'
  | 'select'
  | 'delete'
  | 'pin'
  | 'category'
  | 'tags'
  | 'retire'
  | 'activate';

/** Expo-native UIMenu (iOS). Icons are SF Symbols — what @expo/ui supports. */
function buildActions(asset: Asset, selectMode: boolean) {
  if (selectMode) {
    return [
      {
        id: 'sec-main',
        title: '',
        displayInline: true,
        subactions: [
          { id: 'edit', title: '编辑', image: 'pencil' as const },
          { id: 'duplicate', title: '复制', image: 'doc.on.doc' as const },
          {
            id: 'delete',
            title: '删除',
            image: 'trash' as const,
            attributes: { destructive: true },
          },
        ],
      },
    ];
  }

  const statusAction =
    asset.status === 'active'
      ? {
          id: 'retire' as const,
          title: '转为已退役',
          image: 'circle.fill' as const,
          imageColor: '#FFD60A',
        }
      : {
          id: 'activate' as const,
          title: '转为服役中',
          image: 'circle.fill' as const,
          imageColor: '#30D158',
        };

  return [
    {
      id: 'sec-main',
      title: '',
      displayInline: true,
      subactions: [
        { id: 'edit', title: '编辑', image: 'pencil' as const },
        { id: 'duplicate', title: '复制', image: 'doc.on.doc' as const },
        { id: 'select', title: '选择', image: 'checkmark.square' as const },
        {
          id: 'delete',
          title: '删除',
          image: 'trash' as const,
          attributes: { destructive: true },
        },
      ],
    },
    {
      id: 'sec-organize',
      title: '',
      displayInline: true,
      subactions: [
        {
          id: 'pin',
          title: asset.starred ? '取消置顶' : '置顶',
          image: 'pin' as const,
        },
        { id: 'category', title: '分类', image: 'square.grid.2x2' as const },
        { id: 'tags', title: '标签', image: 'tag' as const },
      ],
    },
    {
      id: 'sec-status',
      title: '',
      displayInline: true,
      subactions: [statusAction],
    },
  ];
}

function runAction(asset: Asset, actionId: string, onEnterSelect: (id: string) => void) {
  const action = actionId as ActionId;
  const {
    updateAsset,
    removeAsset,
    addAsset,
    beginCategoryPicker,
    beginTagPicker,
    setMenuPickerAssetId,
  } = useStore.getState();

  switch (action) {
    case 'edit':
      router.push({ pathname: '/asset/form', params: { id: asset.id } });
      break;
    case 'duplicate': {
      const { id: _omit, ...rest } = asset;
      addAsset({
        ...rest,
        name: `${asset.name} 副本`,
        tags: [...(asset.tags ?? [])],
      });
      break;
    }
    case 'select':
      onEnterSelect(asset.id);
      break;
    case 'delete':
      Alert.alert('删除资产', `删除「${asset.name}」后无法恢复。`, [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => removeAsset(asset.id),
        },
      ]);
      break;
    case 'pin':
      updateAsset(asset.id, { starred: !asset.starred });
      break;
    case 'category':
      setMenuPickerAssetId(asset.id);
      beginCategoryPicker(asset.category);
      router.push('/pick/category');
      break;
    case 'tags':
      setMenuPickerAssetId(asset.id);
      beginTagPicker(asset.tags ?? []);
      router.push('/pick/tags');
      break;
    case 'retire':
      updateAsset(asset.id, { status: 'retired', retiredDate: todayISO() });
      break;
    case 'activate':
      updateAsset(asset.id, { status: 'active', retiredDate: undefined });
      break;
  }
}

export function AssetContextMenu({
  asset,
  children,
  size,
  style,
  selectMode,
  onEnterSelect,
}: Props) {
  return (
    <View style={[size ? { width: size, height: size } : styles.fill, style]}>
      <MenuView
        style={StyleSheet.absoluteFill}
        shouldOpenOnLongPress
        actions={buildActions(asset, selectMode)}
        onPressAction={({ nativeEvent }) => runAction(asset, nativeEvent.event, onEnterSelect)}>
        {children}
      </MenuView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
});
