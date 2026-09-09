import { requireNativeModule } from 'expo';
import type { NativeModule } from 'expo';

export type ContextMenuItem = {
  id: string;
  title: string;
  /** Bundled icon name in ContextMenuKit/Icons (e.g. "edit"). */
  iconName?: string;
  /** Optional file/http URI fallback. */
  imageUri?: string;
  destructive?: boolean;
};

export type ContextMenuSection = ContextMenuItem[];

type SelectPayload = { id: string; viewTag: number };

type ContextMenuKitNative = NativeModule & {
  attachMenu(viewTag: number, sections: ContextMenuSection[]): Promise<void>;
  detachMenu(viewTag: number): Promise<void>;
  addListener(eventName: 'onSelect', listener: (e: SelectPayload) => void): { remove(): void };
};

let native: ContextMenuKitNative | null = null;

function getNative(): ContextMenuKitNative | null {
  if (native) return native;
  try {
    native = requireNativeModule('ContextMenuKit') as ContextMenuKitNative;
  } catch {
    native = null;
  }
  return native;
}

export function isContextMenuKitAvailable(): boolean {
  return getNative() != null;
}

/** Attach native long-press UIMenu to the view with this react tag. */
export async function attachContextMenu(
  viewTag: number,
  sections: ContextMenuSection[],
): Promise<void> {
  const mod = getNative();
  if (!mod || viewTag <= 0) return;
  await mod.attachMenu(viewTag, sections);
}

export async function detachContextMenu(viewTag: number): Promise<void> {
  const mod = getNative();
  if (!mod || viewTag <= 0) return;
  await mod.detachMenu(viewTag);
}

export function addContextMenuSelectListener(
  handler: (payload: SelectPayload) => void,
): () => void {
  const mod = getNative();
  if (!mod) return () => {};
  const sub = mod.addListener('onSelect', handler);
  return () => sub.remove();
}
