import { describe, expect, it } from "vitest";
import { selectRecentSlides } from "@/lib/recentBuildings";

const exterior = (path: string, extra: Record<string, unknown> = {}) => ({
  storage_path: path,
  is_hero: true,
  position: 1,
  author: "Gunnar Klack",
  license: "CC BY-SA 4.0",
  kind: "exterior",
  alt: "Exterior",
  ...extra,
});

describe("selectRecentSlides", () => {
  it("takes the five newest entries and breaks a shared timestamp by slug", () => {
    const projects = ["f", "a", "c", "b", "e", "d"].map((slug) => ({
      slug,
      name: slug.toUpperCase(),
      created_at: "2026-10-20T10:13:34Z",
      images: [exterior(`/buildings/${slug}/01.jpg`)],
    }));
    projects.push({
      slug: "older",
      name: "Older",
      created_at: "2026-06-01T00:00:00Z",
      images: [exterior("/buildings/older/01.jpg")],
    });
    expect(selectRecentSlides(projects).map((slide) => slide.slug)).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("skips banned interiors and photographs without a credit", () => {
    const slides = selectRecentSlides([
      {
        slug: "icc-berlin",
        name: "ICC Berlin",
        created_at: "2026-10-20T10:13:34Z",
        images: [
          exterior("/buildings/icc-berlin/07-car-tunnel.jpg", { is_hero: true, position: 1 }),
          exterior("/buildings/icc-berlin/01-from-funkturm.jpg", { is_hero: false, position: 2, author: "Kasa Fue" }),
        ],
      },
      {
        slug: "no-credit",
        name: "No credit",
        created_at: "2026-10-21T00:00:00Z",
        images: [exterior("/buildings/no-credit/01.jpg", { author: "", license: "" })],
      },
    ]);
    expect(slides.map((slide) => slide.src)).toEqual(["/buildings/icc-berlin/01-from-funkturm.jpg"]);
  });
});
