import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteLayout from "@/components/site/SiteLayout";
import SEO from "@/components/site/SEO";
import EditorialButton from "@/components/site/EditorialButton";
import {
  DISCOVER_DESCRIPTION,
  DISCOVER_PAGE_SIZE,
  DISCOVER_TITLE,
  discoverTilesForProjects,
  filterDiscoverTiles,
  type DiscoverGraphicRow,
  type DiscoverImageRow,
  type DiscoverKind,
  type DiscoverProject,
  type DiscoverTile,
} from "@/lib/discoverFeed";

const serif = "'Adobe Garamond Pro', 'EB Garamond', Garamond, Georgia, serif";
const KINDS: { id: "all" | DiscoverKind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "building", label: "Buildings" },
  { id: "photo", label: "Photos" },
  { id: "sheet", label: "Sheets" },
];

interface FacetCity {
  id: string;
  name: string;
  slug: string;
}

const PROJECT_FIELDS = "id, slug, name, style, year_completed, featured, updated_at, hero_image_url, cover_image_url, why_section, city_id, city:cities(name, slug)";
const IMAGE_FIELDS = "id, project_id, storage_path, original_url, source_url, alt, caption, width, height, position, is_hero, author, license, license_url";
const GRAPHIC_FIELDS = "id, project_id, slug, kind, alt, caption, card_path, storage_path, svg_path, downloadable, download_path, download_label, position";

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`shrink-0 h-10 px-3.5 font-mono uppercase border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))] ${
        pressed ? "bg-ink text-paper border-ink" : "bg-paper text-ink border-ink/15 hover:border-ink/40"
      }`}
      style={{ fontSize: 13, letterSpacing: "0.12em" }}
    >
      {children}
    </button>
  );
}

