/** Directory categories the homepage and footer share. Only Architects has records today. */
export const DIRECTORY_CATEGORIES = [
  { slug: "architects", label: "Architects" },
  { slug: "interior-designers", label: "Interior Designers" },
  { slug: "product-manufacturers", label: "Product manufacturers" },
  { slug: "designers", label: "Designers" },
  { slug: "tools", label: "Tools" },
  { slug: "marketing-agency", label: "Marketing Agency" },
] as const;

export type DirectorySlug = (typeof DIRECTORY_CATEGORIES)[number]["slug"];

export interface DirectorySourceProject {
  id: string;
  slug: string;
  name: string;
  architect: string | null;
  city?: string | null;
  style?: string | null;
  category?: string | null;
  updated_at?: string | null;
  image?: string | null;
  imageAlt?: string | null;
}

export interface DirectoryBuildingRef {
  slug: string;
  name: string;
  city: string | null;
  style: string | null;
  category: string | null;
}

export interface DirectoryEntry {
  id: string;
  name: string;
  category: "architects";
  href: string;
  image: string | null;
  alt: string;
  /** Building name, or a real count when one credit covers several buildings. */
  meta: string;
  buildings: number;
  buildingsList: DirectoryBuildingRef[];
}

const BANNED_IMAGE = [
  "07-car-tunnel",
  "08-saal-1",
  "09-entrance-hall",
  "10-light-sculpture",
];

/** Picsum placeholders and the removed interior photographs stay out of the directory. */
export function usableDirectoryImage(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.includes("picsum.photos")) return null;
  if (BANNED_IMAGE.some((part) => path.includes(part))) return null;
  if (path.startsWith("/buildings/")) return path;
  if (path.includes("upload.wikimedia.org") || path.includes("commons.wikimedia.org")) return path;
  return null;
}

/**
 * One card per architect credit line on a published building.
 * Combined credits stay together. We do not split them into invented people.
 */
export function architectEntries(projects: DirectorySourceProject[]): DirectoryEntry[] {
  const groups = new Map<string, DirectorySourceProject[]>();
  for (const project of projects) {
    const name = project.architect?.trim();
    if (!name) continue;
    const list = groups.get(name) || [];
    list.push(project);
    groups.set(name, list);
  }
  const entries: DirectoryEntry[] = [];
  for (const [name, list] of groups) {
    const ordered = list.slice().sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")));
    const withImage = ordered.find((project) => usableDirectoryImage(project.image));
    const lead = withImage || ordered[0];
    const image = usableDirectoryImage(lead.image);
    const buildingsList = ordered
      .map((project) => ({
        slug: project.slug,
        name: project.name,
        city: project.city?.trim() || null,
        style: project.style?.trim() || null,
        category: project.category?.trim() || null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    entries.push({
      id: name,
      name,
      category: "architects",
      href: `/projects/${lead.slug}`,
      image,
      alt: lead.imageAlt?.trim() || `${name}, ${lead.name}`,
      meta: list.length > 1 ? `${list.length} buildings` : lead.name,
      buildings: list.length,
      buildingsList,
    });
  }
  return entries.sort((a, b) => b.buildings - a.buildings || a.name.localeCompare(b.name));
}

/**
 * Architect credits are the only listings. Other categories stay empty.
 * Search matches the credit line, a building name, or a city. Results are not ranked.
 */
export function filterDirectoryEntries(
  entries: DirectoryEntry[],
  options: { query?: string | null; category?: string | null; city?: string | null; style?: string | null },
): DirectoryEntry[] {
  const category = options.category || "all";
  if (category !== "all" && category !== "architects") return [];
  const query = String(options.query || "").trim().toLowerCase();
  const city = String(options.city || "").trim().toLowerCase();
  const style = String(options.style || "").trim().toLowerCase();
  return entries.filter((entry) => {
    if (city && city !== "all" && !entry.buildingsList.some((building) => (building.city || "").toLowerCase() === city)) return false;
    if (style && style !== "all" && !entry.buildingsList.some((building) => (building.style || "").toLowerCase() === style)) return false;
    if (!query) return true;
    const fields = [entry.name, ...entry.buildingsList.flatMap((building) => [building.name, building.city || "", building.style || ""])];
    return fields.some((field) => field.toLowerCase().includes(query));
  });
}

/** A public table of the credit lines. No scores, fees, or office addresses. */
export function creditTableCsv(entries: DirectoryEntry[]): string {
  const cell = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = ["credit,building,project location,style,project"];
  for (const entry of entries) {
    for (const building of entry.buildingsList) {
      lines.push([
        cell(entry.name),
        cell(building.name),
        cell(building.city || ""),
        cell(building.style || ""),
        cell(`/projects/${building.slug}`),
      ].join(","));
    }
  }
  return lines.join("\n");
}

export function directoryCategory(slug: string | null | undefined) {
  if (!slug) return null;
  return DIRECTORY_CATEGORIES.find((category) => category.slug === slug) || null;
}

/** Minutes from a real body. Empty copy returns null so the page does not invent a time. */
export function readMinutes(body: string | null | undefined): number | null {
  const words = String(body || "").trim().split(/\s+/).filter(Boolean).length;
  if (!words) return null;
  return Math.max(1, Math.round(words / 220));
}
