import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import EditorialButton from "@/components/site/EditorialButton";
import PlanSet from "@/components/site/PlanSet";
import Reveal from "@/components/site/Reveal";
import RichHtml from "@/components/site/RichHtml";
import { buildPlanSheets } from "@/lib/planSet";
import {
  buildStatRows,
  collectImages,
  formatCoord,
  glanceItems,
  graphicBySlug,
  graphicsFromRows,
  groupLinks,
  hasText,
  heroMeta,
  isHtml,
  overviewFacts,
  paragraphsOf,
  parseFacts,
  parseWhy,
  planOverview,
  posterGraphic,
  resolveMediaUrl,
  splitProse,
  statEvents,
  whyLead,
  type BuildingGraphic,
  type BuildingImage,
  type BuildingLink,
  type LinkGroup,
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
  card_path?: string | null;
  position: number;
}

const serif = "'Adobe Garamond Pro', 'EB Garamond', Garamond, Georgia, serif";
const SECTION_OFFSET = "scroll-mt-[132px]";

const NAV = [
  { id: "tldr", label: "TL;DR" },
  { id: "stats", label: "Stats" },
  { id: "facts", label: "Facts" },
  { id: "why", label: "Why" },
  { id: "story", label: "Story" },
  { id: "analysis", label: "Analysis" },
  { id: "poster", label: "Poster" },
  { id: "reading", label: "Further reading" },
] as const;

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
  const closeRef = useRef<HTMLButtonElement>(null);
  onCloseRef.current = onClose;
  onStepRef.current = onStep;
  useEffect(() => {
    closeRef.current?.focus();
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
        <button ref={closeRef} type="button" onClick={onClose} className="font-mono uppercase text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" style={{ fontSize: 12, letterSpacing: "0.18em" }}>
          Close
        </button>
      </div>
      <button type="button" aria-label="Previous photograph" onClick={() => onStep(-1)} className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 h-12 w-12 text-white text-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
        ‹
      </button>
      <button type="button" aria-label="Next photograph" onClick={() => onStep(1)} className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 h-12 w-12 text-white text-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
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

function HeroCarousel({
  images,
  onOpen,
  children,
}: {
  images: BuildingImage[];
  onOpen: (index: number) => void;
  children: ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const count = images.length;
  const image = images[index];

  const step = (delta: number) => {
    setIndex((current) => (current + delta + count) % count);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setIndex(count - 1);
    }
  };

  if (!image) return null;

  return (
    <section
      className="relative bg-ink text-white"
      role="region"
      aria-roledescription="carousel"
      aria-label="Photographs"
      onKeyDown={onKeyDown}
    >
      <div
        className="relative h-[68vh] min-h-[460px] md:h-[78vh] touch-pan-y"
        onPointerDown={(event) => {
          if (event.pointerType === "mouse" && event.button !== 0) return;
          pointer.current = { x: event.clientX, y: event.clientY };
          swiped.current = false;
        }}
        onPointerUp={(event) => {
          if (!pointer.current) return;
          const dx = event.clientX - pointer.current.x;
          const dy = event.clientY - pointer.current.y;
          pointer.current = null;
          if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
            swiped.current = true;
            step(dx < 0 ? 1 : -1);
          }
        }}
        onPointerCancel={() => {
          pointer.current = null;
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (swiped.current) {
              swiped.current = false;
              return;
            }
            onOpen(index);
          }}
          className="absolute inset-0 cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
          aria-label={`Enlarge photograph ${index + 1} of ${count}: ${image.caption || image.alt}`}
        >
          <img
            src={image.url}
            alt={image.alt}
            width={image.width || undefined}
            height={image.height || undefined}
            className="absolute inset-0 h-full w-full object-cover object-center"
            fetchPriority={index === 0 ? "high" : "auto"}
            draggable={false}
          />
        </button>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-ink/25" />
        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photograph"
              onClick={() => step(-1)}
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-ink/45 text-white text-2xl leading-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next photograph"
              onClick={() => step(1)}
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-ink/45 text-white text-2xl leading-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              ›
            </button>
          </>
        )}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end">
          <div className="pointer-events-auto mx-auto w-full max-w-[1280px] px-6 lg:px-10 pb-8 md:pb-12">
            {children}
          </div>
        </div>
      </div>
      <div className="bg-paper-warm text-ink">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10 py-4 flex flex-col md:flex-row md:items-baseline md:justify-between gap-1">
          <p aria-live="polite" style={{ fontFamily: serif, fontStyle: "italic", fontSize: 16 }} className="text-ink-soft">
            {image.caption || image.alt}
            <span className="sr-only">{`, photograph ${index + 1} of ${count}`}</span>
          </p>
          <CreditLine image={image} />
        </div>
        {count > 1 && (
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10 pb-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar" role="group" aria-label="Photograph thumbnails">
              {images.map((thumb, thumbIndex) => {
                const selected = thumbIndex === index;
                return (
                  <button
                    key={thumb.id}
                    type="button"
                    aria-label={`Show photograph ${thumbIndex + 1}: ${thumb.caption || thumb.alt}`}
                    aria-current={selected ? "true" : undefined}
                    onClick={() => setIndex(thumbIndex)}
                    className={`shrink-0 h-14 w-20 md:h-16 md:w-24 overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))] ${selected ? "outline outline-2 outline-[hsl(var(--accent))] outline-offset-2" : "opacity-70 hover:opacity-100"}`}
                  >
                    <img src={thumb.url} alt="" className="h-full w-full object-cover" draggable={false} />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PlainDiagram({ graphic, supabaseUrl }: { graphic: BuildingGraphic; supabaseUrl?: string | null }) {
  const svg = resolveMediaUrl(graphic.svgPath, { supabaseUrl });
  const png = resolveMediaUrl(graphic.storagePath, { supabaseUrl });
  const [src, setSrc] = useState(svg || png);
  if (!src) return null;
  return (
    <figure className="why-figure md:sticky md:top-[132px] self-start bg-paper-warm border border-ink/10 p-3 md:p-4">
      <img
        src={src}
        alt={graphic.alt || graphic.caption || ""}
        className="block w-full max-h-[200px] md:max-h-[480px] object-contain"
        onError={() => {
          if (png && src !== png) setSrc(png);
        }}
      />
    </figure>
  );
}

function StatValue({ row }: { row: StatRow }) {
  const lines = row.value.split("\n");
  const longNote = Boolean(row.note && row.note.length > 140);
  return (
    <div>
      {lines.map((line, lineIndex) => (
        <span key={`${lineIndex}-${line}`} className="block font-body text-ink text-[15px] leading-snug">
          {line}
        </span>
      ))}
      {row.note && longNote && (
        <details className="mt-1.5">
          <summary className="cursor-pointer font-mono uppercase text-warm-gray" style={{ fontSize: 10, letterSpacing: "0.16em" }}>
            Note
          </summary>
          <p className="mt-1.5 font-body text-ink-soft text-[14px] leading-relaxed">{row.note}</p>
        </details>
      )}
      {row.note && !longNote && <p className="mt-1.5 font-body text-ink-soft text-[14px] leading-relaxed">{row.note}</p>}
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

function CollapsibleProse({ text, label }: { text: string; label: string }) {
  const parts = splitProse(text);
  const [open, setOpen] = useState(false);
  const restId = `${label.replace(/\s+/g, "-").toLowerCase()}-rest`;
  if (!parts.lead) return null;
  return (
    <div>
      <Prose text={parts.lead} />
      {parts.rest && (
        <>
          <div id={restId} className={open ? "mt-6" : undefined} hidden={!open}>
            <Prose text={parts.rest} />
          </div>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={restId}
            onClick={() => setOpen((value) => !value)}
            className="mt-6 font-mono uppercase text-ink border-b border-ink/30 hover:border-ink pb-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]"
            style={{ fontSize: 12, letterSpacing: "0.16em" }}
          >
            {open ? "Show less" : "Continue reading"}
          </button>
        </>
      )}
    </div>
  );
}

function ReadingHub({ groups }: { groups: LinkGroup[] }) {
  const [active, setActive] = useState(groups[0]?.category ?? "");
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const current = groups.find((group) => group.category === active) ?? groups[0];
  if (!current) return null;

  const move = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % groups.length;
    if (event.key === "ArrowLeft") next = (index - 1 + groups.length) % groups.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = groups.length - 1;
    setActive(groups[next].category);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      {groups.length > 1 && (
        <div role="tablist" aria-label="Further reading categories" className="flex gap-2 overflow-x-auto no-scrollbar mb-6 -mx-1 px-1">
          {groups.map((group, index) => {
            const selected = group.category === current.category;
            return (
              <button
                key={group.category}
                ref={(node) => {
                  tabs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`reading-tab-${group.category}`}
                aria-selected={selected}
                aria-controls={`reading-panel-${group.category}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(group.category)}
                onKeyDown={(event) => move(event, index)}
                className={`shrink-0 font-mono uppercase px-3 py-2 border-b-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))] ${selected ? "border-[hsl(var(--accent))] text-accent-terra" : "border-transparent text-warm-gray hover:text-ink"}`}
                style={{ fontSize: 11, letterSpacing: "0.16em" }}
              >
                {group.label}
              </button>
            );
          })}
        </div>
      )}
      <div
        role="tabpanel"
        id={`reading-panel-${current.category}`}
        aria-labelledby={`reading-tab-${current.category}`}
      >
        <ul>
          {current.items.map((link) => (
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
    </div>
  );
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
  const writtenOverview = planOverview(project.why_section, project.tldr);
  const planSetOverview = {
    intro: writtenOverview.intro,
    facts: writtenOverview.facts ?? overviewFacts(project.stats, { ...project, city: project.city?.name ?? null }),
  };
  const whySheets = buildPlanSheets(graphics, why.sections, planSetOverview);
  const stats = buildStatRows(project.stats, project);
  const events = statEvents(project.stats);
  const poster = posterGraphic(graphics);
  const meta = heroMeta(project, project.stats);
  const glance = glanceItems(project.stats, project);
  const [active, setActive] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const posterPreview = poster ? resolveMediaUrl(poster.storagePath || poster.svgPath, { supabaseUrl }) : null;
  const posterDownload = poster ? resolveMediaUrl(poster.downloadPath, { supabaseUrl }) : null;

  const present = {
    tldr: hasText(project.tldr),
    stats: stats.length > 0,
    facts: facts.length > 0,
    why: why.sections.length > 0,
    story: hasText(project.description),
    analysis: hasText(project.analysis),
    poster: Boolean(poster && (posterPreview || posterDownload)),
    reading: links.length > 0,
  };
  const nav = NAV.filter((item) => present[item.id]);
  const navKey = nav.map((item) => item.id).join("|");
  const [activeNav, setActiveNav] = useState<string | null>(nav[0]?.id ?? null);

  useEffect(() => {
    const ids = navKey.split("|").filter(Boolean);
    if (!ids.length) return;
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActiveNav(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.15, 0.4, 0.7] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [navKey]);

  useEffect(() => {
    if (!activeNav || !navRef.current) return;
    const link = navRef.current.querySelector<HTMLElement>(`[data-nav="${activeNav}"]`);
    const parent = navRef.current;
    if (!link) return;
    const left = link.offsetLeft - parent.clientWidth / 2 + link.clientWidth / 2;
    parent.scrollTo({ left: Math.max(0, left) });
  }, [activeNav]);

  useEffect(() => {
    const openPart = (hash: string) => {
      const id = String(hash || "").replace(/^#/, "");
      if (!id.startsWith("why-")) return;
      const details = document.getElementById(id)?.querySelector("details");
      if (details instanceof HTMLDetailsElement) details.open = true;
    };
    const onHash = () => openPart(window.location.hash);
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a[href^='#why-']");
      if (!link) return;
      const href = link.getAttribute("href");
      if (href) openPart(href);
    };
    openPart(window.location.hash);
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", onClick);
    };
  }, [why.sections.length]);

  const jump = (id: string) => (event: ReactMouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActiveNav(id);
  };

  const titleBlock = (
    <>
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
    </>
  );

  return (
    <article className="bg-paper-warm text-ink">
      {images.length > 0 ? (
        <HeroCarousel images={images} onOpen={setActive}>
          {titleBlock}
        </HeroCarousel>
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

      {glance.length > 0 && (
        <section aria-label="At a glance" className="border-b border-ink/10">
          <dl className="mx-auto max-w-[1280px] px-6 lg:px-10 py-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-4">
            {glance.map((item) => (
              <div key={item.label} className="min-w-0">
                <dt className="font-mono uppercase text-warm-gray" style={{ fontSize: 10, letterSpacing: "0.16em" }}>
                  {item.label}
                </dt>
                <dd className="mt-1 font-body text-ink text-[15px] leading-snug line-clamp-2">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {nav.length > 1 && (
        <nav
          ref={navRef}
          aria-label="On this page"
          className="sticky top-[76px] z-30 bg-paper-warm/95 backdrop-blur border-b border-ink/10"
        >
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10 flex gap-1 overflow-x-auto no-scrollbar">
            {nav.map((item) => {
              const selected = item.id === activeNav;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  data-nav={item.id}
                  aria-current={selected ? "true" : undefined}
                  onClick={jump(item.id)}
                  className={`shrink-0 font-mono uppercase py-3 px-3 border-b-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))] ${selected ? "border-[hsl(var(--accent))] text-ink" : "border-transparent text-warm-gray hover:text-ink"}`}
                  style={{ fontSize: 11, letterSpacing: "0.16em" }}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        </nav>
      )}

      {present.tldr && (
        <section id="tldr" className={`bg-background py-14 md:py-20 ${SECTION_OFFSET}`}>
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

      <PlanSet
        projectName={project.name}
        graphics={graphics}
        sections={why.sections}
        overview={planSetOverview}
        supabaseUrl={supabaseUrl}
      />

      {hasText(project.siana_pick) && (
        <section className="bg-background py-12 md:py-16">
          <Reveal className="mx-auto max-w-[860px] px-6 lg:px-10">
            <blockquote className="border-l-2 pl-6 md:pl-8" style={{ borderColor: "hsl(var(--accent))" }}>
              <Eyebrow>Siana Pick</Eyebrow>
              <p className="text-ink" style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(1.45rem, 2.6vw, 2.1rem)", lineHeight: 1.28 }}>
                {project.siana_pick}
              </p>
            </blockquote>
          </Reveal>
        </section>
      )}

      {present.stats && (
        <section id="stats" className={`py-14 md:py-20 ${SECTION_OFFSET}`}>
          <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
            <Eyebrow>Facts</Eyebrow>
            <SectionTitle>The building, measured</SectionTitle>
            <dl className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12">
              {stats.map((row) => (
                <div key={row.label} className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 py-3 border-t border-ink/10">
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
              <div className="mt-12">
                <h3 className="text-ink mb-4" style={{ fontFamily: serif, fontSize: "clamp(1.4rem, 2vw, 1.8rem)", fontWeight: 400 }}>
                  Dates
                </h3>
                <ol className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12">
                  {events.map((event) => (
                    <li key={event.value} className="py-2.5 border-t border-ink/10">
                      <p className="font-body text-ink text-[14px] leading-relaxed">{event.value}</p>
                      {event.source && (
                        <a href={event.source} target="_blank" rel="noopener noreferrer" className="font-mono uppercase text-warm-gray hover:text-ink" style={{ fontSize: 10, letterSpacing: "0.16em" }}>
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

      {present.facts && (
        <section id="facts" className={`py-14 md:py-20 ${SECTION_OFFSET}`}>
          <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
            <Eyebrow>Curious facts</Eyebrow>
            <SectionTitle>Worth knowing</SectionTitle>
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {facts.map((fact, index) => (
                <li key={fact.slice(0, 40)} className="bg-background border border-ink/10 p-5 flex flex-col gap-3">
                  <span className="text-accent-terra" style={{ fontFamily: serif, fontSize: 26, lineHeight: 1 }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="font-body text-ink text-[15px] leading-relaxed">{fact}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {present.why && (
        <section id="why" className={`bg-background py-14 md:py-24 ${SECTION_OFFSET}`}>
          <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
            <Eyebrow>Why it looks like this</Eyebrow>
            <SectionTitle>The brief, on the facade</SectionTitle>
            {why.intro && (
              <p className="font-body text-ink-soft text-[15px] leading-relaxed mb-10 md:mb-14 max-w-[46rem]">
                {why.intro}
              </p>
            )}
            <div className="space-y-14 md:space-y-20">
              {why.sections.map((section, index) => {
                const graphic = graphicBySlug(graphics, section.graphicSlug);
                const sheet = section.graphicSlug
                  ? whySheets.find((item) => item.whyHash === `why-${section.graphicSlug}`)
                  : null;
                const { lead, more } = whyLead(section.paragraphs);
                const partId = section.graphicSlug ? `why-${section.graphicSlug}` : undefined;
                const linkCls = "font-mono uppercase text-ink border-b border-ink/40 hover:border-ink pb-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]";
                return (
                  <article key={section.heading || lead} id={partId} className={SECTION_OFFSET}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-start">
                      {graphic && (
                        <PlainDiagram graphic={graphic} supabaseUrl={supabaseUrl} />
                      )}
                      <div className={index % 2 === 1 ? "md:order-first" : undefined}>
                        {section.heading && (
                          <h3 className="text-ink mb-4" style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(1.45rem, 2.2vw, 1.9rem)", lineHeight: 1.15 }}>
                            {section.heading}
                          </h3>
                        )}
                        {lead && (
                          <p className="font-body text-ink text-[17px] leading-[1.75]">{lead}</p>
                        )}
                        {more.length > 0 && (
                          <details className="why-more mt-4">
                            <summary className={`${linkCls} cursor-pointer font-normal`} style={{ fontSize: 12, letterSpacing: "0.14em" }}>
                              <span className="why-more-label">Read more</span>
                              <span className="why-less">Show less</span>
                            </summary>
                            <div className="mt-5 space-y-5">
                              {more.map((paragraph) => (
                                <p key={paragraph.slice(0, 48)} className="font-body text-ink text-[17px] leading-[1.75]">
                                  {paragraph}
                                </p>
                              ))}
                            </div>
                          </details>
                        )}
                        {sheet && (
                          <a href={`#${sheet.id}`} className={`${linkCls} inline-block mt-4 text-warm-gray hover:text-ink`} style={{ fontSize: 12, letterSpacing: "0.14em" }}>
                            See sheet {sheet.code}
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {present.story && (
        <section id="story" className={`py-14 md:py-20 ${SECTION_OFFSET}`}>
          <div className="mx-auto max-w-[720px] px-6 lg:px-10">
            <Eyebrow>Story</Eyebrow>
            <SectionTitle>How it came to be</SectionTitle>
            <CollapsibleProse text={project.description || ""} label="Story" />
          </div>
        </section>
      )}

      {present.analysis && (
        <section id="analysis" className={`bg-background py-14 md:py-20 ${SECTION_OFFSET}`}>
          <div className="mx-auto max-w-[720px] px-6 lg:px-10">
            <Eyebrow>Editorial</Eyebrow>
            <SectionTitle>Analysis</SectionTitle>
            <CollapsibleProse text={project.analysis || ""} label="Analysis" />
          </div>
        </section>
      )}

      {present.poster && poster && (
        <section id="poster" className={`py-14 md:py-20 ${SECTION_OFFSET}`}>
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

      {present.reading && (
        <section id="reading" className={`bg-background py-14 md:py-24 ${SECTION_OFFSET}`}>
          <div className="mx-auto max-w-[960px] px-6 lg:px-10">
            <Eyebrow>Further reading</Eyebrow>
            <SectionTitle>Where to go next</SectionTitle>
            <ReadingHub groups={links} />
          </div>
        </section>
      )}

      <section className="py-14 md:py-20">
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
