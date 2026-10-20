import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import SiteLayout from "@/components/site/SiteLayout";
import SEO from "@/components/site/SEO";
import BuildingEntry, { type BuildingProjectData } from "@/components/site/BuildingEntry";

type ProjectImageRow = Database["public"]["Tables"]["project_images"]["Row"];
type ProjectLinkRow = Database["public"]["Tables"]["project_links"]["Row"];
type ProjectGraphicRow = Database["public"]["Tables"]["project_graphics"]["Row"];

const serif = "'Adobe Garamond Pro', 'EB Garamond', Garamond, Georgia, serif";

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<BuildingProjectData | null>(null);
  const [images, setImages] = useState<ProjectImageRow[] | null>(null);
  const [links, setLinks] = useState<ProjectLinkRow[] | null>(null);
  const [graphics, setGraphics] = useState<ProjectGraphicRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("projects")
        .select("*, city:cities(name, slug)")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (cancelled) return;
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const row = data as BuildingProjectData;
      setProject(row);
      const [imageRes, linkRes, graphicRes] = await Promise.all([
        supabase.from("project_images").select("*").eq("project_id", row.id).order("position"),
        supabase.from("project_links").select("*").eq("project_id", row.id).order("position"),
        supabase.from("project_graphics").select("*").eq("project_id", row.id).order("position"),
      ]);
      if (cancelled) return;
      setImages(imageRes.error ? [] : imageRes.data ?? []);
      setLinks(linkRes.error ? [] : linkRes.data ?? []);
      setGraphics(graphicRes.error ? [] : graphicRes.data ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (notFound) {
    return (
      <SiteLayout>
        <div className="pt-40 pb-32 mx-auto max-w-[1280px] px-6 text-center">
          <h1 className="text-ink" style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>
            Project not found
          </h1>
          <Link to="/" className="font-mono uppercase text-ink-soft hover:text-ink mt-6 inline-block" style={{ fontSize: 12, letterSpacing: "0.16em" }}>
            ← Home
          </Link>
        </div>
      </SiteLayout>
    );
  }

  if (loading || !project) {
    return (
      <SiteLayout>
        <div className="min-h-screen bg-paper-warm">
          <div className="relative h-[80vh] min-h-[560px] overflow-hidden bg-paper-mid animate-pulse" />
        </div>
      </SiteLayout>
    );
  }

  const description = project.meta_description || project.tldr || project.tagline;
  const image = project.og_image_url || images?.[0]?.original_url || project.hero_image_url || project.cover_image_url;

  return (
    <SiteLayout>
      <SEO
        title={project.meta_title || `${project.name} — Siana Architecture`}
        description={description}
        image={image}
        type="article"
      />
      <BuildingEntry
        project={project}
        imageRows={images}
        linkRows={links}
        graphicRows={graphics}
        supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
      />
    </SiteLayout>
  );
}
