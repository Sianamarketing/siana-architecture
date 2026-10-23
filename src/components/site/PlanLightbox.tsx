import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, X } from "lucide-react";
import type { PlanSheet } from "@/lib/planSet";
import {
  ZOOM_MAX,
  ZOOM_MIN,
  clampPan,
  scaleFromWheel,
  sheetSwipe,
  stepScale,
  toggleDoubleZoom,
  zoomAt,
  type ZoomFrame,
} from "@/lib/planZoom";

const controlCls = "font-mono uppercase text-white border border-white/30 h-9 px-3 inline-flex items-center justify-center gap-1.5 hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))] disabled:opacity-40";

function formatZoom(scale: number): string {
  const rounded = Math.round(scale * 10) / 10;
  return `${Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)}×`;
}

function fileNameOf(path: string | null): string | undefined {
  if (!path) return undefined;
  const name = path.split("?")[0].split("/").pop();
  return name || undefined;
}

export default function PlanLightbox({
  sheets,
  index,
  urlOf,
  onIndex,
  onClose,
}: {
  sheets: PlanSheet[];
  index: number;
  urlOf: (path: string | null) => string | null;
  onIndex: (index: number) => void;
  onClose: () => void;
}) {
  const sheet = sheets[index];
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [frame, setFrame] = useState<ZoomFrame>({ scale: 1, x: 0, y: 0 });
  const frameRef = useRef(frame);
  const indexRef = useRef(index);
  const onIndexRef = useRef(onIndex);
  const onCloseRef = useRef(onClose);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<null | { dist: number; frame: ZoomFrame; midX: number; midY: number }>(null);
  const panRef = useRef<null | { x: number; y: number; frame: ZoomFrame }>(null);
  const swipeRef = useRef<null | { x: number; y: number }>(null);
  const lastTap = useRef<null | { t: number; x: number; y: number }>(null);
  const touchToggleAt = useRef(0);
  frameRef.current = frame;
  indexRef.current = index;
  onIndexRef.current = onIndex;
  onCloseRef.current = onClose;

  useEffect(() => {
    setFrame({ scale: ZOOM_MIN, x: 0, y: 0 });
    pointers.current.clear();
    pinchRef.current = null;
    panRef.current = null;
    swipeRef.current = null;
    lastTap.current = null;
  }, [sheet?.id]);

  useEffect(() => {
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        event.stopPropagation();
        onIndexRef.current(indexRef.current + 1);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        event.stopPropagation();
        onIndexRef.current(indexRef.current - 1);
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const items = [...dialog.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey, true);
    };
  }, []);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = node.getBoundingClientRect();
      const image = { width: imgRef.current?.offsetWidth || 0, height: imgRef.current?.offsetHeight || 0 };
      const stage = { width: rect.width, height: rect.height };
      setFrame((current) => zoomAt(
        current,
        stage,
        { x: event.clientX - rect.left, y: event.clientY - rect.top },
        scaleFromWheel(current.scale, event.deltaY),
        image,
      ));
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [sheet?.id]);

  if (!sheet) return null;

  const geometry = () => {
    const rect = stageRef.current?.getBoundingClientRect();
    return {
      stage: { width: rect?.width || 0, height: rect?.height || 0 },
      image: { width: imgRef.current?.offsetWidth || 0, height: imgRef.current?.offsetHeight || 0 },
      left: rect?.left || 0,
      top: rect?.top || 0,
    };
  };

  const zoomBy = (direction: 1 | -1) => {
    const geo = geometry();
    setFrame((current) => zoomAt(
      current,
      geo.stage,
      { x: geo.stage.width / 2, y: geo.stage.height / 2 },
      stepScale(current.scale, direction),
      geo.image,
    ));
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size >= 2) {
      const pts = [...pointers.current.values()];
      const a = pts[0];
      const b = pts[1];
      pinchRef.current = {
        dist: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
        frame: frameRef.current,
        midX: (a.x + b.x) / 2,
        midY: (a.y + b.y) / 2,
      };
      panRef.current = null;
      swipeRef.current = null;
      return;
    }
    swipeRef.current = { x: event.clientX, y: event.clientY };
    panRef.current = frameRef.current.scale > 1.01
      ? { x: event.clientX, y: event.clientY, frame: frameRef.current }
      : null;
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const geo = geometry();
    if (pointers.current.size >= 2 && pinchRef.current) {
      const pts = [...pointers.current.values()];
      const a = pts[0];
      const b = pts[1];
      const dist = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      const start = pinchRef.current;
      const zoomed = zoomAt(
        start.frame,
        geo.stage,
        { x: start.midX - geo.left, y: start.midY - geo.top },
        start.frame.scale * (dist / start.dist),
        geo.image,
      );
      setFrame(clampPan(
        { scale: zoomed.scale, x: zoomed.x + (midX - start.midX), y: zoomed.y + (midY - start.midY) },
        geo.stage,
        geo.image,
      ));
      return;
    }
    const pan = panRef.current;
    if (!pan || frameRef.current.scale <= 1.01) return;
    setFrame(clampPan(
      { scale: pan.frame.scale, x: pan.frame.x + (event.clientX - pan.x), y: pan.frame.y + (event.clientY - pan.y) },
      geo.stage,
      geo.image,
    ));
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current;
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinchRef.current = null;
    if (pointers.current.size === 0) {
      panRef.current = null;
      swipeRef.current = null;
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }
    if (!start || pointers.current.size > 0) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const dir = sheetSwipe(dx, dy, frameRef.current.scale);
    if (dir) {
      lastTap.current = null;
      onIndexRef.current(indexRef.current + dir);
      return;
    }
    if (event.pointerType === "mouse" || Math.hypot(dx, dy) > 12) return;
    const now = performance.now();
    const last = lastTap.current;
    if (last && now - last.t < 280 && Math.hypot(event.clientX - last.x, event.clientY - last.y) < 28) {
      lastTap.current = null;
      touchToggleAt.current = now;
      const geo = geometry();
      setFrame((current) => toggleDoubleZoom(
        current,
        geo.stage,
        { x: event.clientX - geo.left, y: event.clientY - geo.top },
        geo.image,
      ));
      return;
    }
    lastTap.current = { t: now, x: event.clientX, y: event.clientY };
  };

  const onDoubleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (performance.now() - touchToggleAt.current < 400) return;
    const geo = geometry();
    setFrame((current) => toggleDoubleZoom(
      current,
      geo.stage,
      { x: event.clientX - geo.left, y: event.clientY - geo.top },
      geo.image,
    ));
  };

  const zoomUrl = urlOf(sheet.zoomPath);
  const pdfUrl = sheet.poster ? urlOf(sheet.downloadPath) : null;
  const atMin = frame.scale <= ZOOM_MIN + 0.001;
  const atMax = frame.scale >= ZOOM_MAX - 0.001;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-lightbox-title"
      className="fixed inset-0 z-[70] flex flex-col text-white"
      style={{ background: "rgba(17, 17, 16, 0.92)" }}
    >
      <div className="relative z-10 flex items-start justify-between gap-3 px-4 md:px-6 py-3">
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className={`${controlCls} w-9 px-0 shrink-0`}>
          <X aria-hidden="true" size={16} strokeWidth={1.75} />
        </button>
        <p id="plan-lightbox-title" aria-live="polite" className="font-mono text-white min-w-0 flex-1 pt-1.5" style={{ fontSize: 13, letterSpacing: "0.04em", lineHeight: 1.35 }}>
          {sheet.code} {sheet.title}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          {zoomUrl && (
            <a href={zoomUrl} download={fileNameOf(sheet.zoomPath)} className={controlCls}>
              Download
            </a>
          )}
          {pdfUrl && (
            <a href={pdfUrl} download={sheet.downloadLabel || fileNameOf(sheet.downloadPath)} className={controlCls}>
              PDF
              <span className="sr-only"> poster</span>
            </a>
          )}
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous sheet"
        onClick={() => onIndex(index - 1)}
        disabled={index <= 0}
        className={`${controlCls} absolute z-10 left-2 md:left-5 top-[46%] w-10 px-0 text-lg`}
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Next sheet"
        onClick={() => onIndex(index + 1)}
        disabled={index >= sheets.length - 1}
        className={`${controlCls} absolute z-10 right-2 md:right-5 top-[46%] w-10 px-0 text-lg`}
      >
        ›
      </button>

      <div
        ref={stageRef}
        className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden"
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
      >
        {zoomUrl ? (
          <img
            ref={imgRef}
            src={zoomUrl}
            alt={sheet.alt || `${sheet.code} ${sheet.title}`}
            draggable={false}
            className="max-h-full max-w-full object-contain select-none pointer-events-none"
            style={{ transform: `translate(${frame.x}px, ${frame.y}px) scale(${frame.scale})` }}
          />
        ) : (
          <p className="font-mono uppercase text-white/70" style={{ fontSize: 12, letterSpacing: "0.14em" }}>
            No drawing filed
          </p>
        )}
      </div>

      <div className="relative z-10 flex items-center justify-center gap-2 px-4 py-3">
        <button type="button" aria-label="Zoom out" onClick={() => zoomBy(-1)} disabled={atMin} className={`${controlCls} w-9 px-0`}>
          <Minus aria-hidden="true" size={16} strokeWidth={1.75} />
        </button>
        <button type="button" aria-label="Zoom in" onClick={() => zoomBy(1)} disabled={atMax} className={`${controlCls} w-9 px-0`}>
          <Plus aria-hidden="true" size={16} strokeWidth={1.75} />
        </button>
        <button type="button" aria-label="Reset zoom" onClick={() => setFrame({ scale: ZOOM_MIN, x: 0, y: 0 })} disabled={atMin} className={controlCls}>
          Reset
        </button>
        <p className="font-mono min-w-[3.25rem] text-center" style={{ fontSize: 12, letterSpacing: "0.08em", color: "#bf3a18" }} aria-live="polite">
          {formatZoom(frame.scale)}
        </p>
      </div>
    </div>,
    document.body,
  );
}
