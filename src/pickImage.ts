import * as ImagePicker from 'expo-image-picker';

import { stickerizeUri } from './stickerize';

async function toSticker(uri: string) {
  const { uri: out } = await stickerizeUri(uri);
  return out;
}

export type MediaPickFailure = 'denied' | 'canceled';
export type MediaPickResult =
  | { ok: true; uri: string }
  | { ok: false; reason: MediaPickFailure };

/** Asset icon: stickerize subject. */
export async function pickAssetImage() {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.9,
    allowsEditing: false,
  });
  if (res.canceled || !res.assets[0]) return null;
  return toSticker(res.assets[0].uri);
}

export async function takeAssetPhoto() {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return null;
  const res = await ImagePicker.launchCameraAsync({
    quality: 0.9,
    allowsEditing: false,
  });
  if (res.canceled || !res.assets[0]) return null;
  return toSticker(res.assets[0].uri);
}

/** Bill / holdings screenshot for ingress — keep full frame, no stickerize. */
export async function pickIngressScreenshot(): Promise<MediaPickResult> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return { ok: false, reason: 'denied' };
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.9,
    allowsEditing: false,
  });
  if (res.canceled || !res.assets[0]) return { ok: false, reason: 'canceled' };
  return { ok: true, uri: res.assets[0].uri };
}
