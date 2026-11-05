import { describe, expect, it } from "vitest";
import { buildPlanSheets } from "@/lib/planSet";
import { graphicsFromRows, parseWhy } from "@/lib/buildingEntry";
import {
  discoverContentHtml,
  discoverTilesForProjects,
  filterDiscoverTiles,
  firstScreenTiles,
  mixDiscoverTiles,
  sortDiscoverProjects,
  type DiscoverGraphicRow,
  type DiscoverProject,
  type DiscoverTile,
} from "@/lib/discoverFeed";

function project(partial: Partial<DiscoverProject> & Pick<DiscoverProject, "id" | "slug" | "name">): DiscoverProject {
  return {
    style: null,
    year_completed: null,
    featured: false,
    updated_at: "2026-01-01",
    hero_image_url: null,
    cover_image_url: null,
    why_section: null,
    city: null,
    ...partial,
  };
}

describe("discover feed", () => {
  it("puts featured buildings ahead of newer ones", () => {
    const ordered = sortDiscoverProjects([
      project({ id: "new", slug: "new", name: "New", updated_at: "2026-08-01" }),
      project({ id: "star", slug: "star", name: "Star", featured: true, updated_at: "2020-01-01" }),
      project({ id: "old", slug: "old", name: "Old", updated_at: "2019-01-01" }),
    ]);
    expect(ordered.map((item) => item.slug)).toEqual(["star", "new", "old"]);
  });

  it("mixes buildings before it repeats one building's photos", () => {
    const tile = (id: string, kind: DiscoverTile["kind"]): DiscoverTile => ({
      id, kind, href: "/", image: null, alt: id, title: id, caption: null, meta: null, kicker: null,
      buildingName: id, city: null, citySlug: null, style: null, width: null, height: null,
    });
    const mixed = mixDiscoverTiles([
      [tile("a-building", "building"), tile("a-photo", "photo")],
      [tile("b-building", "building"), tile("b-photo", "photo")],
    ]);
    expect(mixed.map((item) => item.id)).toEqual(["a-building", "b-building", "a-photo", "b-photo"]);
  });

  it("numbers sheets the same way the plan set does", () => {
    const graphics: DiscoverGraphicRow[] = [
      { id: "shape", project_id: "p", slug: "the-shape", kind: "diagram", card_path: "/menu/the-shape.png", storage_path: "/diagrams/the-shape.png", caption: "Walls", position: 2 },
      { id: "floors", project_id: "p", slug: "floors-alternate", kind: "diagram", card_path: "/menu/floors.png", caption: "Floors", position: 1 },
      { id: "poster", project_id: "p", slug: "poster", kind: "poster", storage_path: "/poster.png", downloadable: true, download_path: "/poster.pdf", position: 0 },
    ];
    const why = {
      sections: [
        { heading: "Technical floors between the lab floors", graphic_slug: "floors-alternate", paragraphs: ["Technical floors."] },
        { heading: "The 18.5° walls", graphic_slug: "the-shape", paragraphs: ["The walls tilt."] },
      ],
    };
    const tiles = discoverTilesForProjects([
      project({ id: "p", slug: "maeusebunker", name: "Mäusebunker", why_section: why, hero_image_url: "/hero.jpg", city: { name: "Berlin", slug: "berlin" } }),
    ], [], graphics);
    const sheets = tiles.filter((tile) => tile.kind === "sheet");
    const expected = buildPlanSheets(
      graphicsFromRows(graphics.map((row) => ({
        id: row.id,
        slug: row.slug ?? null,
        kind: row.kind ?? null,
        storage_path: row.storage_path ?? null,
        svg_path: row.svg_path ?? null,
        alt: row.alt ?? null,
        caption: row.caption ?? null,
        downloadable: Boolean(row.downloadable),
        download_path: row.download_path ?? null,
        download_label: null,
        card_path: row.card_path ?? null,
        position: row.position ?? 0,
      }))),
      parseWhy(why).sections,
    );
    expect(sheets.map((tile) => `${tile.kicker} ${tile.title}`)).toEqual(expected.map((sheet) => `${sheet.code} ${sheet.title}`));
    expect(sheets[0].href).toBe("/projects/maeusebunker#sheet-a01");
    expect(sheets[0].image).toBe("/poster.png");
    expect(sheets[1].image).toBe("/menu/floors.png");
    expect(sheets[1].href).toBe("/projects/maeusebunker#sheet-a02");
  });

  it("opens the feed with a building, a photo and a sheet", () => {
    const tiles = discoverTilesForProjects([
      project({ id: "a", slug: "one", name: "One", hero_image_url: "/a.jpg" }),
      project({ id: "b", slug: "two", name: "Two", hero_image_url: "/b.jpg" }),
      project({ id: "c", slug: "three", name: "Three", hero_image_url: "/c.jpg" }),
    ], [
      { id: "pa", project_id: "a", storage_path: "/a-hall.jpg", alt: "Hall", caption: "Hall", position: 1 },
      { id: "pb", project_id: "b", storage_path: "/b-hall.jpg", alt: "Court", caption: "Court", position: 1 },
      { id: "pc", project_id: "c", storage_path: "/c-hall.jpg", alt: "Yard", caption: "Yard", position: 1 },
    ], [
      { id: "ga", project_id: "a", slug: "piers", kind: "diagram", card_path: "/menu/piers.png", caption: "Piers", position: 0 },
      { id: "gb", project_id: "b", slug: "legs", kind: "diagram", card_path: "/menu/legs.png", caption: "Legs", position: 0 },
      { id: "gc", project_id: "c", slug: "grid", kind: "diagram", card_path: "/menu/grid.png", caption: "Grid", position: 0 },
    ]);
    expect(tiles.slice(0, 3).map((tile) => tile.kind)).toEqual(["building", "photo", "sheet"]);
  });

  it("keeps the hero off the photo row and filters by kind", () => {
    const tiles = discoverTilesForProjects([
      project({ id: "p", slug: "icc-berlin", name: "ICC Berlin", hero_image_url: "/hero.jpg", style: "High-tech", city: { name: "Berlin", slug: "berlin" } }),
    ], [
      { id: "img-hero", project_id: "p", storage_path: "/hero.jpg", alt: "The hull", caption: "The hull", position: 0 },
      { id: "img-hall", project_id: "p", storage_path: "/hall.jpg", alt: "Hall interior", caption: "Inside the hall", position: 1 },
    ], []);
    expect(tiles.find((tile) => tile.kind === "building")?.image).toBe("/hero.jpg");
    expect(tiles.filter((tile) => tile.kind === "photo").map((tile) => tile.image)).toEqual(["/hall.jpg"]);
    expect(filterDiscoverTiles(tiles, { kind: "photo" })).toHaveLength(1);
    expect(filterDiscoverTiles(tiles, { kind: "building", style: "Brutalism" })).toHaveLength(0);
  });

  it("writes the first screen as links, without a dash used as a pause", () => {
    const tiles = firstScreenTiles([
      project({ id: "b", slug: "bierpinsel", name: "Bierpinsel", featured: false, updated_at: "2026-02-01", hero_image_url: "/b.jpg" }),
      project({ id: "a", slug: "icc-berlin", name: "ICC Berlin", featured: true, updated_at: "2020-01-01", hero_image_url: "/a.jpg", city: { name: "Berlin", slug: "berlin" }, style: "High-tech", year_completed: 1979 }),
    ], [], []);
    const html = discoverContentHtml(tiles);
    expect(html.startsWith("<h1>Discover</h1>")).toBe(true);
    expect(html.indexOf("ICC Berlin")).toBeLessThan(html.indexOf("Bierpinsel"));
    expect(html).toContain('href="/projects/icc-berlin"');
    expect(html).toContain("Berlin · High-tech · 1979");
    expect(html).not.toContain("—");
  });
});