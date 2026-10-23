import { describe, expect, it } from "vitest";
import { clampScale, scaleFromWheel, sheetSwipe, stepScale, toggleDoubleZoom, zoomAt, ZOOM_MAX, ZOOM_MIN } from "@/lib/planZoom";

const stage = { width: 400, height: 600 };
const image = { width: 300, height: 480 };

describe("plan zoom", () => {
  it("stays inside 1x and 6x", () => {
    expect(clampScale(0.2)).toBe(ZOOM_MIN);
    expect(clampScale(8)).toBe(ZOOM_MAX);
    expect(stepScale(ZOOM_MAX, 1)).toBe(ZOOM_MAX);
    expect(stepScale(ZOOM_MIN, -1)).toBe(ZOOM_MIN);
  });

  it("zooms toward the cursor and keeps that point still", () => {
    const point = { x: 280, y: 180 };
    const next = zoomAt({ scale: 1, x: 0, y: 0 }, stage, point, 2, image);
    expect(next.scale).toBe(2);
    const before = { x: point.x - stage.width / 2, y: point.y - stage.height / 2 };
    const after = { x: (point.x - (stage.width / 2 + next.x)) / next.scale, y: (point.y - (stage.height / 2 + next.y)) / next.scale };
    expect(after.x).toBeCloseTo(before.x);
    expect(after.y).toBeCloseTo(before.y);
  });

  it("toggles between 1x and 2.5x", () => {
    const zoomed = toggleDoubleZoom({ scale: 1, x: 0, y: 0 }, stage, { x: 200, y: 300 }, image);
    expect(zoomed.scale).toBe(2.5);
    const reset = toggleDoubleZoom(zoomed, stage, { x: 200, y: 300 }, image);
    expect(reset).toEqual({ scale: 1, x: 0, y: 0 });
  });

  it("zooms out when the wheel rolls down", () => {
    expect(scaleFromWheel(2, 100)).toBeLessThan(2);
    expect(scaleFromWheel(2, -100)).toBeGreaterThan(2);
  });

  it("changes sheets on a horizontal swipe only at 1x", () => {
    expect(sheetSwipe(-80, 10, 1)).toBe(1);
    expect(sheetSwipe(80, 10, 1)).toBe(-1);
    expect(sheetSwipe(-80, 10, 2.5)).toBe(0);
    expect(sheetSwipe(-10, 4, 1)).toBe(0);
    expect(sheetSwipe(-40, 80, 1)).toBe(0);
  });
});
