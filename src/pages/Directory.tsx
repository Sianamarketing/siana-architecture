import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteLayout from "@/components/site/SiteLayout";
import SEO from "@/components/site/SEO";
import DirectoryTabs, { type DirectoryTab } from "@/components/site/DirectoryTabs";
import {
  DIRECTORY_CATEGORIES,
  architectEntries,
  directoryCategory,
  filterDirectoryEntries,
  readMinutes,
  usableDirectoryImage,
  type DirectoryEntry,
} from "@/lib/directory";

const serif = "'Adobe Garamond Pro', 'EB Garamond', Garamond, Georgia, serif";

interface Story {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  hero_image_url: string | null;
  body: string | null;
}

interface CityLink {
  slug: string;
  name: string;
  buildings: number;
}

export default function Directory() {
  const [params, setParams] = useSearchParams();
  const requested = directoryCategory(params.get("category"));
  const tab: DirectoryTab = requested?.slug || "all";
  const query = params.get("q") || "";
  const [draft, setDraft] = useState(query);
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [cities, setCities] = useState<CityLink[]>([]);
  const [projectCount, setProjectCount] = useState(0);
  const [stories, setStories] = useState<Story[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDraft(query);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: projects } = await supabase
        .from("projects")
        .select("id, slug, name, architect, updated_at, city:cities(name, slug)")
        .eq("status", "published");
      const { data: images } = await supabase
        .from("project_images")
        .select("project_id, alt, storage_path, is_hero, position")
        .order("position");
      const { data: posts } = await supabase
        .from("posts")
        .select("id, slug, title, excerpt, category, hero_image_url, body")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(4);
      if (cancelled) return;
      const imageByProject = new Map<string, { src: string; alt: string | null }>();
      (images || []).forEach((image) => {
        const src = usableDirectoryImage(image.storage_path);
        if (!src || !image.project_id) return;
        const current = imageByProject.get(image.project_id);
        if (!current || image.is_hero) imageByProject.set(image.project_id, { src, alt: image.alt });
      });
      const cityCounts = new Map<string, CityLink>();
      const sources = (projects || []).map((project) => {
        const city = Array.isArray(project.city) ? project.city[0] : project.city;
        if (city?.slug && city.name) {
          const current = cityCounts.get(city.slug) || { slug: city.slug, name: city.name, buildings: 0 };
          current.buildings += 1;
          cityCounts.set(city.slug, current);
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
      setProjectCount(sources.length);
      setCities([...cityCounts.values()].sort((a, b) => b.buildings - a.buildings || a.name.localeCompare(b.name)));
      setEntries(architectEntries(sources));
      setStories((posts || []) as Story[]);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(
    () => filterDirectoryEntries(entries, { query, category: tab }),
    [entries, query, tab],
  );
  const showCredits = tab === "all" || tab === "architects";
  const featured = !query && showCredits ? visible.slice(0, 4) : [];

  const writeParams = (next: { category?: DirectoryTab; q?: string }) => {
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
      <div className="home-paper pt-28 md:pt-36 pb-8">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
          <p className="font-mono uppercase text-warm-gray mb-4" style={{ fontSize: 12, letterSpacing: "0.18em" }}>Directory</p>
          <h1 className="text-ink max-w-[16ch]" style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(2.6rem, 5.4vw, 4.4rem)", lineHeight: 0.96 }}>
            Find the people and tools behind architecture.
          </h1>
          <p className="mt-5 max-w-xl font-body text-ink-soft text-[17px] leading-relaxed">
            Architect credits are taken from published buildings. A credit can name more than one person, and it stays as one line. Other categories have no listings yet.
          </p>

          <form role="search" onSubmit={onSearch} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-3xl">
            <label htmlFor="directory-search" className="sr-only">Search architect credits, buildings, or cities</label>
            <input
              id="directory-search"
              name="q"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Credits, buildings, or cities"
              className="flex-1 h-14 px-4 bg-paper border border-ink/20 text-ink font-body text-[16px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
            />
            <button
              type="submit"
              className="h-14 px-6 bg-accent-terra text-white font-mono uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]"
              style={{ fontSize: 13, letterSpacing: "0.14em" }}
            >
              Search
            </button>
          </form>
          {query && (
            <button
              type="button"
              onClick={() => writeParams({ q: "" })}
              className="mt-3 font-mono uppercase text-ink border-b border-ink/40 pb-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]"
              style={{ fontSize: 12, letterSpacing: "0.12em" }}
            >
              Clear search
            </button>
          )}

          <dl className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 border-y border-ink/10 py-6">
            <div>
              <dt className="font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.14em" }}>Architect credits</dt>
              <dd className="mt-1 text-ink" style={{ fontFamily: serif, fontSize: "2rem" }}>{ready ? entries.length : "…"}</dd>
            </div>
            <div>
              <dt className="font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.14em" }}>Published buildings</dt>
              <dd className="mt-1 text-ink" style={{ fontFamily: serif, fontSize: "2rem" }}>{ready ? projectCount : "…"}</dd>
            </div>
            <div>
              <dt className="font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.14em" }}>Cities</dt>
              <dd className="mt-1 text-ink" style={{ fontFamily: serif, fontSize: "2rem" }}>{ready ? cities.length : "…"}</dd>
            </div>
          </dl>

          <h2 className="mt-14 text-ink" style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>
            Browse by category
          </h2>
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <li>
              <button type="button" onClick={() => writeParams({ category: "all" })} className="w-full text-left border border-ink/15 bg-paper px-5 py-5 hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]">
                <span className="block font-display text-ink" style={{ fontSize: "1.45rem" }}>All</span>
                <span className="mt-1 block font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.12em" }}>{entries.length} architect credits</span>
              </button>
            </li>
            {DIRECTORY_CATEGORIES.map((category) => {
              const count = category.slug === "architects" ? entries.length : 0;
              return (
                <li key={category.slug}>
                  <button
                    type="button"
                    onClick={() => writeParams({ category: category.slug })}
                    className="w-full text-left border border-ink/15 bg-paper px-5 py-5 hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
                  >
                    <span className="block font-display text-ink" style={{ fontSize: "1.45rem" }}>{category.label}</span>
                    <span className="mt-1 block font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.12em" }}>
                      {count > 0 ? `${count} credits` : "No listings yet"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-14">
            <DirectoryTabs active={tab} counts={{ all: entries.length, architects: entries.length }} onChange={(next) => writeParams({ category: next })} labelledBy="directory-results-heading" />
          </div>

          <div id="directory-panel" role="tabpanel" aria-labelledby={`directory-tab-${tab}`} className="pt-8">
            <h2 id="directory-results-heading" className="text-ink" style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
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
                {featured.length > 0 && (
                  <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {featured.map((entry) => (
                      <li key={entry.id} className="border border-ink/10 bg-paper">
                        <CreditCard entry={entry} />
                      </li>
                    ))}
                  </ul>
                )}
                <ul className="mt-8 border-b border-ink/15">
                  {(query ? visible : visible.slice(featured.length)).map((entry) => (
                    <li key={entry.id} className="border-t border-ink/15 py-4">
                      <CreditCard entry={entry} compact />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {cities.length > 0 && (
            <section className="mt-16" aria-labelledby="directory-cities">
              <h2 id="directory-cities" className="text-ink" style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
                Buildings by city
              </h2>
              <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cities.map((city) => (
                  <li key={city.slug}>
                    <Link to={`/cities/${city.slug}`} className="block border border-ink/15 bg-paper px-5 py-4 hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]">
                      <span className="block font-display text-ink" style={{ fontSize: "1.35rem" }}>{city.name}</span>
                      <span className="mt-1 block font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.12em" }}>
                        {city.buildings} {city.buildings === 1 ? "building" : "buildings"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-16 mb-8" aria-labelledby="directory-research">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 id="directory-research" className="text-ink" style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
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
      <h3 className="mt-1 text-ink" style={{ fontFamily: serif, fontWeight: 400, fontSize: compact ? "1.35rem" : "1.6rem", lineHeight: 1.15 }}>
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
