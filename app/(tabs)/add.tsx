import { Redirect } from 'expo-router';

/** Safety net: never stay on the Add tab; open ingress (or wish form) from tabPress instead. */
export default function AddTab() {
  return <Redirect href="/ingress" />;
}
