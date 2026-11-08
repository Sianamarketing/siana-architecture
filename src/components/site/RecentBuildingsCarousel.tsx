import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { BuildingSlide } from "@/lib/recentBuildings";

export default function RecentBuildingsCarousel({ slides }: { slides: BuildingSlide[] }) {
  const scroller = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    const onScroll = () => {
      const width = node.clientWidth || 1;
      setIndex(Math.round(node.scrollLeft / width));
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, [slides.length]);

  const go = (next: number) => {
    const node = scroller.current;
    if (!node || slides.length === 0) return;
    const clamped = (next + slides.length) % slides.length;
    node.scrollTo({ left: clamped * node.clientWidth, behavior: reduce ? "auto" : "smooth" });
    setIndex(clamped);
  };

  if (slides.length === 0) {
    return (
      <p className="font-body text-ink-soft text-[15px]">
        No recent exterior photograph is on file.
      </p>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden" role="region" aria-roledescription="carousel" aria-label="Recent building entries">
      <div
        ref={scroller}
        className="flex w-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            go(index + 1);
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            go(index - 1);
          }
        }}
      >
        {slides.map((slide, slideIndex) => (
          <figure key={slide.slug} className="w-full min-w-0 shrink-0 grow-0 basis-full snap-start" aria-hidden={slideIndex === index ? undefined : true}>
            <Link
              to={`/projects/${slide.slug}`}
              className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]"
              tabIndex={slideIndex === index ? 0 : -1}
            >
              <img src={slide.src} alt={slide.alt} className="w-full h-[200px] sm:h-[220px] lg:h-[240px] object-cover bg-paper-mid" />
            </Link>
            <figcaption className="mt-2 font-mono uppercase text-warm-gray break-words" style={{ fontSize: 11, letterSpacing: "0.08em" }}>
              <span className="text-ink">{slide.name}</span>
              <span className="mx-2" aria-hidden="true">·</span>
              <span>{[slide.author, slide.license].filter(Boolean).join(", ")}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <button type="button" onClick={() => go(index - 1)} className="h-11 px-3 border border-ink/20 font-mono uppercase text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]" style={{ fontSize: 11, letterSpacing: "0.12em" }}>
            Previous
          </button>
          <button type="button" onClick={() => go(index + 1)} className="h-11 px-3 border border-ink/20 font-mono uppercase text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]" style={{ fontSize: 11, letterSpacing: "0.12em" }}>
            Next
          </button>
        </div>
        <div className="flex gap-1.5" role="group" aria-label="Slides">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.slug}
              type="button"
              aria-label={`${slide.name}, slide ${slideIndex + 1} of ${slides.length}`}
              aria-current={slideIndex === index ? "true" : undefined}
              onClick={() => go(slideIndex)}
              className="h-11 w-6 inline-flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
            >
              <span aria-hidden="true" className={`block h-1.5 w-1.5 rounded-full ${slideIndex === index ? "bg-ink" : "bg-ink/25"}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!media) return;
    const apply = () => setReduce(media.matches);
    apply();
    media.addEventListener?.("change", apply);
    return () => media.removeEventListener?.("change", apply);
  }, []);
  return reduce;
}
