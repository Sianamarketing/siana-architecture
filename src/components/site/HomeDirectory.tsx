import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DirectoryTabs, { type DirectoryTab } from "@/components/site/DirectoryTabs";
import Reveal from "@/components/site/Reveal";
import EditorialButton from "@/components/site/EditorialButton";
import { architectEntries, usableDirectoryImage, type DirectoryEntry } from "@/lib/directory";

/**
 * Replaces Field Notes. The card grid is the same shape as that section:
 * one large card and up to four smaller ones. The records are architect
 * credits from published buildings. Other categories have no listings yet.
 */
export default function HomeDirectory() {
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [tab, setTab] = useState<DirectoryTab>("all");
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
  const featured = visible[0];
  const rest = visible.slice(1, 5);
  const counts = { all: entries.length, architects: entries.length };

  return (
    <section id="directory" className="bg-transparent py-16 md:py-24 border-t border-ink/10">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-16 items-end">
          <div>
            <p id="directory-heading" className="font-mono uppercase text-warm-gray mb-4" style={{ fontSize: 12, letterSpacing: "0.18em" }}>
              03 / The directory
            </p>
            <h2 className="text-ink" style={{ fontFamily: "'Adobe Garamond Pro', 'EB Garamond', Garamond, Georgia, serif", fontWeight: 400, fontSize: "clamp(2.4rem, 4.6vw, 4.2rem)", lineHeight: 0.96 }}>
              Find your people
              <span className="block">and tools.</span>
            </h2>
          </div>
          <p className="font-body text-ink-soft text-[16px] md:text-[17px] leading-relaxed max-w-xl lg:justify-self-end">
            Architects, interior designers, product makers, design studios, tools, and marketing agencies working across architecture and design.
          </p>
        </div>

        <DirectoryTabs active={tab} counts={counts} onChange={setTab} labelledBy="directory-heading" />

        <div id="directory-panel" role="tabpanel" aria-labelledby={`directory-tab-${tab}`} className="pt-8">
          {!ready ? (
            <p className="font-body text-ink-soft">Loading the directory.</p>
          ) : visible.length === 0 ? (
            <p className="font-body text-ink-soft text-[16px] py-10">Nothing listed here yet.</p>
          ) : (
            <div
              className="grid grid-cols-1 gap-1 md:grid-cols-[2fr_1fr_1fr]"
              style={{ gridAutoRows: "minmax(220px, auto)" }}
            >
              <Reveal className="md:row-span-2">
                <DirectoryCard entry={featured} large />
              </Reveal>
              {rest.map((entry, index) => (
                <Reveal key={entry.id} delay={120 + index * 110}>
                  <DirectoryCard entry={entry} />
                </Reveal>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center pt-12">
          <EditorialButton to={tab === "all" ? "/directory" : `/directory?category=${tab}`} arrow variant="muted">
            Browse the directory
          </EditorialButton>
        </div>
      </div>
    </section>
  );
}

function DirectoryCard({ entry, large }: { entry: DirectoryEntry; large?: boolean }) {
  const minHeight = large ? "460px" : "220px";
  return (
    <Link
      to={entry.href}
      className="group relative overflow-hidden bg-paper-warm border border-ink/10 block h-full lift"
      style={{ minHeight }}
    >
      {entry.image ? (
        <img src={entry.image} alt={entry.alt} className="photo-thumb w-full h-full object-cover" style={{ minHeight }} loading="lazy" />
      ) : (
        <div className="w-full h-full" style={{ minHeight }} />
      )}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          padding: large ? "2.5rem 1.4rem 1.2rem" : "2rem 1.2rem 1rem",
          background: entry.image ? "linear-gradient(transparent, rgba(17,17,16,0.88))" : "transparent",
        }}
      >
        <p className="font-mono uppercase mb-1" style={{ fontSize: 12, letterSpacing: "0.16em", color: entry.image ? "#ffe4dc" : "hsl(var(--accent))" }}>
          Architect
        </p>
        <h3 className={`font-display ${entry.image ? "text-white" : "text-ink"}`} style={{ fontSize: large ? "1.4rem" : "1rem", letterSpacing: "-0.01em" }}>
          {entry.name}
        </h3>
        <p className={`mt-1 font-body ${entry.image ? "text-white/80" : "text-ink-soft"}`} style={{ fontSize: 14 }}>
          {entry.meta}
        </p>
      </div>
    </Link>
  );
}
