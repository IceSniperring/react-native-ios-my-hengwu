import {
  Archive,
  Banknote,
  Box,
  Calendar,
  CalendarClock,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Copy,
  FileText,
  Heart,
  Image,
  LayoutGrid,
  Leaf,
  ListTree,
  LocateFixed,
  Moon,
  Package,
  Pencil,
  PieChart,
  Pin,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Tag,
  Trash2,
  User,
  X,
  type LucideIcon,
} from 'lucide-react-native';

export type AppIconName = string;

/** SF Symbol / legacy names → Lucide components. */
const ICONS: Record<string, LucideIcon> = {
  xmark: X,
  close: X,
  checkmark: Check,
  check: Check,
  plus: Plus,
  add: Plus,
  trash: Trash2,
  'trash.fill': Trash2,
  heart: Heart,
  'heart.fill': Heart,
  'moon.fill': Moon,
  moon: Moon,
  leaf: Leaf,
  calendar: Calendar,
  'calendar.clear': Calendar,
  'calendar.badge.clock': CalendarClock,
  'square.grid.2x2': LayoutGrid,
  'square.grid.2x2.fill': LayoutGrid,
  grid: LayoutGrid,
  tag: Tag,
  'tag.fill': Tag,
  'arrow.counterclockwise': RotateCcw,
  'arrow.clockwise': RefreshCw,
  'arrow.triangle.2.circlepath': RefreshCw,
  refresh: RefreshCw,
  'chevron.right': ChevronRight,
  'chevron.left': ChevronLeft,
  magnifyingglass: Search,
  search: Search,
  pencil: Pencil,
  'pencil.fill': Pencil,
  camera: Camera,
  photo: Image,
  images: Image,
  scope: LocateFixed,
  locate: LocateFixed,
  'yensign.circle': CircleDollarSign,
  'yensign.circle.fill': Banknote,
  banknote: Banknote,
  'point.3.connected.trianglepath.dotted': ListTree,
  cube: Box,
  'cube.fill': Box,
  box: Box,
  shippingbox: Package,
  package: Package,
  archivebox: Archive,
  'archivebox.fill': Archive,
  archive: Archive,
  person: User,
  'person.fill': User,
  user: User,
  'chart.pie': PieChart,
  'chart.pie.fill': PieChart,
  'pie-chart': PieChart,
  'doc.on.doc': Copy,
  copy: Copy,
  'checkmark.square': FileText,
  pin: Pin,
  'pin.fill': Pin,
};

function resolveLucide(name: string): LucideIcon {
  if (ICONS[name]) return ICONS[name];
  // Allow direct Lucide export names in kebab or Pascal form, e.g. "trash-2" → Trash2
  const pascal = name
    .split(/[-_\s.]+/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
  const found = Object.entries(ICONS).find(
    ([, Comp]) => Comp.displayName === pascal || Comp.name === pascal,
  );
  if (found) return found[1];
  return Box;
}

/** Cross-platform icon — Lucide (lucide-react-native). */
export function PlatformIcon({
  name,
  size,
  color,
  strokeWidth,
}: {
  name: AppIconName | string;
  size: number;
  color: string;
  strokeWidth?: number;
}) {
  const Icon = resolveLucide(String(name));
  return <Icon size={size} color={color} strokeWidth={strokeWidth ?? 2.2} />;
}
