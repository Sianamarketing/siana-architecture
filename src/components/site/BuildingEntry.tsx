import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import EditorialButton from "@/components/site/EditorialButton";
import Reveal from "@/components/site/Reveal";
import RichHtml from "@/components/site/RichHtml";
import {
  buildStatRows,
  collectImages,
  formatCoord,
  graphicBySlug,
  graphicsFromRows,
  groupLinks,
  hasText,
  heroMeta,
  isHtml,
  paragraphsOf,
  parseFacts,
  parseWhy,
  posterGraphic,
  resolveMediaUrl,
  statEvents,
  type BuildingGraphic,
  type BuildingImage,
  type BuildingLink,
  type StatRow,
} from "@/lib/buildingEntry";

export interface BuildingProjectData {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  architect: string | null;
  year_completed: number | null;
  category: string | null;
  style: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  hero_image_url: string | null;
  cover_image_url: string | null;
  gallery: unknown;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  siana_pick?: string | null;
  analysis?: string | null;
  tldr?: string | null;
  curious_facts?: unknown;
  why_section?: unknown;
  stats?: unknown;
  condition?: string | null;
  heritage_status?: string | null;
  year_listed?: number | null;
  city: { name: string; slug: string } | null;
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

interface DbLink {
  id: string;
  category: string;
  title: string;
  url: string | null;
  note: string | null;
  position: number;
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
  position: number;
}

const serif = "'Adobe Garamond Pro', 'EB Garamond', Garamond, Georgia, serif";

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="font-mono uppercase text-accent-terra mb-4" style={{ fontWeight: 600, fontSize: 13, letterSpacing: "0.2em" }}>
      {children}
    </p>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-ink mb-8 md:mb-10" style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(1.8rem, 3.2vw, 2.8rem)", lineHeight: 1.08, letterSpacing: "-0.01em" }}>
      {children}
    </h2>
  );
}