function DiscoverCard({ tile }: { tile: DiscoverTile }) {
  return (
    <Link
      to={tile.href}
      className="discover-card block bg-paper border border-ink/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
    >
      {tile.image && (
        <img
          src={tile.image}
          alt={tile.alt}
          width={tile.width || undefined}
          height={tile.height || undefined}
          className="block w-full h-auto bg-paper-mid"
          loading="lazy"
        />
      )}
      <div className="px-3.5 py-3">
        {tile.kind === "sheet" && tile.kicker && (
          <p className="font-mono uppercase text-accent-terra mb-1" style={{ fontSize: 13, letterSpacing: "0.14em" }}>
            {tile.kicker}
          </p>
        )}
        {tile.kind === "building" ? (
          <h2 className="text-ink" style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(1.25rem, 1.6vw, 1.55rem)", lineHeight: 1.15 }}>
            {tile.title}
          </h2>
        ) : tile.kind === "sheet" ? (
          <h3 className="text-ink" style={{ fontFamily: serif, fontWeight: 400, fontSize: "1.2rem", lineHeight: 1.2 }}>
            {tile.title}
          </h3>
        ) : (
          tile.caption && (
            <p className="font-body text-ink text-[15px] leading-relaxed">{tile.caption}</p>
          )
        )}
        {tile.kind === "building" && tile.meta && (
          <p className="mt-2 font-mono text-warm-gray" style={{ fontSize: 13, letterSpacing: "0.04em", lineHeight: 1.4 }}>
            {tile.meta}
          </p>
        )}
        {tile.kind === "photo" && (
          <p className="mt-2 font-mono uppercase text-ink-soft" style={{ fontSize: 13, letterSpacing: "0.12em" }}>
            {tile.buildingName}
          </p>
        )}
        {tile.kind === "sheet" && (
          <p className="mt-2 font-mono text-warm-gray" style={{ fontSize: 13, letterSpacing: "0.04em" }}>
            {tile.buildingName}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function Discover() {
  const [kind, setKind] = useState<"all" | DiscoverKind>("all");
  const [citySlug, setCitySlug] = useState<string | null>(null);
  const [style, setStyle] = useState<string | null>(null);
  const [cities, setCities] = useState<FacetCity[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  const [tiles, setTiles] = useState<DiscoverTile[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cityId = cities.find((city) => city.slug === citySlug)?.id ?? null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("projects")
        .select("city_id, style, city:cities(id, name, slug)")
        .eq("status", "published");
      if (cancelled || !data) return;
      const cityMap = new Map<string, FacetCity>();
      const styleSet = new Set<string>();
      data.forEach((row) => {
        const city = Array.isArray(row.city) ? row.city[0] : row.city;
        if (city?.id && city.name && city.slug) cityMap.set(city.id, { id: city.id, name: city.name, slug: city.slug });
        if (row.style?.trim()) styleSet.add(row.style.trim());
      });
      setCities([...cityMap.values()].sort((a, b) => a.name.localeCompare(b.name)));
      setStyles([...styleSet].sort((a, b) => a.localeCompare(b)));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      let query = supabase
        .from("projects")
        .select(PROJECT_FIELDS)
        .eq("status", "published")
        .order("featured", { ascending: false })
        .order("updated_at", { ascending: false })
        .range(offset, offset + DISCOVER_PAGE_SIZE - 1);
      if (cityId) query = query.eq("city_id", cityId);
      if (style) query = query.eq("style", style);
      const { data, error: projectError } = await query;
      if (cancelled) return;
      if (projectError || !data) {
        setError("The feed could not be loaded.");
        setLoading(false);
        return;
      }
      const projects = data as unknown as DiscoverProject[];
      const ids = projects.map((project) => project.id);
      let images: DiscoverImageRow[] = [];
      let graphics: DiscoverGraphicRow[] = [];
      if (ids.length) {
        const [imageRes, graphicRes] = await Promise.all([
          supabase.from("project_images").select(IMAGE_FIELDS).in("project_id", ids).order("position"),
          supabase.from("project_graphics").select(GRAPHIC_FIELDS).in("project_id", ids).order("position"),
        ]);
        if (cancelled) return;
        images = (imageRes.data || []) as unknown as DiscoverImageRow[];
        graphics = (graphicRes.data || []) as unknown as DiscoverGraphicRow[];
      }
      const next = discoverTilesForProjects(projects, images, graphics, import.meta.env.VITE_SUPABASE_URL);
      setTiles((current) => (offset === 0 ? next : [...current, ...next]));
      setHasMore(projects.length === DISCOVER_PAGE_SIZE);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [offset, cityId, style]);

  const visible = useMemo(
    () => filterDiscoverTiles(tiles, { kind, citySlug, style }),
    [tiles, kind, citySlug, style],
  );

  const changePlace = (nextCity: string | null, nextStyle: string | null) => {
    setTiles([]);
    setOffset(0);
    setHasMore(false);
    setCitySlug(nextCity);
    setStyle(nextStyle);
  };

  return (
    <SiteLayout>
      <SEO title={DISCOVER_TITLE} description={DISCOVER_DESCRIPTION} canonical="https://sianaarchitecture.com/discover" />
      <div className="bg-paper-warm pt-24 md:pt-28">
        <header className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 pb-6">
          <p className="font-mono uppercase text-accent-terra mb-3" style={{ fontSize: 13, letterSpacing: "0.18em" }}>
            Discover
          </p>
          <h1 className="text-ink max-w-[16ch]" style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(2.2rem, 4vw, 3.4rem)", lineHeight: 1.02 }}>
            Browse the atlas
          </h1>
          <p className="mt-4 max-w-xl font-body text-ink-soft text-[16px] leading-relaxed">
            {DISCOVER_DESCRIPTION}
          </p>
        </header>

        <div className="sticky top-[76px] z-30 bg-paper-warm/95 backdrop-blur border-y border-ink/10">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 py-3 flex flex-col gap-2.5">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Tile type">
              {KINDS.map((item) => (
                <Chip key={item.id} pressed={kind === item.id} onClick={() => setKind(item.id)}>
                  {item.label}
                </Chip>
              ))}
            </div>
            {(cities.length > 1 || styles.length > 1) && (
              <div className="flex flex-wrap gap-2" role="group" aria-label="City and style">
                {cities.length > 1 && (
                  <Chip pressed={!citySlug} onClick={() => changePlace(null, style)}>
                    All cities
                  </Chip>
                )}
                {cities.length > 1 && cities.map((city) => (
                  <Chip key={city.id} pressed={citySlug === city.slug} onClick={() => changePlace(city.slug, style)}>
                    {city.name}
                  </Chip>
                ))}
                {styles.length > 1 && (
                  <Chip pressed={!style} onClick={() => changePlace(citySlug, null)}>
                    All styles
                  </Chip>
                )}
                {styles.length > 1 && styles.map((item) => (
                  <Chip key={item} pressed={style === item} onClick={() => changePlace(citySlug, item)}>
                    {item}
                  </Chip>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 py-6 md:py-8">
          {visible.length > 0 && (
            <section className="discover-masonry" aria-label="Discover feed">
              {visible.map((tile) => (
                <DiscoverCard key={tile.id} tile={tile} />
              ))}
            </section>
          )}

          {!loading && visible.length === 0 && (
            <p className="font-body text-ink-soft text-[16px] py-16 text-center">
              {error || "Nothing in this view yet."}
            </p>
          )}

          {loading && visible.length === 0 && (
            <div className="discover-masonry" aria-hidden="true">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="mb-4 bg-paper-mid animate-pulse" style={{ height: index % 2 ? 280 : 200 }} />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center pt-8 pb-4">
              <EditorialButton type="button" onClick={() => setOffset((value) => value + DISCOVER_PAGE_SIZE)} disabled={loading} arrow>
                {loading ? "Loading" : "Load more"}
              </EditorialButton>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
