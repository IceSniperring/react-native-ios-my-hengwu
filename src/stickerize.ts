/**
 * Subject-lift sticker pipeline (iOS Vision via local Expo module).
 * Falls back to the original URI in Expo Go / simulator / unsupported devices.
 */
export type StickerizeOutcome = {
  uri: string;
  didLiftSubject: boolean;
};

export async function stickerizeUri(inputUri: string): Promise<StickerizeOutcome> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('stickerizer') as {
      stickerize?: (uri: string) => Promise<{ uri: string; didLiftSubject: boolean }>;
      default?: {
        stickerize: (uri: string) => Promise<{ uri: string; didLiftSubject: boolean }>;
      };
    };
    const fn = mod.stickerize ?? mod.default?.stickerize;
    if (!fn) return { uri: inputUri, didLiftSubject: false };
    const res = await fn(inputUri);
    return { uri: res.uri, didLiftSubject: Boolean(res.didLiftSubject) };
  } catch {
    return { uri: inputUri, didLiftSubject: false };
  }
}
