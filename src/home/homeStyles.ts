import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  topChrome: {
    zIndex: 20,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  topRow: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  titlePress: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  compactTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
    zIndex: 1,
  },
  brand: { fontSize: 34, fontWeight: '800', letterSpacing: 0.5 },
  body: { flex: 1, overflow: 'hidden' },
  pagerFrame: { flex: 1, overflow: 'hidden' },
  chrome: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  stickyBlock: { paddingBottom: 4 },
  empty: { paddingVertical: 48, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySub: { marginTop: 6, fontSize: 13 },
});
