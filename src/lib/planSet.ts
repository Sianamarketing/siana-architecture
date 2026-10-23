import type { BuildingGraphic, PlanFact, WhyBlock } from "@/lib/buildingEntry";

export interface PlanSheet {
  /** `sheet-a01`. Stable deep-link id. */
  id: string;
  /** `A-01`. */
  code: string;
  title: string;
  paragraphs: string[];
  /** Card art, or the plain diagram when a building has no menu card. */
  imagePath: string | null;
  /** SVG when one exists, otherwise the full-size PNG. The overview uses the poster PNG. */
  zoomPath: string | null;
  alt: string;
  whyHash: string | null;
  poster: boolean;
  downloadPath: string | null;
  downloadLabel: string | null;
  facts: PlanFact[];
}

export interface PlanOverviewInput {
  intro?: string | null;
  facts?: PlanFact[] | null;
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

/** The lightbox reads the sharpest file. Menu cards stay on the closed sheet. */
function zoomPathOf(graphic: BuildingGraphic): string | null {
  if (isPoster(graphic)) return graphic.storagePath || graphic.cardPath || graphic.svgPath || null;
  return graphic.svgPath || graphic.storagePath || graphic.cardPath || null;
}

function isPoster(graphic: BuildingGraphic): boolean {
  return graphic.kind === "poster" || graphic.downloadable;
}

function proseLines(value: string | null | undefined): string[] {
  return String(value || "")
    .split(/\n{2,}/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * The poster opens the set as A-01 when a building has one. Drawings follow,
 * in the "Why it looks like this" order, then the stored position.
 */
export function buildPlanSheets(
  graphics: BuildingGraphic[],
  sections: WhyBlock[],
  overview?: PlanOverviewInput | null,
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
  const sequence = poster ? [poster, ...sorted] : sorted;
  const sheets: PlanSheet[] = [];
  sequence.forEach((graphic) => {
    const section = graphic.slug ? sections.find((item) => item.graphicSlug === graphic.slug) : undefined;
    const posterSheet = isPoster(graphic);
    const title = posterSheet
      ? "Overview"
      : section?.heading || graphic.caption || graphic.alt || "Drawing";
    const paragraphs = posterSheet
      ? proseLines(overview?.intro || graphic.caption || graphic.alt || "")
      : section?.paragraphs?.length
        ? section.paragraphs
        : [graphic.caption || graphic.alt || ""].map((line) => line.trim()).filter(Boolean);
    const imagePath = imagePathOf(graphic);
    const zoomPath = zoomPathOf(graphic) || imagePath;
    if (!imagePath && !zoomPath && paragraphs.length === 0 && !graphic.downloadPath) return;
    const index = sheets.length;
    sheets.push({
      id: sheetDomId(index),
      code: sheetCode(index),
      title,
      paragraphs,
      imagePath,
      zoomPath,
      alt: graphic.alt || graphic.caption || title,
      whyHash: !posterSheet && section?.graphicSlug ? `why-${section.graphicSlug}` : null,
      poster: posterSheet,
      downloadPath: posterSheet ? graphic.downloadPath : null,
      downloadLabel: posterSheet ? graphic.downloadLabel : null,
      facts: posterSheet ? overview?.facts ?? [] : [],
    });
  });
  return sheets;
}
