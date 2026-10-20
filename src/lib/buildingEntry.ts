/**
 * Building-entry helpers. The project page renders whatever a row actually
 * has — a full Mäusebunker entry, or an older project that only has a
 * description and a hero — and hides the rest.
 */

export interface StatField {
  value?: unknown;
  /** Numeric year when `value` is a display string such as "February 1982". */
  year?: number;
  source?: string | null;
  note?: string | null;
}

export interface StatRow {
  label: string;
  value: string;
  note?: string | null;
  source?: string | null;
}

export interface DatedEvent {
  value: string;
  source: string | null;
}

export interface WhyBlock {
  heading: string;
  paragraphs: string[];
  graphicSlug: string | null;
}

export interface BuildingImage {
  id: string;
  url: string;
  alt: string;
  caption: string | null;
  author: string | null;
  license: string | null;
  licenseUrl: string | null;
  sourceUrl: string | null;
  width: number | null;
  height: number | null;
}

export interface BuildingGraphic {
  id: string;
  slug: string | null;
  kind: string | null;
  storagePath: string | null;
  svgPath: string | null;
  alt: string | null;
  caption: string | null;
  downloadable: boolean;
  downloadPath: string | null;
  downloadLabel: string | null;
  /** Terracotta menu card. The plain diagram stays on `storagePath` / `svgPath`. */
  cardPath?: string | null;
}

export interface BuildingLink {
  id: string;
  category: string;
  title: string;
  url: string | null;
  note: string | null;
  position: number;
}

export interface LinkGroup {
  category: string;
  label: string;
  items: BuildingLink[];
}

export const LINK_CATEGORIES: { key: string; label: string }[] = [
  { key: "heritage", label: "Heritage" },
  { key: "modellverfahren", label: "Modellverfahren" },
  { key: "encyclopedia", label: "Encyclopedias" },
  { key: "database", label: "Databases" },
  { key: "article", label: "Articles" },
  { key: "film", label: "Film" },
  { key: "book", label: "Books" },
  { key: "official", label: "Official" },
  { key: "visitor", label: "Visit" },
];

const STORAGE_BUCKET = "project-images";

export function hasText(value: string | null | undefined): boolean {
  return Boolean(value && value.trim());
}

export function isHtml(value: string | null | undefined): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value || "");
}

export function paragraphsOf(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function formatThousands(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatCoord(lat: number, lng: number): string {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(6)}° ${ns}, ${Math.abs(lng).toFixed(6)}° ${ew}`;
}

/**
 * Repo paths (`/buildings/...`) and absolute URLs pass through.
 * A bare storage key is resolved against the public project-images bucket.
 */
export function resolveMediaUrl(
  path: string | null | undefined,
  opts?: { original?: string | null; supabaseUrl?: string | null },
): string | null {
  if (!path) return opts?.original || null;
  if (/^https?:\/\//i.test(path) || path.startsWith("/")) return path;
  const base = opts?.supabaseUrl?.replace(/\/$/, "");
  if (!base) return opts?.original || null;
  const key = path.replace(/^\/+/, "");
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${key}`;
}

function asStats(stats: unknown): Record<string, StatField> {
  if (!stats || typeof stats !== "object" || Array.isArray(stats)) return {};
  const out: Record<string, StatField> = {};
  for (const [key, value] of Object.entries(stats as Record<string, unknown>)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = value as StatField;
    }
  }
  return out;
}

function lines(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (Array.isArray(value)) {
    const parts = value.map((v) => String(v).trim()).filter(Boolean);
    return parts.length ? parts.join("\n") : null;
  }
  const text = String(value).trim();
  return text || null;
}

function yearOf(field: StatField | undefined): number | null {
  if (!field) return null;
  if (typeof field.year === "number") return field.year;
  if (typeof field.value === "number") return field.value;
  return null;
}

function meters(value: unknown): string | null {
  if (typeof value !== "number") return null;
  return `${value.toFixed(2)} m`;
}

export interface FallbackFacts {
  architect?: string | null;
  year_completed?: number | null;
  style?: string | null;
  category?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  condition?: string | null;
  heritage_status?: string | null;
  year_listed?: number | null;
}

