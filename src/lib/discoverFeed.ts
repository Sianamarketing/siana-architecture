import { graphicsFromRows, imagesFromRows, parseWhy, resolveMediaUrl } from "./buildingEntry.ts";
import { buildPlanSheets } from "./planSet.ts";

export const DISCOVER_PAGE_SIZE = 6;
export const DISCOVER_TITLE = "Discover - Siana Architecture";
export const DISCOVER_DESCRIPTION =
  "Browse buildings, photographs and plan sheets from the Siana atlas.";

const PHOTOS_PER_PROJECT = 5;
const PREVIEW_TILES = 24;

export type DiscoverKind = "building" | "photo" | "sheet";

export interface DiscoverTile {
  id: string;
  kind: DiscoverKind;
  href: string;
  image: string | null;
  alt: string;
  title: string;
  caption: string | null;
  meta: string | null;
  kicker: string | null;
  buildingName: string;
  city: string | null;
  citySlug: string | null;
  style: string | null;
  width: number | null;
  height: number | null;
}

export interface DiscoverProject {
  id: string;
  slug: string;
  name: string;
  style?: string | null;
  year_completed?: number | null;
  featured?: boolean | null;
  updated_at?: string | null;
  hero_image_url?: string | null;
  cover_image_url?: string | null;
  why_section?: unknown;
  city?: { name?: string | null; slug?: string | null } | { name?: string | null; slug?: string | null }[] | null;
}

export interface DiscoverImageRow {
  id: string;
  project_id: string;
  storage_path?: string | null;
  original_url?: string | null;
  source_url?: string | null;
  alt?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  position?: number | null;
  is_hero?: boolean | null;
  author?: string | null;
  license?: string | null;
  license_url?: string | null;
}

export interface DiscoverGraphicRow {
  id: string;
  project_id: string;
  slug?: string | null;
  kind?: string | null;
  alt?: string | null;
  caption?: string | null;
  card_path?: string | null;
  storage_path?: string | null;
  svg_path?: string | null;
  downloadable?: boolean | null;
  download_path?: string | null;
  download_label?: string | null;
  position?: number | null;
}

export function sortDiscoverProjects<T extends { featured?: boolean | null; updated_at?: string | null; name?: string | null }>(projects: T[]): T[] {
  return projects.slice().sort((a, b) => {
    const featured = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    if (featured) return featured;
    const updated = String(b.updated_at || "").localeCompare(String(a.updated_at || ""));
    if (updated) return updated;
    return String(a.name || "").localeCompare(String(b.name || ""));
  });
}

function cityOf(project: DiscoverProject): { name: string | null; slug: string | null } {
  const city = Array.isArray(project.city) ? project.city[0] : project.city;
  return {
    name: city?.name?.trim() || null,
    slug: city?.slug?.trim() || null,
  };
}

function yearOf(year: number | null | undefined): string | null {
  return year && year > 1000 ? String(year) : null;
}

function mediaUrl(path: string | null | undefined, supabaseUrl?: string | null): string | null {
  return resolveMediaUrl(path, { supabaseUrl });
}

function weaveProject(tiles: DiscoverTile[]): DiscoverTile[] {
  const building = tiles.find((tile) => tile.kind === "building");
  const photos = tiles.filter((tile) => tile.kind === "photo");
  const sheets = tiles.filter((tile) => tile.kind === "sheet");
  const woven: DiscoverTile[] = [];
  if (building) woven.push(building);
  const count = Math.max(photos.length, sheets.length);
  for (let i = 0; i < count; i += 1) {
    if (photos[i]) woven.push(photos[i]);
    if (sheets[i]) woven.push(sheets[i]);
  }
  return woven;
}

/** Round-robin so neighbouring cards come from different buildings. */
export function mixDiscoverTiles(groups: DiscoverTile[][]): DiscoverTile[] {
  const queues = groups.map((group) => group.slice());
  const mixed: DiscoverTile[] = [];
  for (;;) {
    let took = false;
    for (const queue of queues) {
      const next = queue.shift();
      if (!next) continue;
      mixed.push(next);
      took = true;
    }
    if (!took) break;
  }
  return mixed;
}

