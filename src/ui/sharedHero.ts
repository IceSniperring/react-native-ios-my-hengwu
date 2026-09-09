export type CardSourceFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
  imageKey?: string;
  imageUri?: string;
};

let source: CardSourceFrame | null = null;
let closeHandler: (() => Promise<void>) | null = null;

export function setHeroSource(frame: CardSourceFrame | null) {
  source = frame;
}

/** Keep the frame until the detail screen finishes its close zoom. */
export function peekHeroSource(): CardSourceFrame | null {
  return source;
}

export function clearHeroSource() {
  source = null;
}

export function setHeroCloseHandler(handler: (() => Promise<void>) | null) {
  closeHandler = handler;
}

/** Shrink back to the card, then the caller navigates away. */
export async function runHeroClose(): Promise<void> {
  const handler = closeHandler;
  if (handler) {
    await handler();
  }
  clearHeroSource();
}
