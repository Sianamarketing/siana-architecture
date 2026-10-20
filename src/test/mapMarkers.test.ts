import { describe, expect, it } from "vitest";
import { buildProjectMarkerElement, buildTeardropMarkerElement } from "@/lib/mapMarkers";

/** Properties Mapbox GL writes itself. A custom marker must not set them. */
function assertMapboxOwnsPositioning(el: HTMLElement) {
  expect(el.style.position).toBe("");
  expect(el.style.transform).toBe("");
  expect(el.style.transition).toBe("");
  expect(el.style.cssText).not.toMatch(/all\s*:/);
}

describe("buildProjectMarkerElement", () => {
  it("leaves positioning to Mapbox and draws the dot on an inner node", () => {
    const el = buildProjectMarkerElement("Unité d'Habitation Berlin");
    assertMapboxOwnsPositioning(el);
    expect(el.style.width).toBe("11px");
    expect(el.style.height).toBe("11px");

    const dot = el.firstElementChild as HTMLElement;
    expect(dot.style.backgroundColor).toBe("rgb(191, 58, 24)");
    expect(dot.style.transform).toBe("scale(1)");
    expect(dot.style.transition).toContain("transform");
    // The pulse animation stays on a descendant, not the marker root.
    const pulse = dot.firstElementChild as HTMLElement;
    expect(pulse.style.animation).toContain("siana-pulse");
    expect(el.style.animation).toBe("");
  });

  it("scales the inner dot when the project is selected", () => {
    const el = buildProjectMarkerElement("Unité d'Habitation Berlin", true);
    assertMapboxOwnsPositioning(el);
    expect((el.firstElementChild as HTMLElement).style.transform).toBe("scale(1.35)");
  });
});

describe("buildTeardropMarkerElement", () => {
  it("is a 18×26 box with no positioning of its own", () => {
    const el = buildTeardropMarkerElement();
    assertMapboxOwnsPositioning(el);
    expect(el.style.width).toBe("18px");
    expect(el.style.height).toBe("26px");
    expect(el.querySelector("svg")).not.toBeNull();
  });
});
