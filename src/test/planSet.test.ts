import { describe, expect, it } from "vitest";
import { buildingContentHtml } from "../../scripts/buildingPrerender.mjs";
import type { BuildingGraphic, WhyBlock } from "@/lib/buildingEntry";
import { buildPlanSheets, sheetIndexFromHash } from "@/lib/planSet";

const sections: WhyBlock[] = [
  { heading: "Plant floors between the lab floors", paragraphs: ["Plant floors sit between the labs."], graphicSlug: "floors-alternate" },
  { heading: "The 18.5° walls", paragraphs: ["Every long wall tilts in at 18.5°."], graphicSlug: "the-shape" },
];

function graphic(partial: Partial<BuildingGraphic> & Pick<BuildingGraphic, "id">): BuildingGraphic {
  return {
    slug: null,
    kind: "diagram",
    storagePath: null,
    svgPath: null,
    alt: null,
    caption: null,
    downloadable: false,
    downloadPath: null,
    downloadLabel: null,
    cardPath: null,
    ...partial,
  };
}

describe("plan set", () => {
  it("orders drawings by the why section, then files the poster last", () => {
    const sheets = buildPlanSheets(
      [
        graphic({ id: "shape", slug: "the-shape", cardPath: "/menu/the-shape.png", storagePath: "/diagrams/the-shape.png" }),
        graphic({ id: "floors", slug: "floors-alternate", cardPath: "/menu/floors.png" }),
        graphic({ id: "poster", slug: "poster", kind: "poster", storagePath: "/poster.png", downloadable: true, downloadPath: "/poster.pdf", downloadLabel: "poster.pdf", caption: "One sheet." }),
      ],
      sections,
    );
    expect(sheets.map((sheet) => sheet.code)).toEqual(["A-01", "A-02", "A-03"]);
    expect(sheets.map((sheet) => sheet.id)).toEqual(["sheet-a01", "sheet-a02", "sheet-a03"]);
    expect(sheets[0].title).toBe("Plant floors between the lab floors");
    expect(sheets[0].imagePath).toBe("/menu/floors.png");
    expect(sheets[0].whyHash).toBe("why-floors-alternate");
    expect(sheets[0].paragraphs[0]).toContain("Plant floors");
    expect(sheets[2].poster).toBe(true);
    expect(sheets[2].title).toBe("Field guide");
    expect(sheets[2].downloadPath).toBe("/poster.pdf");
    expect(sheets[2].paragraphs).toEqual(["One sheet."]);
  });

  it("uses the plain diagram when a building has no menu card", () => {
    const sheets = buildPlanSheets(
      [graphic({ id: "d", slug: "pipes", storagePath: "/diagrams/pipes.png", svgPath: "/diagrams/pipes.svg", caption: "The blue pipes" })],
      [],
    );
    expect(sheets).toHaveLength(1);
    expect(sheets[0].imagePath).toBe("/diagrams/pipes.png");
    expect(sheets[0].title).toBe("The blue pipes");
    expect(sheets[0].whyHash).toBeNull();
  });

  it("ignores section hashes and reads sheet hashes", () => {
    expect(sheetIndexFromHash("#sheet-a03", 6)).toBe(2);
    expect(sheetIndexFromHash("#sheet-A01", 6)).toBe(0);
    expect(sheetIndexFromHash("#why", 6)).toBeNull();
    expect(sheetIndexFromHash("#tldr", 6)).toBeNull();
    expect(sheetIndexFromHash("#sheet-a07", 6)).toBeNull();
  });

  it("returns nothing when a building has no graphics", () => {
    expect(buildPlanSheets([], sections)).toEqual([]);
  });

  it("prerenders every sheet title and explanation as HTML", () => {
    const html = buildingContentHtml(
      {
        name: "Mäusebunker",
        why_section: { sections: [{ heading: "The blue pipes", graphic_slug: "pipes", paragraphs: ["Ninety-four intakes."] }] },
      },
      {
        graphics: [
          { slug: "pipes", kind: "diagram", caption: "Section" },
          { slug: "poster", kind: "poster", caption: "One sheet.", downloadable: true },
        ],
      },
    );
    expect(html).toContain('id="sheet-a01"');
    expect(html).toContain("A-01 The blue pipes");
    expect(html).toContain("Ninety-four intakes.");
    expect(html).toContain("Read the full explanation");
    expect(html).toContain('href="#why-pipes"');
    expect(html).toContain('id="sheet-a02"');
    expect(html).toContain("A-02 Field guide");
    expect(html).toContain("Download the poster");
    expect(html).toContain("Concept illustration");
    expect(html).not.toContain("—");
  });
});
