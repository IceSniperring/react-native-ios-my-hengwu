import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'hengwu-cloud-migrated-v1';

export async function readMigratedFlag(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === '1';
  } catch {
    return false;
  }
}

export async function writeMigratedFlag(v: boolean) {
  try {
    if (v) await AsyncStorage.setItem(KEY, '1');
    else await AsyncStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
