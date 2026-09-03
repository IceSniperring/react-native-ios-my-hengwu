import * as ImagePicker from 'expo-image-picker';

import { stickerizeUri } from './stickerize';

async function toSticker(uri: string) {
  const { uri: out } = await stickerizeUri(uri);
  return out;
}

export async function pickAssetImage() {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  // No square crop — full frame helps Vision find the subject.
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
