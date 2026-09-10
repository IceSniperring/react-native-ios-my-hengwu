import AsyncStorage from '@react-native-async-storage/async-storage';

function key(userId: string) {
  return `hengwu-cloud-migrated:${userId}`;
}

export async function getMigratedFlag(userId: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const v = await AsyncStorage.getItem(key(userId));
  return v === '1';
}

export async function setMigratedFlag(userId: string, value: boolean): Promise<void> {
  if (typeof window === 'undefined') return;
  if (value) await AsyncStorage.setItem(key(userId), '1');
  else await AsyncStorage.removeItem(key(userId));
}
