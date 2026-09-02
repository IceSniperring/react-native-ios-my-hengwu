import * as ImagePicker from 'expo-image-picker';

export async function pickAssetImage() {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1],
  });
  if (res.canceled || !res.assets[0]) return null;
  return res.assets[0].uri;
}

export async function takeAssetPhoto() {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return null;
  const res = await ImagePicker.launchCameraAsync({
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1],
  });
  if (res.canceled || !res.assets[0]) return null;
  return res.assets[0].uri;
}