function Prose({ text }: { text: string }) {
  if (isHtml(text)) {
    return (
      <RichHtml
        html={text}
        className="font-body text-ink text-[17px] leading-[1.75] [&_p+p]:mt-6 [&_a]:underline [&_a]:underline-offset-4"
      />
    );
  }
  return (
    <div className="space-y-6">
      {paragraphsOf(text).map((paragraph) => (
        <p key={paragraph.slice(0, 48)} className="font-body text-ink text-[17px] leading-[1.75]">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function CreditLine({ image, invert = false }: { image: BuildingImage; invert?: boolean }) {
  if (!image.author && !image.license) return null;
  const linkClass = invert
    ? "underline underline-offset-4 decoration-white/40 hover:decoration-white text-white/85"
    : "underline underline-offset-4 decoration-ink/20 hover:decoration-ink hover:text-ink";
  const licenseHref = image.licenseUrl || image.sourceUrl;
  return (
    <p className={`font-mono uppercase ${invert ? "text-white/75" : "text-warm-gray"}`} style={{ fontSize: 11, letterSpacing: "0.14em", lineHeight: 1.6 }}>
      {image.author && (
        image.sourceUrl ? (
          <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {image.author}
          </a>
        ) : (
          image.author
        )
      )}
      {image.author && image.license ? <span aria-hidden="true"> · </span> : null}
      {image.license && (
        licenseHref ? (
          <a href={licenseHref} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {image.license}
          </a>
        ) : (
          image.license
        )
      )}
    </p>
  );
}

function FigureFrame({
  image,
  onOpen,
  eager,
}: {
  image: BuildingImage;
  onOpen: () => void;
  eager?: boolean;
}) {
  return (
    <figure>
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left cursor-zoom-in"
        aria-label={`Enlarge photograph: ${image.caption || image.alt}`}
      >
        <img
          src={image.url}
          alt={image.alt}
          width={image.width || undefined}
          height={image.height || undefined}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="block w-full h-auto"
        />
      </button>
      <figcaption className="mt-3 space-y-1.5">
        {image.caption && (
          <p className="text-ink-soft" style={{ fontFamily: serif, fontStyle: "italic", fontSize: 16, lineHeight: 1.4 }}>
            {image.caption}
          </p>
        )}
        <CreditLine image={image} />
      </figcaption>
    </figure>
  );
}

function Lightbox({
  images,
  index,
  onClose,
  onStep,
}: {
  images: BuildingImage[];
  index: number;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const image = images[index];
  const onCloseRef = useRef(onClose);
  const onStepRef = useRef(onStep);
  onCloseRef.current = onClose;
  onStepRef.current = onStep;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key === "ArrowRight") onStepRef.current(1);
      if (event.key === "ArrowLeft") onStepRef.current(-1);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!image) return null;
  return (
    <div className="fixed inset-0 z-50 bg-ink/95 text-white" role="dialog" aria-modal="true" aria-label="Photograph">
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 md:px-8 h-16">
        <p className="font-mono uppercase text-white/70" style={{ fontSize: 11, letterSpacing: "0.16em" }}>
          {index + 1} / {images.length}
        </p>
        <button type="button" onClick={onClose} className="font-mono uppercase text-white" style={{ fontSize: 12, letterSpacing: "0.18em" }}>
          Close
        </button>
      </div>
      <button type="button" aria-label="Previous photograph" onClick={() => onStep(-1)} className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 h-12 w-12 text-white text-2xl">
        ‹
      </button>
      <button type="button" aria-label="Next photograph" onClick={() => onStep(1)} className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 h-12 w-12 text-white text-2xl">
        ›
      </button>
      <div className="h-full flex flex-col items-center justify-center px-14 md:px-24 pt-16 pb-28">
        <img src={image.url} alt={image.alt} className="max-h-full max-w-full object-contain" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-6 md:px-24 pb-6 pt-10 bg-gradient-to-t from-ink via-ink/80 to-transparent">
        {image.caption && <p className="text-white/90 mb-1" style={{ fontFamily: serif, fontStyle: "italic", fontSize: 16 }}>{image.caption}</p>}
        <CreditLine image={image} invert />
      </div>
    </div>
  );
}

function Diagram({ graphic, supabaseUrl }: { graphic: BuildingGraphic; supabaseUrl?: string | null }) {
  const svg = resolveMediaUrl(graphic.svgPath, { supabaseUrl });
  const png = resolveMediaUrl(graphic.storagePath, { supabaseUrl });
  const [src, setSrc] = useState(svg || png);
  if (!src) return null;
  return (
    <figure className="mt-8 md:mt-10">
      <img
        src={src}
        alt={graphic.alt || ""}
        className="block w-full h-auto"
        onError={() => {
          if (png && src !== png) setSrc(png);
        }}
      />
      {graphic.caption && (
        <figcaption className="mt-3 text-ink-soft font-body text-[14px] leading-relaxed max-w-[46rem]">
          {graphic.caption}
        </figcaption>
      )}
    </figure>
  );
}

function StatValue({ row }: { row: StatRow }) {
  const lines = row.value.split("\n");
  return (
    <div>
      {lines.map((line, index) => (
        <span key={`${index}-${line}`} className="block font-body text-ink text-[16px] leading-snug">
          {line}
        </span>
      ))}
      {row.note && <p className="mt-1.5 font-body text-ink-soft text-[14px] leading-relaxed">{row.note}</p>}
      {row.source && (
        <a
          href={row.source}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 font-mono uppercase text-warm-gray hover:text-ink"
          style={{ fontSize: 10, letterSpacing: "0.16em" }}
        >
          Source
        </a>
      )}
    </div>
  );
}

function wideAt(index: number): boolean {
  // Establishing views sit full width; the rest pair up.
  return index % 3 === 0;
}

export default function BuildingEntry({
  project,
  imageRows,
  linkRows,
  graphicRows,
  supabaseUrl,
}: {
  project: BuildingProjectData;
  imageRows: DbImage[] | null;
  linkRows: DbLink[] | null;
  graphicRows: DbGraphic[] | null;
  supabaseUrl?: string | null;
}) {
  const images = collectImages(imageRows, project, supabaseUrl);
  const graphics = graphicsFromRows(graphicRows);
  const links = groupLinks(
    (linkRows ?? []).map((link) => ({
      id: link.id,
      category: link.category,
      title: link.title,
      url: link.url,
      note: link.note,
      position: link.position,
    }) satisfies BuildingLink),
  );
  const facts = parseFacts(project.curious_facts);
  const why = parseWhy(project.why_section);
  const stats = buildStatRows(project.stats, project);
  const events = statEvents(project.stats);
  const poster = posterGraphic(graphics);
  const meta = heroMeta(project, project.stats);
  const [active, setActive] = useState<number | null>(null);

  const hero = images[0] ?? null;
  const rest = images.slice(1);
  const posterPreview = poster ? resolveMediaUrl(poster.storagePath || poster.svgPath, { supabaseUrl }) : null;
  const posterDownload = poster ? resolveMediaUrl(poster.downloadPath, { supabaseUrl }) : null;

  return (
    <article className="bg-paper-warm text-ink">
      {hero ? (
        <section className="relative bg-ink text-white">
          <div className="relative h-[78vh] min-h-[520px] md:h-[88vh]">
            <button
              type="button"
              onClick={() => setActive(0)}
              className="absolute inset-0 cursor-zoom-in"
              aria-label={`Enlarge photograph: ${hero.caption || hero.alt}`}
            >
              <img
                src={hero.url}
                alt={hero.alt}
                width={hero.width || undefined}
                height={hero.height || undefined}
                className="absolute inset-0 h-full w-full object-cover object-center"
                fetchPriority="high"
              />
            </button>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-ink/25" />
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-end">
              <div className="pointer-events-auto mx-auto w-full max-w-[1280px] px-6 lg:px-10 pb-10 md:pb-14">
                {project.city && (
                  <Link
                    to={`/cities/${project.city.slug}`}
                    className="font-mono uppercase text-white/90 hover:text-white"
                    style={{ fontSize: 12, letterSpacing: "0.2em", fontWeight: 600 }}
                  >
                    {project.city.name}
                  </Link>
                )}
                <h1
                  className="text-white mt-4 max-w-[16ch]"
                  style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(2.6rem, 6vw, 4.75rem)", lineHeight: 0.96, letterSpacing: "-0.02em" }}
                >
                  {project.name}
                </h1>
                {project.tagline && (
                  <p className="mt-4 max-w-xl text-white/90" style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(1.15rem, 2vw, 1.55rem)", lineHeight: 1.35 }}>
                    {project.tagline}
                  </p>
                )}
                {meta && <p className="mt-5 max-w-2xl font-body text-white/75 text-[14px] md:text-[15px] leading-relaxed">{meta}</p>}
              </div>
            </div>
          </div>
          {(hero.caption || hero.author) && (
            <div className="bg-paper-warm text-ink">
              <div className="mx-auto max-w-[1280px] px-6 lg:px-10 py-4 flex flex-col md:flex-row md:items-baseline md:justify-between gap-1">
                {hero.caption && (
                  <p style={{ fontFamily: serif, fontStyle: "italic", fontSize: 16 }} className="text-ink-soft">
                    {hero.caption}
                  </p>
                )}
                <CreditLine image={hero} />
              </div>
            </div>
          )}
        </section>
      ) : (
        <header className="pt-32 md:pt-40 pb-6 mx-auto max-w-[1280px] px-6 lg:px-10">
          {project.city && (
            <Link to={`/cities/${project.city.slug}`} className="font-mono uppercase text-accent-terra" style={{ fontSize: 13, letterSpacing: "0.2em", fontWeight: 600 }}>
              {project.city.name}
            </Link>
          )}
          <h1 className="text-ink mt-4" style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(2.4rem, 5vw, 4rem)", lineHeight: 1, letterSpacing: "-0.02em" }}>
            {project.name}
          </h1>
          {project.tagline && (
            <p className="mt-4 max-w-xl text-ink-soft" style={{ fontFamily: serif, fontStyle: "italic", fontSize: "clamp(1.15rem, 2vw, 1.5rem)" }}>
              {project.tagline}
            </p>
          )}
          {meta && <p className="mt-4 font-body text-ink-soft text-[15px]">{meta}</p>}
        </header>
      )}

      {rest.length > 0 && (
        <section className="pb-16 md:pb-24">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-12 md:gap-y-16">
              {rest.map((image, index) => (
                <div key={image.id} className={wideAt(index) ? "md:col-span-2" : undefined}>
                  <FigureFrame image={image} onOpen={() => setActive(index + 1)} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {hasText(project.tldr) && (
        <section className="bg-background py-16 md:py-24">
          <Reveal className="mx-auto max-w-[760px] px-6 lg:px-10">
            <Eyebrow>In short</Eyebrow>
            <div className="space-y-5">
              {paragraphsOf(project.tldr).map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="font-body text-ink" style={{ fontSize: "clamp(1.15rem, 1.6vw, 1.35rem)", lineHeight: 1.55 }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {stats.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-[960px] px-6 lg:px-10">
            <Eyebrow>Facts</Eyebrow>
            <SectionTitle>The building, measured</SectionTitle>
            <dl>
              {stats.map((row) => (
                <div key={row.label} className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-1 md:gap-8 py-4 md:py-5 border-t border-ink/10">
                  <dt className="font-mono uppercase text-warm-gray pt-0.5" style={{ fontSize: 11, letterSpacing: "0.16em" }}>
                    {row.label}
                  </dt>
                  <dd>
                    <StatValue row={row} />
                  </dd>
                </div>
              ))}
            </dl>
            {events.length > 0 && (
              <div className="mt-14">
                <h3 className="text-ink mb-6" style={{ fontFamily: serif, fontSize: "clamp(1.4rem, 2vw, 1.8rem)", fontWeight: 400 }}>
                  Dates
                </h3>
                <ol>
                  {events.map((event) => (
                    <li key={event.value} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-1 md:gap-8 py-3 border-t border-ink/10">
                      <p className="font-body text-ink text-[15px] leading-relaxed">{event.value}</p>
                      {event.source && (
                        <a href={event.source} target="_blank" rel="noopener noreferrer" className="font-mono uppercase text-warm-gray hover:text-ink self-center" style={{ fontSize: 10, letterSpacing: "0.16em" }}>
                          Source
                        </a>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </section>
      )}

      {hasText(project.siana_pick) && (
        <section className="bg-background py-16 md:py-24">
          <Reveal className="mx-auto max-w-[860px] px-6 lg:px-10">
            <blockquote className="border-l-2 pl-6 md:pl-8" style={{ borderColor: "hsl(var(--accent))" }}>
              <Eyebrow>Siana Pick</Eyebrow>
              <p className="text-ink" style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(1.6rem, 3vw, 2.35rem)", lineHeight: 1.28 }}>
                {project.siana_pick}
              </p>
            </blockquote>
          </Reveal>
        </section>
      )}

      {facts.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-[960px] px-6 lg:px-10">
            <Eyebrow>Curious facts</Eyebrow>
            <SectionTitle>Worth knowing</SectionTitle>
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-8">
              {facts.map((fact, index) => (
                <li key={fact.slice(0, 40)} className="flex gap-4">
                  <span className="text-accent-terra shrink-0" style={{ fontFamily: serif, fontSize: 26, lineHeight: 1 }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="font-body text-ink text-[16px] leading-relaxed">{fact}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {why.sections.length > 0 && (
        <section className="bg-background py-16 md:py-28">
          <div className="mx-auto max-w-[760px] px-6 lg:px-10">
            <Eyebrow>Why it looks like this</Eyebrow>
            <SectionTitle>The brief, on the facade</SectionTitle>
            {why.intro && <p className="font-body text-ink-soft text-[15px] leading-relaxed mb-12">{why.intro}</p>}
            <div className="space-y-16 md:space-y-20">
              {why.sections.map((section) => {
                const graphic = graphicBySlug(graphics, section.graphicSlug);
                return (
                  <div key={section.heading || section.paragraphs[0]}>
                    {section.heading && (
                      <h3 className="text-ink mb-4" style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(1.45rem, 2.2vw, 1.9rem)", lineHeight: 1.15 }}>
                        {section.heading}
                      </h3>
                    )}
                    <div className="space-y-5">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph.slice(0, 48)} className="font-body text-ink text-[17px] leading-[1.75]">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {graphic && <Diagram graphic={graphic} supabaseUrl={supabaseUrl} />}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {hasText(project.description) && (
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-[720px] px-6 lg:px-10">
            <Eyebrow>Description</Eyebrow>
            <Prose text={project.description || ""} />
          </div>
        </section>
      )}

      {hasText(project.analysis) && (
        <section className="bg-background py-16 md:py-24">
          <div className="mx-auto max-w-[720px] px-6 lg:px-10">
            <Eyebrow>Editorial</Eyebrow>
            <SectionTitle>Analysis</SectionTitle>
            <Prose text={project.analysis || ""} />
          </div>
        </section>
      )}

      {poster && (posterPreview || posterDownload) && (
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-[960px] px-6 lg:px-10">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,280px)_1fr] gap-8 md:gap-14 items-center bg-background border border-ink/10 p-5 md:p-8">
              {posterPreview && (
                <img src={posterPreview} alt={poster.alt || `${project.name} poster`} className="w-full h-auto" />
              )}
              <div>
                <Eyebrow>Poster</Eyebrow>
                <h2 className="text-ink mb-4" style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.5rem)", lineHeight: 1.08 }}>
                  A field guide to take with you
                </h2>
                <p className="font-body text-ink-soft text-[16px] leading-relaxed mb-8 max-w-md">
                  {poster.caption || "The shape, the floors, the air, the light and the five blocks, on one sheet."}
                </p>
                {posterDownload && (
                  <EditorialButton href={posterDownload} download={poster.downloadLabel || true} arrow>
                    Download the poster
                  </EditorialButton>
                )}
                <p className="mt-4 font-mono uppercase text-warm-gray" style={{ fontSize: 11, letterSpacing: "0.14em" }}>
                  PDF, A2
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {links.length > 0 && (
        <section className="bg-background py-16 md:py-28">
          <div className="mx-auto max-w-[960px] px-6 lg:px-10">
            <Eyebrow>Further reading</Eyebrow>
            <SectionTitle>Where to go next</SectionTitle>
            <div className="space-y-12">
              {links.map((group) => (
                <div key={group.category}>
                  <h3 className="font-mono uppercase text-accent-terra mb-3" style={{ fontSize: 12, letterSpacing: "0.18em", fontWeight: 600 }}>
                    {group.label}
                  </h3>
                  <ul>
                    {group.items.map((link) => (
                      <li key={link.id} className="border-t border-ink/10 py-3.5 flex items-baseline justify-between gap-6">
                        {link.url ? (
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-ink hover:opacity-60" style={{ fontFamily: serif, fontSize: "clamp(1.15rem, 1.6vw, 1.4rem)", lineHeight: 1.3 }}>
                            {link.title}
                          </a>
                        ) : (
                          <span className="text-ink" style={{ fontFamily: serif, fontSize: "clamp(1.15rem, 1.6vw, 1.4rem)", lineHeight: 1.3 }}>
                            {link.title}
                          </span>
                        )}
                        <span className="shrink-0 font-mono uppercase text-warm-gray" style={{ fontSize: 10, letterSpacing: "0.14em" }}>
                          {link.url ? "Link" : "Print"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
          {project.city ? (
            <EditorialButton to={`/cities/${project.city.slug}`} variant="muted" leadingArrow>
              {project.city.name}
            </EditorialButton>
          ) : (
            <EditorialButton to="/cities" variant="muted" leadingArrow>
              Explore more
            </EditorialButton>
          )}
          <EditorialButton to={`/atlas?project=${project.slug}`} arrow>
            See on the map
          </EditorialButton>
        </div>
        {project.latitude != null && project.longitude != null && (
          <p className="mt-8 text-center font-mono uppercase text-warm-gray" style={{ fontSize: 11, letterSpacing: "0.14em" }}>
            {formatCoord(project.latitude, project.longitude)}
          </p>
        )}
      </section>

      {active != null && (
        <Lightbox
          images={images}
          index={active}
          onClose={() => setActive(null)}
          onStep={(delta) => setActive((current) => (current == null ? current : (current + delta + images.length) % images.length))}
        />
      )}
    </article>
  );
}
