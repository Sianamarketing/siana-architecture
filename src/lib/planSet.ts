import type { BuildingGraphic, WhyBlock } from "@/lib/buildingEntry";

export interface PlanSheet {
  /** `sheet-a01`. Stable deep-link id. */
  id: string;
  /** `A-01`. */
  code: string;
  title: string;
  paragraphs: string[];
  /** Card art, or the plain diagram when a building has no menu card. */
  imagePath: string | null;
  whyHash: string | null;
  poster: boolean;
  downloadPath: string | null;
  downloadLabel: string | null;
}

export function sheetCode(index: number): string {
  return `A-${String(index + 1).padStart(2, "0")}`;
}

export function sheetDomId(index: number): string {
  return `sheet-a${String(index + 1).padStart(2, "0")}`;
}

/** Returns a sheet index for `#sheet-a03`. Other hashes, including section links, return null. */
export function sheetIndexFromHash(hash: string, count: number): number | null {
  const match = String(hash || "").replace(/^#/, "").match(/^sheet-a(\d+)$/i);
  if (!match) return null;
  const index = Number(match[1]) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= count) return null;
  return index;
}

function imagePathOf(graphic: BuildingGraphic): string | null {
  return graphic.cardPath || graphic.storagePath || graphic.svgPath || null;
}

function isPoster(graphic: BuildingGraphic): boolean {
  return graphic.kind === "poster" || graphic.downloadable;
}

/**
 * One sheet per diagram, poster last. Order follows the "Why it looks like this"
 * sequence when a graphic is linked, then the stored position.
 */
export function buildPlanSheets(
  graphics: BuildingGraphic[],
  sections: WhyBlock[],
): PlanSheet[] {
  const posters = graphics.filter(isPoster);
  const poster = posters[0] ?? null;
  const drawings = graphics.filter((graphic) => !posters.includes(graphic));
  const order = sections.map((section) => section.graphicSlug).filter((slug): slug is string => Boolean(slug));
  const sorted = drawings.slice().sort((a, b) => {
    const ai = a.slug ? order.indexOf(a.slug) : -1;
    const bi = b.slug ? order.indexOf(b.slug) : -1;
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  const sequence = poster ? [...sorted, poster] : sorted;
  const sheets: PlanSheet[] = [];
  sequence.forEach((graphic) => {
    const section = graphic.slug ? sections.find((item) => item.graphicSlug === graphic.slug) : undefined;
    const posterSheet = isPoster(graphic);
    const title = posterSheet
      ? "Field guide"
      : section?.heading || graphic.caption || graphic.alt || "Drawing";
    const paragraphs = section?.paragraphs?.length
      ? section.paragraphs
      : [graphic.caption || graphic.alt || ""].map((line) => line.trim()).filter(Boolean);
    const imagePath = imagePathOf(graphic);
    if (!imagePath && paragraphs.length === 0 && !graphic.downloadPath) return;
    const index = sheets.length;
    sheets.push({
      id: sheetDomId(index),
      code: sheetCode(index),
      title,
      paragraphs,
      imagePath,
      whyHash: !posterSheet && section?.graphicSlug ? `why-${section.graphicSlug}` : null,
      poster: posterSheet,
      downloadPath: posterSheet ? graphic.downloadPath : null,
      downloadLabel: posterSheet ? graphic.downloadLabel : null,
    });
  });
  return sheets;
}