export function buildStatRows(stats: unknown, project?: FallbackFacts): StatRow[] {
  const s = asStats(stats);
  const rows: StatRow[] = [];
  const add = (label: string, value: string | null, source?: string | null, note?: string | null) => {
    if (!value) return;
    rows.push({
      label,
      value,
      source: source || null,
      note: note && note.trim() && note.trim() !== value ? note.trim() : null,
    });
  };
  const f = (key: string) => s[key];

  if (Object.keys(s).length === 0) {
    add("Architect", project?.architect || null);
    add("Year", project?.year_completed ? String(project.year_completed) : null);
    add("Style", project?.style || null);
    add("Category", project?.category || null);
    add("Address", project?.address || null);
    if (project?.heritage_status) {
      add(
        "Heritage",
        project.year_listed ? `${project.heritage_status}, ${project.year_listed}` : project.heritage_status,
      );
    }
    if (project?.condition) add("Condition", project.condition);
    if (project?.latitude != null && project?.longitude != null) {
      add("Coordinates", formatCoord(project.latitude, project.longitude));
    }
    return rows;
  }

  add("Architects", lines(f("architects")?.value), f("architects")?.source, f("architects")?.note);
  const engineers = f("engineers");
  if (engineers) {
    const named = lines(engineers.value);
    add(
      "Engineers",
      named || (engineers.note ? `Not established. ${engineers.note}` : "Not established"),
      engineers.source,
      named ? engineers.note : null,
    );
  }
  add("Contractor", lines(f("contractor")?.value), f("contractor")?.source, f("contractor")?.note);
  add("Client", lines(f("client")?.value), f("client")?.source, f("client")?.note);
  add("Original use", lines(f("original_use")?.value), f("original_use")?.source, f("original_use")?.note);
  add("Current use", lines(f("current_use")?.value), f("current_use")?.source, f("current_use")?.note);

  const design = f("design_year");
  add("Design", design ? (typeof design.value === "number" ? String(design.value) : lines(design.value)) : null, design?.source, design?.note);

  const startYear = yearOf(f("construction_start"));
  const endYear = yearOf(f("completion"));
  const stop = lines(f("construction_stop")?.value);
  const construction = [startYear && endYear ? `${startYear} to ${endYear}` : startYear ? String(startYear) : null, stop]
    .filter(Boolean)
    .join(". ");
  add(
    "Construction",
    construction || null,
    f("construction_stop")?.source || f("construction_start")?.source || null,
    f("construction_stop")?.note,
  );

  const completion = f("completion");
  add(
    "Completion",
    completion ? lines(completion.value) || (endYear ? String(endYear) : null) : null,
    completion?.source,
    completion?.note,
  );

  add("Style", lines(f("style")?.value), f("style")?.source, f("style")?.note);
  add("Materials", lines(f("primary_materials")?.value), f("primary_materials")?.source, f("primary_materials")?.note);
  add("Structure", lines(f("structural_system")?.value), f("structural_system")?.source, f("structural_system")?.note);

  const size = [
    meters(f("length_m")?.value) && `${meters(f("length_m")?.value)} long`,
    meters(f("width_m")?.value) && `${meters(f("width_m")?.value)} wide`,
    meters(f("height_m")?.value) && `${meters(f("height_m")?.value)} high`,
    typeof f("wall_inclination_deg")?.value === "number" ? `walls inclined at ${f("wall_inclination_deg")?.value}°` : null,
  ].filter(Boolean) as string[];
  add("Size", size.length ? size.join(", ") : null, f("length_m")?.source || f("height_m")?.source || null);

  const floors = f("floors");
  add("Floors", floors ? lines(floors.value) : null, floors?.source, floors?.note);

  const area = f("floor_area_m2");
  add(
    "Floor area",
    typeof area?.value === "number" ? `${formatThousands(area.value)} m²` : lines(area?.value),
    area?.source,
    area?.note,
  );
  const site = f("site_area_m2");
  add(
    "Site",
    typeof site?.value === "number" ? `${formatThousands(site.value)} m²` : lines(site?.value),
    site?.source,
    site?.note,
  );
  add("Cost", lines(f("cost")?.value), f("cost")?.source, f("cost")?.note);

  const heritage = f("heritage_status");
  const listed = f("year_listed");
  const listedYear = typeof listed?.value === "number" ? listed.value : null;
  const heritageValue = lines(heritage?.value);
  add(
    "Heritage",
    heritageValue ? (listedYear ? `${heritageValue}. Listed ${listedYear}` : heritageValue) : null,
    heritage?.source || listed?.source,
    listed?.note || heritage?.note,
  );

  const condition = f("condition");
  add(
    "Condition",
    condition ? lines(condition.value) : project?.condition || null,
    condition?.source,
    condition?.note,
  );
  add("Access", lines(f("public_access")?.value), f("public_access")?.source, f("public_access")?.note);
  add("Address", lines(f("address")?.value) || project?.address || null, f("address")?.source, f("address")?.note);
  add("District", lines(f("district")?.value), f("district")?.source, f("district")?.note);
  add("Transit", lines(f("nearest_transit")?.value), f("nearest_transit")?.source, f("nearest_transit")?.note);

  const lat = project?.latitude ?? (typeof f("lat")?.value === "number" ? (f("lat")?.value as number) : null);
  const lng = project?.longitude ?? (typeof f("lng")?.value === "number" ? (f("lng")?.value as number) : null);
  if (lat != null && lng != null) {
    add("Coordinates", formatCoord(lat, lng), f("lat")?.source || f("lng")?.source || null);
  }

  const awards = f("awards");
  if (awards && lines(awards.value)) add("Awards", lines(awards.value), awards.source, awards.note);

  return rows;
}

