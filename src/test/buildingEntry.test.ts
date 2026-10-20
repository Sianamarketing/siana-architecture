import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildingContentHtml } from "../../scripts/buildingPrerender.mjs";
import {
  buildStatRows,
  collectImages,
  glanceItems,
  groupLinks,
  heroMeta,
  parseFacts,
  parseWhy,
  posterGraphic,
  resolveMediaUrl,
  splitProse,
  type BuildingGraphic,
  type BuildingLink,
} from "@/lib/buildingEntry";

const seedSql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20261020140100_seed_maeusebunker.sql"),
  "utf8",
);

describe("Mäusebunker seed", () => {
  it("places the pin on the published coordinates", () => {
    expect(seedSql).toContain("/buildings/maeusebunker/menu/the-shape.png");
    expect(seedSql).toContain("52.436778");
    expect(seedSql).toContain("13.317075");
  });

  it("records the construction halt as autumn 1975 and an idle site from 1976 to 1978", () => {
    expect(seedSql.toLowerCase()).toContain("autumn 1975");
    expect(seedSql).toContain("1976 to 1978");
    expect(seedSql).not.toContain("1976-01-01 to 1977-12-31");
    expect(seedSql.toLowerCase()).not.toContain("stopped 1976");
  });
});

describe("building entry helpers", () => {
  it("composes the construction row from the corrected stop", () => {
    const rows = buildStatRows({
      construction_start: { value: 1971, source: "https://example.com/start" },
      construction_stop: { value: "Stopped in autumn 1975; the site stood idle from 1976 to 1978" },
      completion: { value: "February 1982", year: 1982, note: "Opened 27 February 1982." },
      length_m: { value: 117.35 },
      width_m: { value: 37.5 },
      height_m: { value: 23.7 },
      wall_inclination_deg: { value: 18.5 },
      floor_area_m2: { value: 6202.14 },
      engineers: { value: null, note: "Ing.-Büro Krauss (comparison calculation, 1967/68)." },
      awards: { value: null, note: "None found" },
    });
    expect(rows.find((row) => row.label === "Construction")?.value).toBe(
      "1971 to 1982. Stopped in autumn 1975; the site stood idle from 1976 to 1978",
    );
    expect(rows.find((row) => row.label === "Completion")?.value).toBe("February 1982");
    expect(rows.find((row) => row.label === "Size")?.value).toContain("117.35 m long");
    expect(rows.find((row) => row.label === "Size")?.value).toContain("18.5°");
    expect(rows.find((row) => row.label === "Floor area")?.value).toBe("6,202 m²");
    expect(rows.find((row) => row.label === "Engineers")?.value).toMatch(/^Not established\./);
    expect(rows.find((row) => row.label === "Awards")).toBeUndefined();
  });

  it("falls back to the columns an older project already has", () => {
    const rows = buildStatRows({}, {
      architect: "Álvaro Siza",
      year_completed: 1999,
      style: "Contemporary",
      address: "Porto",
    });
    expect(rows.map((row) => row.label)).toEqual(["Architect", "Year", "Style", "Address"]);
    expect(buildStatRows(null, {})).toEqual([]);
  });

  it("hides empty editorial blocks", () => {
    expect(parseFacts(null)).toEqual([]);
    expect(parseFacts(["  A tunnel.  ", "", 3])).toEqual(["A tunnel."]);
    expect(parseWhy(null).sections).toEqual([]);
    expect(parseWhy({ intro: "Sources.", sections: [] }).sections).toEqual([]);
    expect(parseWhy([{ heading: "Pipes", paragraphs: ["Blue."] }]).sections).toHaveLength(1);
  });

  it("groups further reading and keeps print books", () => {
    const links: BuildingLink[] = [
      { id: "1", category: "book", title: "A book", url: null, note: null, position: 0 },
      { id: "2", category: "heritage", title: "Listing", url: "https://example.com", note: null, position: 0 },
      { id: "3", category: "modellverfahren", title: "Study", url: "https://example.com/m", note: null, position: 0 },
    ];
    const groups = groupLinks(links);
    expect(groups.map((group) => group.category)).toEqual(["heritage", "modellverfahren", "book"]);
    expect(groups[2].items[0].url).toBeNull();
  });

  it("resolves hosted paths, absolute urls, and storage keys", () => {
    expect(resolveMediaUrl("/buildings/maeusebunker/01-sloped-flank.jpg")).toBe("/buildings/maeusebunker/01-sloped-flank.jpg");
    expect(resolveMediaUrl("https://upload.wikimedia.org/a.jpg")).toBe("https://upload.wikimedia.org/a.jpg");
    expect(resolveMediaUrl("maeusebunker/01.jpg", { supabaseUrl: "https://example.supabase.co/" })).toBe(
      "https://example.supabase.co/storage/v1/object/public/project-images/maeusebunker/01.jpg",
    );
    expect(resolveMediaUrl(null, { original: "https://fallback" })).toBe("https://fallback");
  });

  it("prefers credited images and keeps legacy projects on their hero", () => {
    const hosted = collectImages(
      [{
        id: "img",
        storage_path: "/buildings/maeusebunker/01-sloped-flank.jpg",
        source_url: "https://commons.wikimedia.org/wiki/File:Example",
        original_url: null,
        width: 1920,
        height: 1281,
        alt: "Flank",
        caption: "Flank",
        author: "Leonhard Lenz",
        license: "CC0",
        license_url: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
        position: 0,
        is_hero: true,
      }],
      { name: "Mäusebunker", hero_image_url: "https://picsum.photos/seed/old" },
    );
    expect(hosted).toHaveLength(1);
    expect(hosted[0].author).toBe("Leonhard Lenz");
    expect(hosted[0].url).toBe("/buildings/maeusebunker/01-sloped-flank.jpg");

    const legacy = collectImages([], {
      name: "Serralves",
      hero_image_url: "https://picsum.photos/hero",
      cover_image_url: "https://picsum.photos/hero",
      gallery: ["https://picsum.photos/two", { url: "https://picsum.photos/three", caption: "Court" }],
    });
    expect(legacy.map((image) => image.url)).toEqual([
      "https://picsum.photos/hero",
      "https://picsum.photos/two",
      "https://picsum.photos/three",
    ]);
    expect(legacy[0].author).toBeNull();
    expect(legacy[2].caption).toBe("Court");
  });

  it("finds the downloadable poster and leaves diagrams inline", () => {
    const graphics: BuildingGraphic[] = [
      { id: "d", slug: "the-shape", kind: "diagram", storagePath: "/a.png", svgPath: "/a.svg", alt: null, caption: null, downloadable: false, downloadPath: null, downloadLabel: null },
      { id: "p", slug: "poster", kind: "poster", storagePath: "/poster.png", svgPath: null, alt: "Poster", caption: null, downloadable: true, downloadPath: "/poster.pdf", downloadLabel: "PDF" },
    ];
    expect(posterGraphic(graphics)?.downloadPath).toBe("/poster.pdf");
  });

  it("keeps the glance strip to six short facts", () => {
    const items = glanceItems(
      {
        architects: { value: ["Gerd Hänska (1927–1996)", "Magdalena Hänska (1924–1986)"] },
        construction_start: { value: 1971 },
        completion: { year: 1982, value: "February 1982" },
        length_m: { value: 117.35 },
        height_m: { value: 23.7 },
        heritage_status: { value: "Baudenkmal (listed monument), Obj.-Dok.-Nr. 09070102" },
        year_listed: { value: 2023 },
        condition: { value: "Vacant" },
        style: { value: "Brutalist" },
      },
      { architect: "Gerd Hänska, Magdalena Hänska, with Kurt Schmersow", year_completed: 1981 },
    );
    expect(items.map((item) => item.label)).toEqual(["Architect", "Years", "Length", "Height", "Heritage", "Condition"]);
    expect(items[0].value).toBe("Gerd Hänska, Magdalena Hänska, with Kurt Schmersow");
    expect(items[1].value).toBe("1971–1982");
    expect(items[2].value).toBe("117 m");
    expect(items[3].value).toBe("23.7 m");
    expect(items[4].value).toBe("Baudenkmal, 2023");
    expect(items).toHaveLength(6);
  });

  it("falls back to a short glance when a building has no stats sheet", () => {
    expect(glanceItems({}, { architect: "Álvaro Siza", year_completed: 1999, style: "Contemporary", category: "Museum" }).map((item) => item.label)).toEqual([
      "Architect",
      "Years",
      "Style",
      "Category",
    ]);
    expect(glanceItems(null, {})).toEqual([]);
  });

  it("splits a long story after the first paragraph", () => {
    expect(splitProse("First.\n\nSecond.\n\nThird.")).toEqual({ lead: "First.", rest: "Second.\n\nThird.", html: false });
    expect(splitProse("<p>Only</p>").rest).toBe("");
    expect(splitProse("<p>One</p><p>Two</p>").rest).toContain("Two");
    expect(splitProse("")).toEqual({ lead: "", rest: "", html: false });
  });

  it("prerenders the full entry, including the sections the page collapses", () => {
    const html = buildingContentHtml(
      {
        name: "Mäusebunker",
        tagline: "Zentrale Tierlaboratorien",
        architect: "Gerd Hänska",
        year_completed: 1982,
        tldr: "A sealed concrete lab.",
        siana_pick: "Walk the canal path.",
        description: "First paragraph.\n\nSecond paragraph.",
        analysis: "<p>The analysis.</p>",
        curious_facts: ["The nickname stuck."],
        why_section: { intro: "The brief shows.", sections: [{ heading: "The blue pipes", paragraphs: ["Ninety-four intakes."] }] },
        stats: { construction_stop: { value: "Stopped in autumn 1975" }, events: [{ value: "1982: opening" }] },
      },
      {
        images: [{ caption: "Flank", author: "Leonhard Lenz", license: "CC0", source_url: "https://commons.wikimedia.org/wiki/File:Example" }],
        links: [{ title: "Denkmaldatenbank", url: "https://example.com/denkmal" }],
        graphics: [{ kind: "diagram", caption: "The cross-section" }, { kind: "poster", caption: "Field guide" }],
      },
    );
    expect(html).toContain("A sealed concrete lab.");
    expect(html).toContain("Second paragraph.");
    expect(html).toContain("The analysis.");
    expect(html).toContain("The blue pipes");
    expect(html).toContain("Stopped in autumn 1975");
    expect(html).toContain("Leonhard Lenz");
    expect(html).toContain("Denkmaldatenbank");
    expect(html).toContain("Field guide");
  });

  it("builds the hero line from the construction span", () => {
    expect(heroMeta(
      { architect: "Gerd Hänska", year_completed: 1981, style: "Brutalist" },
      { construction_start: { value: 1971 }, completion: { value: "February 1982", year: 1982 } },
    )).toBe("Gerd Hänska · 1971–1982 · Brutalist");
  });
});
