import { Redirect } from 'expo-router';

/** Safety net: never stay on the Add tab; open the form flow from tabPress instead. */
export default function AddTab() {
  return <Redirect href="/(tabs)" />;
}
