import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { ZoomIn } from "lucide-react";
import EditorialButton from "@/components/site/EditorialButton";
import PlanLightbox from "@/components/site/PlanLightbox";
import { resolveMediaUrl, type BuildingGraphic, type WhyBlock } from "@/lib/buildingEntry";
import { buildPlanSheets, sheetIndexFromHash, type PlanOverviewInput, type PlanSheet } from "@/lib/planSet";

const serif = "'Adobe Garamond Pro', 'EB Garamond', Garamond, Georgia, serif";

function useMedia(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const apply = () => setMatches(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [query]);
  return matches;
}

function TitleBlock({ sheet, projectName, onEnlarge }: { sheet: PlanSheet; projectName: string; onEnlarge?: (opener: HTMLElement) => void }) {
  return (
    <footer className="border-t border-ink bg-paper text-ink">
      <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 px-3 py-2">
        <p className="font-mono uppercase text-accent-terra" style={{ fontSize: 12, letterSpacing: "0.16em", fontWeight: 600 }}>
          {sheet.code}
        </p>
        <div className="flex items-center justify-end gap-3">
          {onEnlarge && (
            <button
              type="button"
              data-plan-enlarge=""
              onClick={(event) => onEnlarge(event.currentTarget)}
              className="inline-flex items-center gap-1 font-mono text-ink border-b border-ink/30 hover:border-ink pb-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]"
              style={{ fontSize: 11, letterSpacing: "0.08em" }}
            >
              <ZoomIn aria-hidden="true" className="text-accent-terra" size={14} strokeWidth={1.75} />
              Enlarge
              <span className="sr-only"> sheet {sheet.code}, {sheet.title}</span>
            </button>
          )}
          <p className="font-mono uppercase text-warm-gray text-right" style={{ fontSize: 10, letterSpacing: "0.16em" }}>
            NTS
          </p>
        </div>
        <p className="col-span-2 text-ink" style={{ fontFamily: serif, fontWeight: 400, fontSize: "1.15rem", lineHeight: 1.2 }}>
          {sheet.title}
        </p>
        <p className="font-mono uppercase text-ink-soft" style={{ fontSize: 10, letterSpacing: "0.12em" }}>
          {projectName}
        </p>
        <p className="font-mono uppercase text-warm-gray text-right" style={{ fontSize: 10, letterSpacing: "0.12em" }}>
          Siana Architecture
        </p>
        <p className="col-span-2 font-mono uppercase text-warm-gray" style={{ fontSize: 10, letterSpacing: "0.14em" }}>
          Concept illustration
        </p>
      </div>
    </footer>
  );
}

function DrawingFace({
  sheet,
  projectName,
  src,
  onOpen,
  zoomGuard,
}: {
  sheet: PlanSheet;
  projectName: string;
  src: string | null;
  onOpen?: (opener: HTMLElement) => void;
  zoomGuard?: { current: boolean };
}) {
  const regionRef = useRef<HTMLDivElement>(null);
  return (
    <div className="plan-page h-full flex flex-col border border-ink">
      <div className="flex-1 bg-paper-warm min-h-[220px] md:min-h-0 flex items-center justify-center p-3 md:p-5">
        {src ? (
          <div
            ref={regionRef}
            data-plan-zoom=""
            role={onOpen ? "button" : undefined}
            tabIndex={onOpen ? 0 : undefined}
            aria-label={onOpen ? `Enlarge sheet ${sheet.code}, ${sheet.title}` : undefined}
            className={`w-full ${onOpen ? "cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]" : ""}`}
            onClick={() => {
              if (!onOpen) return;
              if (zoomGuard?.current) {
                zoomGuard.current = false;
                return;
              }
              if (regionRef.current) onOpen(regionRef.current);
            }}
            onKeyDown={(event) => {
              if (!onOpen || !regionRef.current) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpen(regionRef.current);
              }
            }}
          >
            <img src={src} alt={sheet.alt || `${sheet.code} ${sheet.title}`} className="max-h-[420px] md:max-h-[460px] w-full object-contain" draggable={false} />
          </div>
        ) : (
          <p className="font-body text-ink-soft text-[15px]">No drawing filed.</p>
        )}
      </div>
      <TitleBlock sheet={sheet} projectName={projectName} onEnlarge={onOpen} />
    </div>
  );
}

