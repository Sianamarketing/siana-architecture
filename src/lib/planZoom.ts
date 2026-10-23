/** Zoom limits for a plan sheet. 1× fits the sheet; 6× is enough to read the small type. */
export const ZOOM_MIN = 1;
export const ZOOM_MAX = 6;
export const ZOOM_DOUBLE = 2.5;

export interface ZoomFrame {
  scale: number;
  x: number;
  y: number;
}

export interface Box {
  width: number;
  height: number;
}

export function clampScale(scale: number): number {
  if (!Number.isFinite(scale)) return ZOOM_MIN;
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, scale));
}

/** Keep a zoomed sheet from sliding entirely out of the stage. At 1× it stays centered. */
export function clampPan(frame: ZoomFrame, stage: Box, image: Box): ZoomFrame {
  const scale = clampScale(frame.scale);
  if (scale <= 1) return { scale: ZOOM_MIN, x: 0, y: 0 };
  const maxX = Math.max(0, (image.width * scale - stage.width) / 2);
  const maxY = Math.max(0, (image.height * scale - stage.height) / 2);
  return {
    scale,
    x: Math.min(maxX, Math.max(-maxX, frame.x)),
    y: Math.min(maxY, Math.max(-maxY, frame.y)),
  };
}

/**
 * Scale toward a point in stage coordinates. The sheet is centered, then
 * translated by (x, y) and scaled from its center.
 */
export function zoomAt(frame: ZoomFrame, stage: Box, point: { x: number; y: number }, nextScale: number, image: Box): ZoomFrame {
  const scale = clampScale(nextScale);
  const safe = frame.scale > 0 ? frame.scale : 1;
  const cx = stage.width / 2 + frame.x;
  const cy = stage.height / 2 + frame.y;
  const ix = (point.x - cx) / safe;
  const iy = (point.y - cy) / safe;
  return clampPan(
    {
      scale,
      x: point.x - ix * scale - stage.width / 2,
      y: point.y - iy * scale - stage.height / 2,
    },
    stage,
    image,
  );
}

export function toggleDoubleZoom(frame: ZoomFrame, stage: Box, point: { x: number; y: number }, image: Box): ZoomFrame {
  if (frame.scale > 1.01) return { scale: ZOOM_MIN, x: 0, y: 0 };
  return zoomAt(frame, stage, point, ZOOM_DOUBLE, image);
}

/** One wheel notch is a modest step. The sign follows the platform deltaY (down zooms out). */
export function scaleFromWheel(scale: number, deltaY: number): number {
  if (!Number.isFinite(deltaY) || deltaY === 0) return clampScale(scale);
  return clampScale(scale * Math.exp(-deltaY * 0.0015));
}

export function stepScale(scale: number, direction: 1 | -1): number {
  const factor = direction > 0 ? 1.25 : 1 / 1.25;
  return clampScale(scale * factor);
}

/** At 1× a horizontal swipe changes sheets. While zoomed, the same gesture pans. */
export function sheetSwipe(dx: number, dy: number, scale: number): -1 | 0 | 1 {
  if (scale > 1.01) return 0;
  if (Math.abs(dx) < 48 || Math.abs(dx) <= Math.abs(dy)) return 0;
  return dx < 0 ? 1 : -1;
}
