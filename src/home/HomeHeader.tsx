import { Text, View } from 'react-native';
import {
  type SharedValue,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { useCollapseProgress } from 'react-native-collapsible-tab';

import { OverviewCard } from '../components/OverviewCard';
import { useColors } from '../useColors';
import { styles } from './homeStyles';

type Overview = {
  total: number;
  daily: number;
  active: number;
  retired: number;
  sold: number;
};

/** Copies collapse progress out so the pinned chrome can fade the compact title. */
function CollapseBridge({ target }: { target: SharedValue<number> }) {
  const progress = useCollapseProgress();
  useAnimatedReaction(
    () => progress.value,
    (value) => {
      target.value = value;
    },
  );
  return null;
}

export function HomeHeader({
  overview,
  collapseProgress,
}: {
  overview: Overview;
  collapseProgress: SharedValue<number>;
}) {
  const c = useColors();

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 4, backgroundColor: c.bg }}>
      <CollapseBridge target={collapseProgress} />
      <Text style={[styles.brand, { color: c.text }]}>有数</Text>
      <View style={{ paddingTop: 12 }}>
        <OverviewCard
          total={overview.total}
          daily={overview.daily}
          active={overview.active}
          retired={overview.retired}
          sold={overview.sold}
        />
      </View>
      <View style={{ height: 14 }} />
    </View>
  );
}