function NotesFace({ sheet, downloadUrl, headingId, contained }: { sheet: PlanSheet; downloadUrl: string | null; headingId?: string; contained?: boolean }) {
  return (
    <div className={`plan-page border border-ink md:border-l-0 px-5 py-6 md:px-8 md:py-8 flex flex-col bg-paper ${contained ? "h-full overflow-hidden" : ""}`}>
      <p className="font-mono uppercase text-accent-terra mb-3" style={{ fontSize: 11, letterSpacing: "0.18em", fontWeight: 600 }}>
        {sheet.code}
      </p>
      <h3 id={headingId} className="text-ink mb-4" style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(1.45rem, 2vw, 1.9rem)", lineHeight: 1.15 }}>
        {sheet.title}
      </h3>
      <div className="space-y-4">
        {sheet.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="font-body text-ink text-[16px] leading-[1.7]">
            {paragraph}
          </p>
        ))}
      </div>
      {sheet.facts.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
          {sheet.facts.map((fact) => (
            <div key={fact.label}>
              <dt className="font-mono uppercase text-warm-gray" style={{ fontSize: 10, letterSpacing: "0.16em" }}>
                {fact.label}
              </dt>
              <dd className="mt-1 font-mono text-ink" style={{ fontSize: 13, letterSpacing: "0.02em", lineHeight: 1.35 }}>
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
      <div className="mt-6 flex flex-col items-start gap-4">
        {sheet.whyHash && (
          <a href={`#${sheet.whyHash}`} className="font-mono uppercase text-ink border-b border-ink/40 hover:border-ink pb-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]" style={{ fontSize: 12, letterSpacing: "0.14em" }}>
            Read the full explanation
          </a>
        )}
        {sheet.poster && downloadUrl && (
          <EditorialButton href={downloadUrl} download={sheet.downloadLabel || true} arrow>
            Download the poster
          </EditorialButton>
        )}
      </div>
    </div>
  );
}

export default function PlanSet({
  projectName,
  graphics,
  sections,
  overview,
  supabaseUrl,
}: {
  projectName: string;
  graphics: BuildingGraphic[];
  sections: WhyBlock[];
  overview?: PlanOverviewInput | null;
  supabaseUrl?: string | null;
}) {
  const sheets = useMemo(() => buildPlanSheets(graphics, sections, overview), [graphics, sections, overview]);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const desktop = useMedia("(min-width: 768px)");
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);
  const [turn, setTurn] = useState<null | { dir: 1 | -1; run: boolean }>(null);
  const [lightbox, setLightbox] = useState(false);
  const bookRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number; edge: "next" | "prev" | "swipe" } | null>(null);
  const zoomGuard = useRef(false);
  const openerRef = useRef<HTMLElement | null>(null);
  const sheetsRef = useRef(sheets);
  const indexRef = useRef(0);
  sheetsRef.current = sheets;
  indexRef.current = index;
  const safeIndex = Math.min(index, Math.max(sheets.length - 1, 0));
  const sheet = sheets[safeIndex];

  const urlOf = (path: string | null) => resolveMediaUrl(path, { supabaseUrl });

  const writeHash = (next: PlanSheet) => {
    const url = `${window.location.pathname}${window.location.search}#${next.id}`;
    window.history.replaceState(null, "", url);
  };

  const openAt = (next: number, opener: HTMLElement | null) => {
    const list = sheetsRef.current;
    const target = list[next];
    if (!target) return;
    openerRef.current = opener;
    if (next !== indexRef.current) {
      indexRef.current = next;
      setIndex(next);
      writeHash(target);
    }
    setTurn(null);
    setDrag(null);
    setLightbox(true);
  };

  const closeLightbox = () => setLightbox(false);

  useEffect(() => {
    if (lightbox) return;
    const opener = openerRef.current;
    if (!opener) return;
    openerRef.current = null;
    const current = sheetsRef.current[indexRef.current];
    const fallback = current ? document.querySelector<HTMLElement>(`#${current.id} [data-plan-enlarge]`) : null;
    const hidden = Boolean(opener.closest("[hidden]"));
    const target = !hidden && opener.isConnected ? opener : fallback;
    target?.focus();
  }, [lightbox]);

  const goTo = (nextIndex: number, animate: boolean) => {
    const list = sheetsRef.current;
    const current = indexRef.current;
    if (nextIndex < 0 || nextIndex >= list.length || nextIndex === current || turn) return;
    const dir = nextIndex > current ? 1 : -1;
    const sequential = Math.abs(nextIndex - current) === 1;
    if (!animate || reduced || !sequential) {
      setIndex(nextIndex);
      writeHash(list[nextIndex]);
      return;
    }
    setTurn({ dir, run: false });
  };

  const showSheet = (nextIndex: number) => {
    const list = sheetsRef.current;
    if (nextIndex < 0 || nextIndex >= list.length || nextIndex === indexRef.current) return;
    indexRef.current = nextIndex;
    setIndex(nextIndex);
    writeHash(list[nextIndex]);
    setTurn(null);
    setDrag(null);
  };

  useEffect(() => {
    if (!turn || turn.run) return;
    const frame = requestAnimationFrame(() => {
      setTurn((current) => (current && !current.run ? { ...current, run: true } : current));
    });
    return () => cancelAnimationFrame(frame);
  }, [turn]);

  useEffect(() => {
    const apply = () => {
      const found = sheetIndexFromHash(window.location.hash, sheetsRef.current.length);
      if (found == null) return;
      setIndex(found);
      const target = document.getElementById("plan-set");
      if (target) target.scrollIntoView({ block: "start" });
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [sheets.length]);

  useEffect(() => {
    const drawing = bookRef.current?.querySelector<HTMLElement>("[data-plan-drawing]");
    if (!drawing || !bookRef.current || typeof ResizeObserver === "undefined") return;
    const apply = () => {
      bookRef.current?.style.setProperty("--plan-spread-h", `${drawing.offsetHeight}px`);
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(drawing);
    return () => observer.disconnect();
  }, [safeIndex, sheet?.id, desktop]);

  useEffect(() => {
    if (!turn?.run) return;
    const dir = turn.dir;
    const node = bookRef.current?.querySelector(".plan-leaf.is-run");
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      const list = sheetsRef.current;
      const next = Math.min(list.length - 1, Math.max(0, indexRef.current + dir));
      const target = list[next];
      indexRef.current = next;
      setIndex(next);
      if (target) writeHash(target);
      setTurn(null);
      setDrag(null);
    };
    const onEnd = (event: Event) => {
      if (event.target === node) finish();
    };
    node?.addEventListener("transitionend", onEnd);
    const timer = window.setTimeout(finish, 980);
    return () => {
      node?.removeEventListener("transitionend", onEnd);
      window.clearTimeout(timer);
    };
  }, [turn]);

  if (!sheet) return null;

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(safeIndex + 1, true);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(safeIndex - 1, true);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0, false);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(sheets.length - 1, false);
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    zoomGuard.current = false;
    if (turn || event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("a, button, input, textarea, select")) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - bounds.left;
    const fromRight = bounds.width - localX;
    const drawing = event.currentTarget.querySelector("[data-plan-drawing]");
    const drawingBox = drawing?.getBoundingClientRect();
    const inDrawing = drawingBox ? event.clientY >= drawingBox.top && event.clientY <= drawingBox.bottom : true;
    const cornerOk = desktop || inDrawing;
    const edge: "next" | "prev" | "swipe" = cornerOk && fromRight < 88 && safeIndex < sheets.length - 1
      ? "next"
      : cornerOk && localX < 88 && safeIndex > 0
        ? "prev"
        : "swipe";
    pointer.current = { x: event.clientX, y: event.clientY, edge };
    if (edge !== "swipe") event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointer.current || reduced || turn) return;
    const dx = event.clientX - pointer.current.x;
    const dy = event.clientY - pointer.current.y;
    if (pointer.current.edge === "swipe") {
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
        try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* already captured */ }
      }
      return;
    }
    const width = Math.max(event.currentTarget.getBoundingClientRect().width / (desktop ? 2 : 1), 1);
    if (pointer.current.edge === "next") {
      setDrag(Math.max(-180, Math.min(0, (dx / width) * 180)));
    } else {
      setDrag(Math.max(0, Math.min(180, (dx / width) * 180)));
    }
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointer.current;
    pointer.current = null;
    if (!start || turn) {
      setDrag(null);
      return;
    }
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const dragged = drag != null && Math.abs(drag) > 8;
    if (start.edge === "next" && ((drag != null && drag < -70) || (!dragged && Math.abs(dx) < 8 && Math.abs(dy) < 8))) {
      zoomGuard.current = true;
      goTo(safeIndex + 1, true);
      return;
    }
    if (start.edge === "prev" && ((drag != null && drag > 70) || (!dragged && Math.abs(dx) < 8 && Math.abs(dy) < 8))) {
      zoomGuard.current = true;
      goTo(safeIndex - 1, true);
      return;
    }
    if (start.edge === "swipe" && Math.abs(dx) > Math.abs(dy)) {
      if (dx < -48) {
        zoomGuard.current = true;
        goTo(safeIndex + 1, true);
        return;
      }
      if (dx > 48) {
        zoomGuard.current = true;
        goTo(safeIndex - 1, true);
        return;
      }
    }
    setDrag(null);
  };

  const dragDir: 1 | -1 = drag != null && drag > 0 ? -1 : 1;
  const leafDir = turn?.dir || dragDir;
  const incoming = sheets[safeIndex + leafDir] ?? null;
  const showLeaf = !reduced && Boolean(incoming) && (Boolean(turn) || (drag != null && Math.abs(drag) > 2));
  const turning = Boolean(turn) || drag != null;

  const frontFace = !desktop || leafDir < 0
    ? <DrawingFace sheet={sheet} projectName={projectName} src={urlOf(sheet.imagePath)} zoomGuard={zoomGuard} onOpen={(opener) => openAt(safeIndex, opener)} />
    : <NotesFace sheet={sheet} downloadUrl={urlOf(sheet.downloadPath)} contained />;
  const backFace = !incoming ? null : !desktop || leafDir > 0
    ? <DrawingFace sheet={incoming} projectName={projectName} src={urlOf(incoming.imagePath)} zoomGuard={zoomGuard} onOpen={(opener) => openAt(safeIndex + leafDir, opener)} />
    : <NotesFace sheet={incoming} downloadUrl={urlOf(incoming.downloadPath)} contained />;

  return (
    <section id="plan-set" aria-label="Plan set" className="py-10 md:py-14 scroll-mt-[132px]" onKeyDown={onKeyDown}>
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
        <p className="font-mono uppercase text-warm-gray mb-4" style={{ fontSize: 11, letterSpacing: "0.16em" }}>
          Plan set
        </p>
        <div
          ref={bookRef}
          className="plan-book"
          tabIndex={0}
          role="group"
          aria-label={`${sheet.code}, ${sheet.title}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            pointer.current = null;
            setDrag(null);
          }}
        >
          <p className="sr-only">Use the arrow keys to turn the sheets. Home and End jump to the first and last sheet.</p>
          <ol className="list-none m-0 p-0">
            {sheets.map((item, itemIndex) => {
              const active = itemIndex === safeIndex;
              const src = urlOf(item.imagePath);
              const downloadUrl = urlOf(item.downloadPath);
              return (
                <li key={item.id} hidden={!active}>
                  <article id={item.id} aria-labelledby={`${item.id}-title`} className={active ? "plan-fade" : undefined}>
                    <div className="plan-spread">
                      <div className="relative" data-plan-drawing={active ? "true" : undefined}>
                        <DrawingFace sheet={item} projectName={projectName} src={src} zoomGuard={zoomGuard} onOpen={(opener) => openAt(itemIndex, opener)} />
                        {active && !turning && itemIndex < sheets.length - 1 && (
                          <span aria-hidden="true" className="md:hidden pointer-events-none absolute bottom-0 right-0 z-[4] h-9 w-9" style={{ background: "linear-gradient(135deg, transparent 46%, #fdf0ed 46%, #eca693 72%, transparent 72%)" }} />
                        )}
                      </div>
                      <NotesFace sheet={item} downloadUrl={downloadUrl} headingId={`${item.id}-title`} />
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
          {safeIndex < sheets.length - 1 && !turning && (
            <span aria-hidden="true" className="hidden md:block pointer-events-none absolute z-[4] bottom-0 right-0 h-9 w-9" style={{ background: "linear-gradient(135deg, transparent 46%, #fdf0ed 46%, #eca693 72%, transparent 72%)" }} />
          )}

          {showLeaf && incoming && backFace && (
            <div
              className={`plan-leaf ${leafDir < 0 ? "plan-leaf-prev" : "plan-leaf-next"} ${turn?.run ? "is-run" : ""}`}
              style={drag != null && !turn?.run ? { transform: `rotateY(${drag}deg)` } : undefined}
              aria-hidden="true"
            >
              <div className="plan-leaf-face">{frontFace}</div>
              <div className="plan-leaf-face plan-leaf-back">{backFace}</div>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => goTo(safeIndex - 1, true)}
            disabled={safeIndex === 0 || Boolean(turn)}
            className="font-mono uppercase text-ink disabled:text-warm-gray disabled:border-transparent border-b border-ink/30 pb-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]"
            style={{ fontSize: 12, letterSpacing: "0.14em" }}
          >
            Previous sheet
          </button>
          <p aria-live="polite" aria-atomic="true" className="font-mono uppercase text-ink" style={{ fontSize: 12, letterSpacing: "0.16em" }}>
            {sheet.code} / {String(sheets.length).padStart(2, "0")}
            <span className="sr-only">{`, ${sheet.title}`}</span>
          </p>
          <button
            type="button"
            onClick={() => goTo(safeIndex + 1, true)}
            disabled={safeIndex === sheets.length - 1 || Boolean(turn)}
            className="font-mono uppercase text-ink disabled:text-warm-gray disabled:border-transparent border-b border-ink/30 pb-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]"
            style={{ fontSize: 12, letterSpacing: "0.14em" }}
          >
            Next sheet
          </button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar" role="listbox" aria-label="Drawing list">
          {sheets.map((item, itemIndex) => {
            const selected = itemIndex === safeIndex;
            const thumb = urlOf(item.imagePath);
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={selected}
                aria-label={`Show sheet ${item.code}, ${item.title}`}
                onClick={() => goTo(itemIndex, false)}
                className={`shrink-0 w-16 md:w-20 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))] ${selected ? "outline outline-2 outline-[hsl(var(--accent))] outline-offset-2" : "opacity-70 hover:opacity-100"}`}
              >
                <span className="block aspect-[3/4] bg-paper-mid overflow-hidden">
                  {thumb ? <img src={thumb} alt="" className="h-full w-full object-cover" /> : null}
                </span>
                <span className="block mt-1 font-mono uppercase text-warm-gray" style={{ fontSize: 9, letterSpacing: "0.12em" }}>
                  {item.code}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {lightbox && (
        <PlanLightbox
          sheets={sheets}
          index={safeIndex}
          urlOf={urlOf}
          onIndex={showSheet}
          onClose={closeLightbox}
        />
      )}
    </section>
  );
}