export function statEvents(stats: unknown): DatedEvent[] {
  if (!stats || typeof stats !== "object" || Array.isArray(stats)) return [];
  const events = (stats as { events?: unknown }).events;
  if (!Array.isArray(events)) return [];
  return events
    .map((event) => {
      if (!event || typeof event !== "object") return null;
      const value = "value" in event && typeof event.value === "string" ? event.value.trim() : "";
      const source = "source" in event && typeof event.source === "string" ? event.source : null;
      return value ? { value, source } : null;
    })
    .filter((event): event is DatedEvent => Boolean(event));
}

export function heroMeta(
  project: { architect?: string | null; year_completed?: number | null; style?: string | null },
  stats: unknown,
): string | null {
  const s = asStats(stats);
  const start = yearOf(s.construction_start);
  const end = yearOf(s.completion) ?? project.year_completed ?? null;
  const years = start && end ? `${start}–${end}` : end ? String(end) : null;
  const parts = [project.architect, years, project.style].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export interface GlanceItem {
  label: string;
  value: string;
}

function glanceMeasure(value: unknown): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const rounded = value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} m`;
}

function shortArchitect(stats: unknown, project?: FallbackFacts): string | null {
  if (project?.architect?.trim()) return project.architect.trim();
  const value = asStats(stats).architects?.value;
  if (Array.isArray(value)) {
    const names = value
      .map((item) => String(item).replace(/\s*\([^)]*\)/g, "").trim())
      .filter(Boolean);
    return names.length ? names.join(", ") : null;
  }
  return lines(value);
}

function shortHeritage(stats: unknown, project?: FallbackFacts): string | null {
  const s = asStats(stats);
  const raw = lines(s.heritage_status?.value) || project?.heritage_status || null;
  if (!raw) return null;
  const name = raw.split("(")[0].split(",")[0].trim();
  const listed = typeof s.year_listed?.value === "number" ? s.year_listed.value : project?.year_listed;
  return listed ? `${name}, ${listed}` : name;
}

/** Four to six short facts for the strip under the hero. Older projects use whatever columns they have. */
export function glanceItems(stats: unknown, project?: FallbackFacts): GlanceItem[] {
  const s = asStats(stats);
  const start = yearOf(s.construction_start);
  const end = yearOf(s.completion) ?? project?.year_completed ?? null;
  const years = start && end ? `${start}–${end}` : end ? String(end) : null;
  const candidates: GlanceItem[] = [];
  const add = (label: string, value: string | null | undefined) => {
    const clean = value?.replace(/\s+/g, " ").trim();
    if (!clean) return;
    candidates.push({ label, value: clean });
  };
  add("Architect", shortArchitect(stats, project));
  add("Years", years);
  add("Length", glanceMeasure(s.length_m?.value));
  add("Height", glanceMeasure(s.height_m?.value));
  add("Heritage", shortHeritage(stats, project));
  add("Condition", lines(s.condition?.value) || project?.condition || null);
  add("Style", lines(s.style?.value) || project?.style || null);
  add("Floors", lines(s.floors?.value));
  add("Category", project?.category || null);
  const seen = new Set<string>();
  return candidates.filter((item) => {
    if (seen.has(item.label)) return false;
    seen.add(item.label);
    return true;
  }).slice(0, 6);
}

/** First paragraph stays visible; the rest can collapse. HTML keeps its tags. */
export function splitProse(value: string | null | undefined): { lead: string; rest: string; html: boolean } {
  const html = isHtml(value);
  if (!value || !value.trim()) return { lead: "", rest: "", html };
  if (html) {
    const matches = value.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi);
    if (matches && matches.length > 1) {
      return { lead: matches[0], rest: value.slice(value.indexOf(matches[0]) + matches[0].length).trim(), html: true };
    }
    return { lead: value.trim(), rest: "", html: true };
  }
  const parts = paragraphsOf(value);
  if (parts.length <= 1) return { lead: parts[0] || "", rest: "", html: false };
  return { lead: parts[0], rest: parts.slice(1).join("\n\n"), html: false };
}

export interface PlanFact {
  label: string;
  value: string;
}

/** Short facts for the poster sheet. An editor can override these on why_section.overview.facts. */
export function overviewFacts(stats: unknown, project?: FallbackFacts & { city?: string | null }): PlanFact[] {
  const s = asStats(stats);
  const facts: PlanFact[] = [];
  const architectList = s.architects?.value;
  const architects = Array.isArray(architectList)
    ? architectList.map((item) => String(item).replace(/\s*\([^)]*\)/g, "").trim()).filter(Boolean).join(", ")
    : lines(architectList) || project?.architect?.trim() || null;
  if (architects) facts.push({ label: "Architects", value: architects });
  const start = yearOf(s.construction_start);
  const end = yearOf(s.completion) ?? project?.year_completed ?? null;
  if (start && end) facts.push({ label: "Built", value: `${start}–${end}` });
  else if (end) facts.push({ label: "Built", value: String(end) });
  const style = lines(s.style?.value) || project?.style || null;
  if (style) facts.push({ label: "Style", value: style });
  const district = lines(s.district?.value);
  const locality = district ? district.split(",")[0].trim() : null;
  const city = project?.city?.trim() || null;
  const location = city && locality ? `${city}-${locality}` : city || locality || lines(s.address?.value) || project?.address || null;
  if (location) facts.push({ label: "Location", value: location });
  return facts;
}

function factsFromOverview(value: unknown): PlanFact[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const label = "label" in item && typeof item.label === "string" ? item.label.trim() : "";
      const factValue = "value" in item && typeof item.value === "string" ? item.value.trim() : "";
      return label && factValue ? { label, value: factValue } : null;
    })
    .filter((item): item is PlanFact => Boolean(item));
}

/**
 * Copy for the poster sheet. why_section.overview wins when an editor has written it.
 * Otherwise the sheet uses the TL;DR and the measured facts, so a building with no extra field still opens.
 */
export function planOverview(
  why: unknown,
  tldr?: string | null,
): { intro: string | null; facts: PlanFact[] | null } {
  const record = why && typeof why === "object" && !Array.isArray(why) ? why as { overview?: unknown } : null;
  const overview = record?.overview && typeof record.overview === "object"
    ? record.overview as { intro?: unknown; facts?: unknown }
    : null;
  const customIntro = typeof overview?.intro === "string" && overview.intro.trim() ? overview.intro.trim() : null;
  const intro = customIntro || (typeof tldr === "string" && tldr.trim() ? tldr.trim() : null);
  const facts = factsFromOverview(overview?.facts);
  return { intro, facts: facts.length ? facts : null };
}

export function parseFacts(facts: unknown): string[] {
  if (!Array.isArray(facts)) return [];
  return facts
    .map((fact) => (typeof fact === "string" ? fact.trim() : ""))
    .filter(Boolean);
}

function normalizeWhy(raw: unknown): WhyBlock | null {
  if (!raw || typeof raw !== "object") return null;
  const block = raw as { heading?: unknown; title?: unknown; paragraphs?: unknown; body?: unknown; graphic_slug?: unknown };
  const heading = typeof block.heading === "string" ? block.heading.trim() : typeof block.title === "string" ? block.title.trim() : "";
  let paragraphs: string[] = [];
  if (Array.isArray(block.paragraphs)) {
    paragraphs = block.paragraphs.map((p) => (typeof p === "string" ? p.trim() : "")).filter(Boolean);
  } else if (typeof block.body === "string") {
    paragraphs = paragraphsOf(block.body);
  }
  if (!heading && paragraphs.length === 0) return null;
  const graphicSlug = typeof block.graphic_slug === "string" ? block.graphic_slug : null;
  return { heading, paragraphs, graphicSlug };
}

export function parseWhy(why: unknown): { intro: string | null; sections: WhyBlock[] } {
  if (Array.isArray(why)) {
    return { intro: null, sections: why.map(normalizeWhy).filter((s): s is WhyBlock => Boolean(s)) };
  }
  if (why && typeof why === "object") {
    const record = why as { intro?: unknown; sections?: unknown };
    const intro = typeof record.intro === "string" && record.intro.trim() ? record.intro.trim() : null;
    const sections = Array.isArray(record.sections)
      ? record.sections.map(normalizeWhy).filter((s): s is WhyBlock => Boolean(s))
      : [];
    return { intro, sections };
  }
  return { intro: null, sections: [] };
}

const CATEGORY_LABELS = new Map(LINK_CATEGORIES.map((c) => [c.key, c.label]));

export function groupLinks(links: BuildingLink[]): LinkGroup[] {
  const buckets = new Map<string, BuildingLink[]>();
  for (const link of links) {
    const list = buckets.get(link.category) ?? [];
    list.push(link);
    buckets.set(link.category, list);
  }
  const ordered: LinkGroup[] = [];
  for (const category of LINK_CATEGORIES) {
    const items = (buckets.get(category.key) ?? []).slice().sort((a, b) => a.position - b.position);
    if (items.length) ordered.push({ category: category.key, label: category.label, items });
    buckets.delete(category.key);
  }
  for (const [category, items] of buckets) {
    const sorted = items.slice().sort((a, b) => a.position - b.position);
    if (sorted.length) {
      ordered.push({
        category,
        label: CATEGORY_LABELS.get(category) || category.replace(/[_-]+/g, " "),
        items: sorted,
      });
    }
  }
  return ordered;
}

interface DbImage {
  id: string;
  storage_path: string | null;
  source_url: string;
  original_url: string | null;
  width: number | null;
  height: number | null;
  alt: string;
  caption: string | null;
  author: string;
  license: string;
  license_url: string | null;
  position: number;
  is_hero: boolean;
}

export function imagesFromRows(rows: DbImage[] | null | undefined, supabaseUrl?: string | null): BuildingImage[] {
  return (rows ?? [])
    .slice()
    .sort((a, b) => a.position - b.position || Number(b.is_hero) - Number(a.is_hero))
    .map((row) => {
      const url = resolveMediaUrl(row.storage_path, { original: row.original_url, supabaseUrl });
      if (!url) return null;
      return {
        id: row.id,
        url,
        alt: row.alt,
        caption: row.caption,
        author: row.author,
        license: row.license,
        licenseUrl: row.license_url,
        sourceUrl: row.source_url,
        width: row.width,
        height: row.height,
      };
    })
    .filter((img): img is BuildingImage => Boolean(img));
}

interface LegacyProject {
  name: string;
  hero_image_url?: string | null;
  cover_image_url?: string | null;
  gallery?: unknown;
}

export function imagesFromLegacy(project: LegacyProject): BuildingImage[] {
  const urls: { url: string; caption?: string }[] = [];
  const push = (url: string | null | undefined, caption?: string) => {
    if (!url || urls.some((item) => item.url === url)) return;
    urls.push({ url, caption });
  };
  push(project.hero_image_url);
  push(project.cover_image_url);
  if (Array.isArray(project.gallery)) {
    for (const item of project.gallery) {
      if (typeof item === "string") push(item);
      else if (item && typeof item === "object" && typeof (item as { url?: unknown }).url === "string") {
        const record = item as { url: string; caption?: string };
        push(record.url, record.caption);
      }
    }
  }
  return urls.map((item, index) => ({
    id: `legacy-${index}`,
    url: item.url,
    alt: item.caption || project.name,
    caption: item.caption || null,
    author: null,
    license: null,
    licenseUrl: null,
    sourceUrl: null,
    width: null,
    height: null,
  }));
}

export function collectImages(
  rows: DbImage[] | null | undefined,
  project: LegacyProject,
  supabaseUrl?: string | null,
): BuildingImage[] {
  const hosted = imagesFromRows(rows, supabaseUrl);
  return hosted.length ? hosted : imagesFromLegacy(project);
}

interface DbGraphic {
  id: string;
  slug: string | null;
  kind: string | null;
  storage_path: string | null;
  svg_path: string | null;
  alt: string | null;
  caption: string | null;
  downloadable: boolean;
  download_path: string | null;
  download_label: string | null;
  card_path?: string | null;
  position: number;
}

export function graphicsFromRows(rows: DbGraphic[] | null | undefined): BuildingGraphic[] {
  return (rows ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((row) => ({
      id: row.id,
      slug: row.slug,
      kind: row.kind,
      storagePath: row.storage_path,
      svgPath: row.svg_path,
      alt: row.alt,
      caption: row.caption,
      downloadable: row.downloadable,
      downloadPath: row.download_path,
      downloadLabel: row.download_label,
      cardPath: row.card_path ?? null,
    }));
}

export function posterGraphic(graphics: BuildingGraphic[]): BuildingGraphic | null {
  return graphics.find((graphic) => graphic.downloadable || graphic.kind === "poster") ?? null;
}

export function graphicBySlug(graphics: BuildingGraphic[], slug: string | null): BuildingGraphic | null {
  if (!slug) return null;
  return graphics.find((graphic) => graphic.slug === slug && graphic.kind !== "poster") ?? null;
}
