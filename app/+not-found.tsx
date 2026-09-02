import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { palettes } from '../src/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Text style={styles.title}>页面不存在</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>回到首页</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palettes.light.bg },
  title: { fontSize: 20, fontWeight: '800' },
  link: { marginTop: 16 },
  linkText: { fontSize: 15, fontWeight: '700', color: palettes.light.limeDark },
});