export function tilesForProject(
  project: DiscoverProject,
  images: DiscoverImageRow[],
  graphics: DiscoverGraphicRow[],
  supabaseUrl?: string | null,
): DiscoverTile[] {
  const city = cityOf(project);
  const style = project.style?.trim() || null;
  const year = yearOf(project.year_completed);
  const meta = [city.name, style, year].filter(Boolean).join(" · ") || null;
  const gallery = imagesFromRows(
    images.map((row) => ({
      id: row.id,
      storage_path: row.storage_path ?? null,
      source_url: row.source_url || "",
      original_url: row.original_url ?? null,
      width: row.width ?? null,
      height: row.height ?? null,
      alt: row.alt || project.name,
      caption: row.caption ?? null,
      author: row.author || "",
      license: row.license || "",
      license_url: row.license_url ?? null,
      position: row.position ?? 0,
      is_hero: Boolean(row.is_hero),
    })),
    supabaseUrl,
  );
  const hero = mediaUrl(project.hero_image_url, supabaseUrl)
    || mediaUrl(project.cover_image_url, supabaseUrl)
    || gallery[0]?.url
    || null;
  const tiles: DiscoverTile[] = [{
    id: `building-${project.id}`,
    kind: "building",
    href: `/projects/${project.slug}`,
    image: hero,
    alt: city.name ? `${project.name}, ${city.name}` : project.name,
    title: project.name,
    caption: null,
    meta,
    kicker: null,
    buildingName: project.name,
    city: city.name,
    citySlug: city.slug,
    style,
    width: null,
    height: null,
  }];

  gallery
    .filter((image) => image.url !== hero)
    .slice(0, PHOTOS_PER_PROJECT)
    .forEach((image) => {
      tiles.push({
        id: `photo-${image.id}`,
        kind: "photo",
        href: `/projects/${project.slug}`,
        image: image.url,
        alt: image.alt || image.caption || project.name,
        title: project.name,
        caption: image.caption || image.alt || null,
        meta: null,
        kicker: project.name,
        buildingName: project.name,
        city: city.name,
        citySlug: city.slug,
        style,
        width: image.width,
        height: image.height,
      });
    });

  const sheets = buildPlanSheets(
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
      download_label: row.download_label ?? null,
      card_path: row.card_path ?? null,
      position: row.position ?? 0,
    }))),
    parseWhy(project.why_section).sections,
  );
  sheets.forEach((sheet) => {
    const image = mediaUrl(sheet.imagePath, supabaseUrl);
    if (!image) return;
    tiles.push({
      id: `sheet-${project.id}-${sheet.id}`,
      kind: "sheet",
      href: `/projects/${project.slug}#${sheet.id}`,
      image,
      alt: sheet.alt || `${sheet.code} ${sheet.title}`,
      title: sheet.title,
      caption: null,
      meta: null,
      kicker: sheet.code,
      buildingName: project.name,
      city: city.name,
      citySlug: city.slug,
      style,
      width: null,
      height: null,
    });
  });

  return weaveProject(tiles);
}

export function discoverTilesForProjects(
  projects: DiscoverProject[],
  images: DiscoverImageRow[],
  graphics: DiscoverGraphicRow[],
  supabaseUrl?: string | null,
): DiscoverTile[] {
  const ids = new Set(projects.map((project) => project.id));
  const imagesByProject = new Map<string, DiscoverImageRow[]>();
  const graphicsByProject = new Map<string, DiscoverGraphicRow[]>();
  images.forEach((row) => {
    if (!ids.has(row.project_id)) return;
    const list = imagesByProject.get(row.project_id) || [];
    list.push(row);
    imagesByProject.set(row.project_id, list);
  });
  graphics.forEach((row) => {
    if (!ids.has(row.project_id)) return;
    const list = graphicsByProject.get(row.project_id) || [];
    list.push(row);
    graphicsByProject.set(row.project_id, list);
  });
  const groups = projects.map((project) => tilesForProject(
    project,
    imagesByProject.get(project.id) || [],
    graphicsByProject.get(project.id) || [],
    supabaseUrl,
  ));
  // Shift each building's queue so the first row is not six building cards.
  const staggered = groups.map((group, index) => {
    if (group.length < 2) return group;
    const shift = index % Math.min(3, group.length);
    return group.slice(shift).concat(group.slice(0, shift));
  });
  return mixDiscoverTiles(staggered);
}

/** The first page of the feed: featured buildings, then the most recently updated. */
export function firstScreenTiles(
  projects: DiscoverProject[],
  images: DiscoverImageRow[],
  graphics: DiscoverGraphicRow[],
  supabaseUrl?: string | null,
): DiscoverTile[] {
  const page = sortDiscoverProjects(projects).slice(0, DISCOVER_PAGE_SIZE);
  return discoverTilesForProjects(page, images, graphics, supabaseUrl);
}

export function filterDiscoverTiles(
  tiles: DiscoverTile[],
  filter: { kind?: "all" | DiscoverKind; citySlug?: string | null; style?: string | null },
): DiscoverTile[] {
  const kind = filter.kind || "all";
  return tiles.filter((tile) => {
    if (kind !== "all" && tile.kind !== kind) return false;
    if (filter.citySlug && tile.citySlug !== filter.citySlug) return false;
    if (filter.style && tile.style !== filter.style) return false;
    return true;
  });
}

const esc = (value: string) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

/** Crawlable first screen. Image files stay on the live page; the words stay here. */
export function discoverContentHtml(tiles: DiscoverTile[], limit = PREVIEW_TILES): string {
  const items = tiles.slice(0, limit).map((tile) => {
    if (tile.kind === "building") {
      const meta = tile.meta ? ` - ${esc(tile.meta)}` : "";
      return `<li><a href="${esc(tile.href)}">${esc(tile.title)}</a>${meta}</li>`;
    }
    if (tile.kind === "photo") {
      return `<li><a href="${esc(tile.href)}">${esc(tile.caption || tile.alt)}</a> - ${esc(tile.buildingName)}</li>`;
    }
    return `<li><a href="${esc(tile.href)}">${esc(tile.kicker || "")} ${esc(tile.title)}</a></li>`;
  });
  return `<h1>Discover</h1><p>${esc(DISCOVER_DESCRIPTION)}</p><ul>${items.join("")}</ul>`;
}
