import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { architectEntries, usableDirectoryImage, type DirectoryEntry } from "@/lib/directory";
import { selectRecentSlides, type BuildingSlide, type RecentImageInput } from "@/lib/recentBuildings";
import type { CoveragePin } from "@/components/site/ResearchCoverageMap";

export interface DirectoryStory {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  hero_image_url: string | null;
  body: string | null;
  linked_project_ids?: string[] | null;
}

export function useDirectoryRecords() {
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [stories, setStories] = useState<DirectoryStory[]>([]);
  const [slides, setSlides] = useState<BuildingSlide[]>([]);
  const [pins, setPins] = useState<CoveragePin[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: projects } = await supabase
        .from("projects")
        .select("id, slug, name, architect, style, category, created_at, updated_at, latitude, longitude, city:cities(name, slug, country)")
        .eq("status", "published");
      const { data: images } = await supabase
        .from("project_images")
        .select("project_id, alt, storage_path, is_hero, position, author, license, license_url, kind")
        .order("position");
      const { data: posts } = await supabase
        .from("posts")
        .select("id, slug, title, excerpt, category, hero_image_url, body, linked_project_ids")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (cancelled) return;
      const imagesByProject = new Map<string, RecentImageInput[]>();
      const imageByProject = new Map<string, { src: string; alt: string | null }>();
      (images || []).forEach((image) => {
        if (!image.project_id) return;
        const list = imagesByProject.get(image.project_id) || [];
        list.push(image);
        imagesByProject.set(image.project_id, list);
        const src = usableDirectoryImage(image.storage_path);
        if (!src) return;
        const current = imageByProject.get(image.project_id);
        if (!current || image.is_hero) imageByProject.set(image.project_id, { src, alt: image.alt });
      });
      const coverage: CoveragePin[] = [];
      const sources = (projects || []).map((project) => {
        const city = Array.isArray(project.city) ? project.city[0] : project.city;
        if (project.latitude != null && project.longitude != null) {
          coverage.push({
            slug: project.slug,
            name: project.name,
            latitude: project.latitude,
            longitude: project.longitude,
            city: city?.name || null,
            citySlug: city?.slug || null,
            country: city?.country || null,
          });
        }
        const image = imageByProject.get(project.id);
        return {
          id: project.id,
          slug: project.slug,
          name: project.name,
          architect: project.architect,
          city: city?.name || null,
          style: project.style,
          category: project.category,
          updated_at: project.updated_at,
          image: image?.src || null,
          imageAlt: image?.alt || null,
        };
      });
      setSlides(selectRecentSlides((projects || []).map((project) => ({
        slug: project.slug,
        name: project.name,
        created_at: project.created_at,
        images: imagesByProject.get(project.id) || [],
      }))));
      setPins(coverage);
      setEntries(architectEntries(sources));
      setStories((posts || []) as DirectoryStory[]);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { entries, stories, slides, pins, ready };
}
