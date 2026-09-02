import { palettes, type Palette } from './theme';
import { useStore } from './store';

export function useColors(): Palette {
  const scheme = useStore((s) => s.colorScheme);
  return palettes[scheme];
}
