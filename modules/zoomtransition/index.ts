import { requireNativeModule } from 'expo';

type ZoomTransitionNative = {
  setSourceFrame(
    x: number,
    y: number,
    width: number,
    height: number,
    radius?: number,
  ): void;
  clearSourceFrame(): void;
};

let native: ZoomTransitionNative | null = null;

function getNative(): ZoomTransitionNative | null {
  if (native) return native;
  try {
    native = requireNativeModule('ZoomTransition') as ZoomTransitionNative;
  } catch {
    native = null;
  }
  return native;
}

/** Call before router.push so the next native transition zooms from this frame. */
export function setZoomSourceFrame(frame: {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
}): void {
  getNative()?.setSourceFrame(
    frame.x,
    frame.y,
    frame.width,
    frame.height,
    frame.radius ?? 18,
  );
}

export function clearZoomSourceFrame(): void {
  getNative()?.clearSourceFrame();
}

export function isZoomTransitionAvailable(): boolean {
  return getNative() != null;
}
