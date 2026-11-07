import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteLayout from "@/components/site/SiteLayout";
import SEO from "@/components/site/SEO";
import DirectoryTabs, { type DirectoryTab } from "@/components/site/DirectoryTabs";
import { architectEntries, directoryCategory, usableDirectoryImage, type DirectoryEntry } from "@/lib/directory";

export default function Directory() {
  const [params, setParams] = useSearchParams();
  const requested = directoryCategory(params.get("category"));
  const tab: DirectoryTab = requested?.slug || "all";
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: projects } = await supabase
        .from("projects")
        .select("id, slug, name, architect, updated_at")
        .eq("status", "published");
      const { data: images } = await supabase
        .from("project_images")
        .select("project_id, alt, storage_path, is_hero, position")
        .order("position");
      if (cancelled) return;
      const imageByProject = new Map<string, { src: string; alt: string | null }>();
      (images || []).forEach((image) => {
        const src = usableDirectoryImage(image.storage_path);
        if (!src || !image.project_id) return;
        const current = imageByProject.get(image.project_id);
        if (!current || image.is_hero) imageByProject.set(image.project_id, { src, alt: image.alt });
      });
      setEntries(architectEntries((projects || []).map((project) => {
        const image = imageByProject.get(project.id);
        return {
          id: project.id,
          slug: project.slug,
          name: project.name,
          architect: project.architect,
          updated_at: project.updated_at,
          image: image?.src || null,
          imageAlt: image?.alt || null,
        };
      })));
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(
    () => (tab === "all" || tab === "architects" ? entries : []),
    [tab, entries],
  );

  const select = (next: DirectoryTab) => {
    if (next === "all") params.delete("category");
    else params.set("category", next);
    setParams(params, { replace: true });
  };

  const label = requested?.label || "Directory";

  return (
    <SiteLayout>
      <SEO
        title={`${label} - Siana Architecture`}
        description="Architects credited on published buildings. Other directory categories will appear when there are listings to show."
        canonical="https://sianaarchitecture.com/directory"
      />
      <div className="pt-28 md:pt-36 pb-20 mx-auto max-w-[1100px] px-6 lg:px-10">
        <p className="font-mono uppercase text-warm-gray mb-4" style={{ fontSize: 12, letterSpacing: "0.18em" }}>Directory</p>
        <h1 className="text-ink" style={{ fontFamily: "'Adobe Garamond Pro', 'EB Garamond', Garamond, Georgia, serif", fontWeight: 400, fontSize: "clamp(2.4rem, 5vw, 4rem)", lineHeight: 0.98 }}>
          {label}
        </h1>
        <div className="mt-8">
          <DirectoryTabs active={tab} counts={{ all: entries.length, architects: entries.length }} onChange={select} />
        </div>
        <div id="directory-panel" role="tabpanel" aria-labelledby={`directory-tab-${tab}`} className="pt-8">
          {!ready ? (
            <p className="font-body text-ink-soft">Loading the directory.</p>
          ) : visible.length === 0 ? (
            <p className="font-body text-ink-soft text-[16px]">Nothing listed here yet.</p>
          ) : (
            <ul className="border-b border-ink/15">
              {visible.map((entry) => (
                <li key={entry.id} className="border-t border-ink/15">
                  <Link to={entry.href} className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-4 items-center py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]">
                    {entry.image ? (
                      <img src={entry.image} alt={entry.alt} className="w-full h-20 object-cover bg-paper-mid" />
                    ) : (
                      <span className="hidden sm:block h-20 bg-paper-mid" />
                    )}
                    <span>
                      <span className="block text-ink" style={{ fontFamily: "'Adobe Garamond Pro', 'EB Garamond', Garamond, Georgia, serif", fontSize: "1.45rem", lineHeight: 1.15 }}>{entry.name}</span>
                      <span className="block mt-1 font-body text-ink-soft text-[14px]">{entry.meta}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
