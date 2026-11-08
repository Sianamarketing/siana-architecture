import { usableDirectoryImage } from "@/lib/directory";

export interface RecentImageInput {
  storage_path?: string | null;
  is_hero?: boolean | null;
  position?: number | null;
  author?: string | null;
  license?: string | null;
  license_url?: string | null;
  kind?: string | null;
  alt?: string | null;
}

export interface RecentProjectInput {
  slug: string;
  name: string;
  created_at?: string | null;
  images: RecentImageInput[];
}

export interface BuildingSlide {
  slug: string;
  name: string;
  src: string;
  alt: string;
  author: string;
  license: string;
  licenseUrl: string | null;
}

/**
 * Projects have no published_at. created_at is the entry timestamp.
 * A shared import timestamp is common, so the slug is the stable tie-break.
 * Only a cleared exterior with an author or a licence is eligible.
 */
export function selectRecentSlides(projects: RecentProjectInput[], limit = 5): BuildingSlide[] {
  const ordered = projects.slice().sort((a, b) => {
    const byDate = String(b.created_at || "").localeCompare(String(a.created_at || ""));
    if (byDate !== 0) return byDate;
    return a.slug.localeCompare(b.slug);
  });
  const slides: BuildingSlide[] = [];
  for (const project of ordered) {
    const image = eligibleImage(project.images);
    if (!image) continue;
    const src = usableDirectoryImage(image.storage_path);
    if (!src) continue;
    slides.push({
      slug: project.slug,
      name: project.name,
      src,
      alt: image.alt?.trim() || project.name,
      author: image.author?.trim() || "",
      license: image.license?.trim() || "",
      licenseUrl: image.license_url || null,
    });
    if (slides.length >= limit) break;
  }
  return slides;
}

function eligibleImage(images: RecentImageInput[]): RecentImageInput | null {
  const candidates = images
    .filter((image) => {
      if (image.kind && image.kind !== "exterior") return false;
      if (!usableDirectoryImage(image.storage_path)) return false;
      return Boolean(image.author?.trim() || image.license?.trim());
    })
    .sort((a, b) => Number(Boolean(b.is_hero)) - Number(Boolean(a.is_hero)) || (a.position || 0) - (b.position || 0));
  return candidates[0] || null;
}
