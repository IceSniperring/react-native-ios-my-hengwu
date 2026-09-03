import { NativeModule, requireNativeModule } from 'expo';

import type { StickerizeResult } from './Stickerizer.types';

declare class StickerizerModuleType extends NativeModule {
  stickerize(inputUri: string): Promise<StickerizeResult>;
}

let native: StickerizerModuleType | null = null;
try {
  native = requireNativeModule<StickerizerModuleType>('Stickerizer');
} catch {
  native = null;
}

export async function stickerize(inputUri: string): Promise<StickerizeResult> {
  if (!native) {
    return { uri: inputUri, didLiftSubject: false, contentType: 'image/jpeg' };
  }
  return native.stickerize(inputUri);
}

export function isStickerizerAvailable(): boolean {
  return native != null;
}

export default { stickerize, isStickerizerAvailable };
