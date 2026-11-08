import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteLayout from "@/components/site/SiteLayout";
import SEO from "@/components/site/SEO";
import RecentBuildingsCarousel from "@/components/site/RecentBuildingsCarousel";
import ResearchCoverageMap, { type CoveragePin } from "@/components/site/ResearchCoverageMap";
import {
  DIRECTORY_CATEGORIES,
  architectEntries,
  directoryCategory,
  filterDirectoryEntries,
  readMinutes,
  usableDirectoryImage,
  type DirectoryEntry,
  type DirectorySlug,
} from "@/lib/directory";
import { selectRecentSlides, type BuildingSlide, type RecentImageInput } from "@/lib/recentBuildings";

const PAGE_SIZE = 8;

interface Story {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  hero_image_url: string | null;
  body: string | null;
}

export default function Directory() {
  const [params, setParams] = useSearchParams();
  const requested = directoryCategory(params.get("category"));
  const tab = requested?.slug || "all";
  const query = params.get("q") || "";
  const [draft, setDraft] = useState(query);
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [slides, setSlides] = useState<BuildingSlide[]>([]);
  const [pins, setPins] = useState<CoveragePin[]>([]);
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(PAGE_SIZE);

  useEffect(() => {
    setDraft(query);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: projects } = await supabase
        .from("projects")
        .select("id, slug, name, architect, created_at, updated_at, latitude, longitude, city:cities(name, slug, country)")
        .eq("status", "published");
      const { data: images } = await supabase
        .from("project_images")
        .select("project_id, alt, storage_path, is_hero, position, author, license, license_url, kind")
        .order("position");
      const { data: posts } = await supabase
        .from("posts")
        .select("id, slug, title, excerpt, category, hero_image_url, body")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(4);
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
      setStories((posts || []) as Story[]);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const asked = Boolean(query.trim()) || Boolean(requested);
  const visible = useMemo(
    () => (asked ? filterDirectoryEntries(entries, { query, category: tab }) : []),
    [asked, entries, query, tab],
  );
  const showCredits = asked && (tab === "all" || tab === "architects");

  useEffect(() => {
    setShown(PAGE_SIZE);
  }, [query, tab]);

  const writeParams = (next: { category?: DirectorySlug | "all"; q?: string }) => {
    const category = next.category ?? tab;
    const q = next.q ?? query;
    const nextParams = new URLSearchParams(params);
    if (category === "all") nextParams.delete("category");
    else nextParams.set("category", category);
    if (q.trim()) nextParams.set("q", q.trim());
    else nextParams.delete("q");
    setParams(nextParams, { replace: true });
  };

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    writeParams({ q: draft });
  };

  const label = requested?.label || "Directory";
  const lead = stories[0];
  const restStories = stories.slice(1, 4);

  return (
    <SiteLayout>
      <SEO
        title={`${label} - Siana Architecture`}
        description="Search architect credits on published buildings. Interior designers, product manufacturers, designers, tools, and marketing agencies have no listings yet."
        canonical="https://sianaarchitecture.com/directory"
      />
      <section className="vogue-titles home-paper border-b border-ink/10" style={{ paddingTop: 76 }}>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-6 lg:py-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 lg:items-center">
          <div className="min-w-0">
            <p className="font-mono uppercase text-warm-gray mb-3" style={{ fontSize: 12, letterSpacing: "0.16em" }}>Directory</p>
            <h1 className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(2rem, 3.4vw, 3.15rem)", lineHeight: 1.08 }}>
              <span className="block">Find the people</span>
              <span className="block">and tools behind architecture.</span>
            </h1>
            <p className="mt-4 max-w-md font-body text-ink-soft text-[16px] leading-relaxed">
              Architect credits from published buildings. A shared credit stays one line.
            </p>
            <form role="search" onSubmit={onSearch} className="mt-6 max-w-md">
              <label htmlFor="directory-search" className="font-body text-ink" style={{ fontSize: 14 }}>
                Search
              </label>
              <div className="mt-1 flex items-center gap-4 border-b border-ink/40">
                <input
                  id="directory-search"
                  name="q"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  aria-label="Search architect credits, buildings, or cities"
                  placeholder="Credits, buildings, or cities"
                  className="min-w-0 flex-1 h-12 bg-transparent font-body text-[16px] text-ink placeholder:text-ink-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]"
                />
                <button
                  type="submit"
                  className="inline-flex h-12 shrink-0 items-center gap-2 font-body text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]"
                  style={{ fontSize: 16 }}
                >
                  Search
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
            </form>
            {query && (
              <button
                type="button"
                onClick={() => writeParams({ q: "" })}
                className="mt-3 font-body text-ink underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]"
                style={{ fontSize: 15 }}
              >
                Clear search
              </button>
            )}
          </div>
          <RecentBuildingsCarousel slides={slides} />
        </div>
      </section>

      <div className="vogue-titles home-paper pb-8">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
          <section aria-labelledby="directory-categories" className="mt-8 lg:mt-6">
          <h2 id="directory-categories" className="sr-only">Browse by category</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DIRECTORY_CATEGORIES.map((category) => {
              const selected = tab === category.slug;
              return (
                <li key={category.slug}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => writeParams({ category: category.slug })}
                    className={`w-full text-left border bg-paper px-5 py-5 flex items-center gap-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))] ${selected ? "border-ink" : "border-ink/15 hover:border-ink"}`}
                  >
                    <CategoryIcon slug={category.slug} />
                    <span className="block font-display text-ink" style={{ fontSize: "1.35rem" }}>{category.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          </section>

          {asked && (
            <div id="directory-panel" className="pt-14">
              <h2 id="directory-results-heading" className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.5rem)", lineHeight: 1.1 }}>
                {showCredits ? "Architects behind the buildings" : label}
              </h2>
              {showCredits && (
                <p className="mt-3 max-w-2xl font-body text-ink-soft text-[16px] leading-relaxed">
                  These lines are copied from the architect field on published buildings. They are not checked business profiles, and a shared credit is not split into separate people.
                </p>
              )}

              {!ready ? (
                <p className="mt-8 font-body text-ink-soft">Loading the directory.</p>
              ) : !showCredits ? (
                <p className="mt-8 font-body text-ink-soft text-[16px]">No listings yet.</p>
              ) : visible.length === 0 ? (
                <p className="mt-8 font-body text-ink-soft text-[16px]">No architect credits match that search.</p>
              ) : (
                <>
                  <ul className="mt-8 border-b border-ink/15">
                    {visible.slice(0, shown).map((entry) => (
                      <li key={entry.id} className="border-t border-ink/15 py-4">
                        <CreditCard entry={entry} compact />
                      </li>
                    ))}
                  </ul>
                  {shown < visible.length && (
                    <button
                      type="button"
                      onClick={() => setShown((count) => count + PAGE_SIZE)}
                      className="mt-6 font-mono uppercase text-ink border-b border-ink pb-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]"
                      style={{ fontSize: 12, letterSpacing: "0.14em" }}
                    >
                      Show more
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          <section className="mt-16" aria-labelledby="directory-coverage">
            <h2 id="directory-coverage" className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.5rem)", lineHeight: 1.1 }}>
              Where the research is
            </h2>
            <p className="mt-3 max-w-2xl font-body text-ink-soft text-[16px] leading-relaxed">
              Published buildings with a recorded location. The filters use the countries and cities already on those entries.
            </p>
            <div className="mt-6">
              <ResearchCoverageMap pins={pins} />
            </div>
          </section>

          <section className="mt-16 mb-8" aria-labelledby="directory-research">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 id="directory-research" className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.5rem)", lineHeight: 1.1 }}>
                Latest research
              </h2>
              <Link to="/practice" className="font-mono uppercase text-ink border-b border-ink pb-0.5 self-start" style={{ fontSize: 12, letterSpacing: "0.14em" }}>
                View all stories
              </Link>
            </div>
            {!ready ? null : !lead ? (
              <p className="mt-6 font-body text-ink-soft">Stories will appear here as they are published.</p>
            ) : (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4">
                <Link to={`/practice/${lead.slug}`} className="block border border-ink/10 bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]">
                  {storyImage(lead) && <img src={storyImage(lead)!} alt="" className="w-full h-56 object-cover" />}
                  <span className="block px-5 py-5">
                    {lead.category && <span className="font-mono uppercase text-accent-terra" style={{ fontSize: 12, letterSpacing: "0.14em" }}>{lead.category}</span>}
                    <span className="mt-2 block font-display text-ink" style={{ fontSize: "1.7rem", lineHeight: 1.15 }}>{lead.title}</span>
                    {lead.excerpt && <span className="mt-3 block font-body text-ink-soft text-[15px] leading-relaxed">{lead.excerpt}</span>}
                    {readMinutes(lead.body) ? <span className="mt-3 block font-mono text-warm-gray" style={{ fontSize: 12 }}>{readMinutes(lead.body)} min</span> : null}
                  </span>
                </Link>
                <ul className="border-t border-ink/15">
                  {restStories.map((story) => (
                    <li key={story.id} className="border-b border-ink/15">
                      <Link to={`/practice/${story.slug}`} className="block py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]">
                        {story.category && <span className="font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.12em" }}>{story.category}</span>}
                        <span className="mt-1 block font-display text-ink" style={{ fontSize: "1.25rem", lineHeight: 1.2 }}>{story.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}

function CategoryIcon({ slug }: { slug: DirectorySlug }) {
  const props = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    "aria-hidden": true as const,
    className: "shrink-0 text-ink",
  };
  if (slug === "architects") {
    return (
      <svg {...props}>
        <path d="M4 20V9.5L12 4l8 5.5V20" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }
  if (slug === "interior-designers") {
    return (
      <svg {...props}>
        <path d="M6 11h12v3H6z" />
        <path d="M7 14v5M17 14v5M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }
  if (slug === "product-manufacturers") {
    return (
      <svg {...props}>
        <path d="M4 20V10l5-3v3l6-4v4h5v10H4z" />
        <path d="M9 20v-4h3v4" />
      </svg>
    );
  }
  if (slug === "designers") {
    return (
      <svg {...props}>
        <path d="M4 20l8-14 3 3-8 14H4v-3z" />
        <path d="M13 8l3 3" />
      </svg>
    );
  }
  if (slug === "tools") {
    return (
      <svg {...props}>
        <path d="M14 6a3 3 0 0 0-4 4L4 16l4 4 6-6a3 3 0 0 0 4-4l-3 3-2-2 3-3z" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M5 10v8h10V10" />
      <path d="M8 10V7a4 4 0 0 1 8 0v1" />
      <path d="M15 13h5l-1 6h-4" />
    </svg>
  );
}

function storyImage(story: Story): string | null {
  const src = story.hero_image_url;
  if (!src || src.includes("picsum.photos")) return null;
  return src;
}

function CreditCard({ entry, compact }: { entry: DirectoryEntry; compact?: boolean }) {
  return (
    <article className={compact ? "" : "p-4"}>
      {!compact && entry.image && (
        <img src={entry.image} alt={entry.alt} className="mb-4 w-full h-40 object-cover" />
      )}
      <p className="font-mono uppercase text-accent-terra" style={{ fontSize: 12, letterSpacing: "0.14em" }}>Architect credit</p>
      <h3 className="mt-1 text-ink" style={{ fontWeight: 400, fontSize: compact ? "1.35rem" : "1.6rem", lineHeight: 1.15 }}>
        {entry.name}
      </h3>
      <ul className="mt-2 space-y-1">
        {entry.buildingsList.map((building) => (
          <li key={building.slug}>
            <Link to={`/projects/${building.slug}`} className="font-body text-ink-soft text-[15px] border-b border-transparent hover:border-ink hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]">
              {building.name}{building.city ? `, ${building.city}` : ""}
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
