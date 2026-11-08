import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import SiteLayout from "@/components/site/SiteLayout";
import SEO from "@/components/site/SEO";
import NotFound from "@/pages/NotFound";
import { directoryCategory, filterDirectoryEntries } from "@/lib/directory";
import { useDirectoryRecords } from "@/hooks/useDirectoryRecords";

const PAGE_SIZE = 8;

export default function DirectoryCategory() {
  const { slug = "" } = useParams();
  const category = directoryCategory(slug);
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const [draft, setDraft] = useState(query);
  const [shown, setShown] = useState(PAGE_SIZE);
  const { entries, ready } = useDirectoryRecords();

  useEffect(() => {
    setDraft(query);
  }, [query]);

  useEffect(() => {
    setShown(PAGE_SIZE);
  }, [query, slug]);

  const visible = useMemo(
    () => (category ? filterDirectoryEntries(entries, { query, category: category.slug }) : []),
    [category, entries, query],
  );

  if (!category) return <NotFound />;

  const showCredits = category.slug === "architects";

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const next = new URLSearchParams();
    if (draft.trim()) next.set("q", draft.trim());
    setParams(next, { replace: true });
  };

  return (
    <SiteLayout>
      <SEO
        title={`${category.label} - Directory - Siana Architecture`}
        description={showCredits
          ? "Architect credits copied from published buildings. A shared credit stays one line."
          : `${category.label} has no listings yet.`}
        canonical={`https://sianaarchitecture.com/d/${category.slug}`}
      />
      <div className="vogue-titles home-paper pb-16" style={{ paddingTop: 76 }}>
        <div className="mx-auto max-w-[900px] px-6 lg:px-10 py-10">
          <nav aria-label="Breadcrumb" className="font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.14em" }}>
            <Link to="/d/" className="hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]">Directory</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page" className="text-ink">{category.label}</span>
          </nav>
          <h1 className="mt-4 text-ink" style={{ fontWeight: 400, fontSize: "clamp(2.2rem, 4vw, 3.4rem)", lineHeight: 1.08 }}>
            {category.label}
          </h1>
          <p className="mt-4 max-w-xl font-body text-ink-soft text-[16px] leading-relaxed">
            {showCredits
              ? "These lines are copied from the architect field on published buildings. They are not checked business profiles, and a shared credit is not split into separate people."
              : `${category.label} is not in the records yet.`}
          </p>
          <form role="search" onSubmit={onSearch} className="mt-8 max-w-md">
            <label htmlFor="category-search" className="font-body text-ink" style={{ fontSize: 14 }}>
              Search {category.label}
            </label>
            <div className="mt-1 border-b border-ink/40">
              <input
                id="category-search"
                name="q"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Credits, buildings, or cities"
                className="w-full h-12 bg-transparent font-body text-[16px] text-ink placeholder:text-ink-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]"
              />
              <button type="submit" className="sr-only">Search</button>
            </div>
          </form>
          {query && (
            <button
              type="button"
              onClick={() => setParams(new URLSearchParams(), { replace: true })}
              className="mt-3 font-body text-ink underline underline-offset-4"
              style={{ fontSize: 15 }}
            >
              Clear search
            </button>
          )}

          {!ready ? (
            <p className="mt-10 font-body text-ink-soft">Loading the directory.</p>
          ) : !showCredits ? (
            <p className="mt-10 font-body text-ink-soft text-[16px]">No listings yet.</p>
          ) : visible.length === 0 ? (
            <p className="mt-10 font-body text-ink-soft text-[16px]">No architect credits match that search.</p>
          ) : (
            <>
              <ul className="mt-10 border-b border-ink/15">
                {visible.slice(0, shown).map((entry) => (
                  <li key={entry.id} className="border-t border-ink/15 py-4">
                    <p className="font-mono uppercase text-accent-terra" style={{ fontSize: 12, letterSpacing: "0.14em" }}>Architect credit</p>
                    <h2 className="mt-1 text-ink" style={{ fontWeight: 400, fontSize: "1.35rem", lineHeight: 1.15 }}>{entry.name}</h2>
                    <ul className="mt-2 space-y-1">
                      {entry.buildingsList.map((building) => (
                        <li key={building.slug}>
                          <Link to={`/projects/${building.slug}`} className="font-body text-ink-soft text-[15px] hover:text-ink">
                            {building.name}{building.city ? `, ${building.city}` : ""}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
              {shown < visible.length && (
                <button
                  type="button"
                  onClick={() => setShown((count) => count + PAGE_SIZE)}
                  className="mt-6 font-mono uppercase text-ink border-b border-ink pb-0.5"
                  style={{ fontSize: 12, letterSpacing: "0.14em" }}
                >
                  Show more
                </button>
              )}
            </>
          )}

          <p className="mt-12">
            <Link to="/d/" className="font-mono uppercase text-ink border-b border-ink pb-0.5" style={{ fontSize: 12, letterSpacing: "0.14em" }}>
              Back to Directory
            </Link>
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
