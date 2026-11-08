import { useRef } from "react";
import { DIRECTORY_CATEGORIES, type DirectorySlug } from "@/lib/directory";

export type DirectoryTab = "all" | DirectorySlug;

const TABS: { id: DirectoryTab; label: string }[] = [
  { id: "all", label: "All" },
  ...DIRECTORY_CATEGORIES.map((category) => ({ id: category.slug, label: category.label })),
];

export default function DirectoryTabs({
  active,
  counts,
  onChange,
  labelledBy,
}: {
  active: DirectoryTab;
  counts: Partial<Record<DirectoryTab, number>>;
  onChange: (tab: DirectoryTab) => void;
  labelledBy?: string;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const move = (index: number) => {
    const next = (index + TABS.length) % TABS.length;
    onChange(TABS[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-labelledby={labelledBy}
      className="flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible no-scrollbar pt-5"
      style={{ borderTop: "1px solid hsl(var(--ink) / 0.12)" }}
    >
      {TABS.map((tab, index) => {
        const selected = tab.id === active;
        const count = counts[tab.id];
        return (
          <button
            key={tab.id}
            ref={(node) => { refs.current[index] = node; }}
            type="button"
            role="tab"
            id={`directory-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls="directory-panel"
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                move(index + 1);
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                move(index - 1);
              } else if (event.key === "Home") {
                event.preventDefault();
                move(0);
              } else if (event.key === "End") {
                event.preventDefault();
                move(TABS.length - 1);
              }
            }}
            className={`shrink-0 h-11 px-4 font-mono inline-flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))] ${
              selected ? "bg-paper text-ink border border-ink" : "bg-transparent text-ink-soft border border-transparent hover:text-ink"
            }`}
            style={{ fontSize: 13, letterSpacing: "0.08em" }}
          >
            {tab.label}
            {typeof count === "number" && count > 0 && (
              <span className="text-warm-gray" style={{ fontSize: 12 }}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
