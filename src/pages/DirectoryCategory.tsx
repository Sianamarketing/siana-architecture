import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import SiteLayout from "@/components/site/SiteLayout";
import SEO from "@/components/site/SEO";
import NotFound from "@/pages/NotFound";
import ResearchCoverageMap from "@/components/site/ResearchCoverageMap";
import { creditTableCsv, directoryCategory, filterDirectoryEntries, readMinutes, type DirectoryEntry } from "@/lib/directory";
import { profileForCredit } from "@/data/architectProfiles";
import { useDirectoryRecords } from "@/hooks/useDirectoryRecords";

const PREVIEW = 6;

export default function DirectoryCategory() {
  const { slug = "" } = useParams();
  const category = directoryCategory(slug);
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const city = params.get("city") || "All";
  const style = params.get("style") || "All";
  const [draft, setDraft] = useState(query);
  const [tableOpen, setTableOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const { entries, stories, pins, ready } = useDirectoryRecords();

  useEffect(() => { setDraft(query); }, [query]);
  useEffect(() => { setTableOpen(false); setListOpen(false); }, [query, city, style, slug]);

  const allCredits = useMemo(
    () => (category ? filterDirectoryEntries(entries, { category: category.slug }) : []),
    [category, entries],
  );
  const visible = useMemo(
    () => (category ? filterDirectoryEntries(entries, { query, category: category.slug, city, style }) : []),
    [category, entries, query, city, style],
  );

  if (!category) return <NotFound />;

  const showCredits = category.slug === "architects" && allCredits.length > 0;
  const cities = unique(allCredits.flatMap((entry) => entry.buildingsList.map((building) => building.city)));
  const styles = unique(allCredits.flatMap((entry) => entry.buildingsList.map((building) => building.style)));
  const shown = tableOpen ? visible : visible.slice(0, PREVIEW);
  const withPhoto = visible.filter((entry) => entry.image).slice(0, 3);
  const buildingSlugs = new Set(visible.flatMap((entry) => entry.buildingsList.map((building) => building.slug)));
  const mapPins = pins.filter((pin) => buildingSlugs.has(pin.slug));
  const research = stories.filter((story) => (story.linked_project_ids || []).length > 0);
  const sections = showCredits
    ? [
        { id: "credits", label: "Credits" },
        withPhoto.length ? { id: "photographs", label: "Photographs" } : null,
        mapPins.length ? { id: "locations", label: "Locations" } : null,
        { id: "list", label: "A to Z" },
        research.length ? { id: "research", label: "Research" } : null,
        { id: "about", label: "How this list is made" },
      ].filter(Boolean) as { id: string; label: string }[]
    : [];

  const write = (next: { q?: string; city?: string; style?: string }) => {
    const nextParams = new URLSearchParams();
    const q = next.q ?? query;
    const nextCity = next.city ?? city;
    const nextStyle = next.style ?? style;
    if (q.trim()) nextParams.set("q", q.trim());
    if (nextCity && nextCity !== "All") nextParams.set("city", nextCity);
    if (nextStyle && nextStyle !== "All") nextParams.set("style", nextStyle);
    setParams(nextParams, { replace: true });
  };

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    write({ q: draft });
  };

  const download = () => {
    const blob = new Blob([creditTableCsv(visible)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "siana-architect-credits.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SiteLayout>
      <SEO
        title={`${category.label} - Directory - Siana Architecture`}
        description={showCredits
          ? "Architect credits copied from published buildings. A shared credit stays one line. Locations are the buildings, not offices."
          : `${category.label} has no listings yet.`}
        canonical={`https://sianaarchitecture.com/d/${category.slug}`}
      />
      <div className="vogue-titles home-paper pb-16" style={{ paddingTop: 76 }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-10 py-8">
          <nav aria-label="Breadcrumb" className="font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.14em" }}>
            <Link to="/d/" className="hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]">Directory</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page" className="text-ink">{category.label}</span>
          </nav>
          <h1 id="overview" className="mt-4 text-ink" style={{ fontWeight: 400, fontSize: "clamp(2.2rem, 4vw, 3.4rem)", lineHeight: 1.08 }}>
            {category.label}
          </h1>
          <p className="mt-4 max-w-2xl font-body text-ink-soft text-[16px] leading-relaxed">
            {showCredits
              ? `${allCredits.length} credit ${allCredits.length === 1 ? "line" : "lines"} copied from published buildings. A line can name more than one person, and it stays one line. These are not reviewed firms.`
              : `${category.label} is not in the records yet.`}
          </p>

          <form role="search" onSubmit={onSearch} className="mt-8 max-w-xl">
            <label htmlFor="category-search" className="font-body text-ink" style={{ fontSize: 14 }}>
              Search {category.label}
            </label>
            <div className="mt-1 border-b border-ink/40">
              <input
                id="category-search"
                name="q"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={showCredits ? "Credits, buildings, or cities" : "Nothing to search yet"}
                className="w-full h-12 bg-transparent font-body text-[16px] text-ink placeholder:text-ink-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]"
              />
              <button type="submit" className="sr-only">Search</button>
            </div>
          </form>
          {query && (
            <button type="button" onClick={() => write({ q: "" })} className="mt-3 font-body text-ink underline underline-offset-4" style={{ fontSize: 15 }}>
              Clear search
            </button>
          )}

          {showCredits && (cities.length > 0 || styles.length > 0) && (
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {cities.length > 0 && (
                <Filter label="Project location" value={city} options={cities} onChange={(value) => write({ city: value })} />
              )}
              {styles.length > 0 && (
                <Filter label="Building style" value={style} options={styles} onChange={(value) => write({ style: value })} />
              )}
            </div>
          )}

          {!ready ? (
            <p className="mt-10 font-body text-ink-soft">Loading the directory.</p>
          ) : !showCredits ? (
            <p className="mt-10 font-body text-ink text-[16px]">No listings yet.</p>
          ) : (
            <>
              {sections.length > 1 && (
                <nav aria-label="On this page" className="sticky top-[76px] z-20 mt-8 -mx-6 px-6 py-3 overflow-x-auto bg-white/95 border-y border-ink/10">
                  <ul className="flex gap-4 min-w-max">
                    {sections.map((section) => (
                      <li key={section.id}>
                        <a href={`#${section.id}`} className="inline-flex h-11 items-center font-mono uppercase text-ink-soft hover:text-ink" style={{ fontSize: 12, letterSpacing: "0.12em" }}>
                          {section.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              <section id="credits" className="mt-10" aria-labelledby="credits-heading">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                  <h2 id="credits-heading" className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.7rem, 3vw, 2.3rem)", lineHeight: 1.1 }}>
                    Credits on published buildings
                  </h2>
                  <button type="button" onClick={download} className="self-start font-mono uppercase text-ink border-b border-ink pb-0.5" style={{ fontSize: 12, letterSpacing: "0.12em" }}>
                    Download this list
                  </button>
                </div>
                <p className="mt-3 max-w-2xl font-body text-ink-soft text-[15px]">The places named here are the buildings, not an office address. The list is not a ranking.</p>
                {visible.filter((entry) => profileForCredit(entry.name)).map((entry) => (
                  <p key={entry.id} className="mt-3">
                    <Link to={`/d/architects/${profileForCredit(entry.name)!.slug}`} className="font-mono uppercase text-accent-terra" style={{ fontSize: 12, letterSpacing: "0.12em" }}>
                      Practice page for {entry.name}
                    </Link>
                  </p>
                ))}
                {visible.length === 0 ? (
                  <p className="mt-6 font-body text-ink-soft">No architect credits match that search.</p>
                ) : (
                  <>
                    <div className="mt-6 overflow-x-auto border border-ink/15">
                      <table className="w-full min-w-[640px] text-left">
                        <thead className="bg-paper-warm font-mono uppercase text-warm-gray" style={{ fontSize: 11, letterSpacing: "0.12em" }}>
                          <tr>
                            <th className="px-4 py-3 font-medium">Credit</th>
                            <th className="px-4 py-3 font-medium">Buildings</th>
                            <th className="px-4 py-3 font-medium">Project location</th>
                            <th className="px-4 py-3 font-medium">Building</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shown.map((entry) => (
                            <tr key={entry.id} className="border-t border-ink/10 align-top">
                              <th scope="row" className="px-4 py-3 font-normal text-ink" style={{ fontSize: "1.05rem" }}>
                                {entry.name}
                                {profileForCredit(entry.name) && (
                                  <Link to={`/d/architects/${profileForCredit(entry.name)!.slug}`} className="mt-1 block font-mono uppercase text-accent-terra" style={{ fontSize: 11, letterSpacing: "0.12em" }}>Practice page</Link>
                                )}
                              </th>
                              <td className="px-4 py-3 font-body text-ink-soft text-[15px]">{entry.buildings}</td>
                              <td className="px-4 py-3 font-body text-ink-soft text-[15px]">{locations(entry) || "Not recorded"}</td>
                              <td className="px-4 py-3 font-body text-[15px]">
                                {entry.buildingsList.map((building) => (
                                  <Link key={building.slug} to={`/projects/${building.slug}`} className="block text-ink hover:underline">
                                    {building.name}
                                  </Link>
                                ))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {visible.length > PREVIEW && (
                      <button type="button" onClick={() => setTableOpen((open) => !open)} className="mt-4 font-mono uppercase text-ink border-b border-ink pb-0.5" style={{ fontSize: 12, letterSpacing: "0.12em" }}>
                        {tableOpen ? "Show fewer credits" : `View every credit (${visible.length})`}
                      </button>
                    )}
                  </>
                )}
              </section>

              {withPhoto.length > 0 && (
                <section id="photographs" className="mt-14" aria-labelledby="photographs-heading">
                  <h2 id="photographs-heading" className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.7rem, 3vw, 2.3rem)", lineHeight: 1.1 }}>
                    Credits with a building photograph
                  </h2>
                  <ul className="mt-6 space-y-4">
                    {withPhoto.map((entry) => (
                      <li key={entry.id} className="border border-ink/15 bg-paper grid grid-cols-1 md:grid-cols-[220px_1fr]">
                        <img src={entry.image || ""} alt={entry.alt} className="w-full h-48 md:h-full object-cover bg-paper-mid" />
                        <div className="p-5">
                          <p className="font-mono uppercase text-accent-terra" style={{ fontSize: 12, letterSpacing: "0.14em" }}>Architect credit</p>
                          <h3 className="mt-2 text-ink" style={{ fontWeight: 400, fontSize: "1.6rem", lineHeight: 1.15 }}>{entry.name}</h3>
                          {profileForCredit(entry.name) && (
                            <Link to={`/d/architects/${profileForCredit(entry.name)!.slug}`} className="mt-2 inline-block font-mono uppercase text-accent-terra" style={{ fontSize: 11, letterSpacing: "0.12em" }}>Practice page</Link>
                          )}
                          <ul className="mt-3 space-y-1">
                            {entry.buildingsList.map((building) => (
                              <li key={building.slug}>
                                <Link to={`/projects/${building.slug}`} className="font-body text-ink-soft text-[15px] hover:text-ink">
                                  {building.name}{building.city ? `, ${building.city}` : ""}{building.style ? ` · ${building.style}` : ""}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {mapPins.length > 0 && (
                <section id="locations" className="mt-14" aria-labelledby="locations-heading">
                  <h2 id="locations-heading" className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.7rem, 3vw, 2.3rem)", lineHeight: 1.1 }}>
                    Where the buildings stand
                  </h2>
                  <p className="mt-3 max-w-2xl font-body text-ink-soft text-[15px]">These marks are the published buildings. They are not office addresses.</p>
                  <div className="mt-6">
                    <ResearchCoverageMap pins={mapPins} />
                  </div>
                </section>
              )}

              <section id="list" className="mt-14" aria-labelledby="list-heading">
                <h2 id="list-heading" className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.7rem, 3vw, 2.3rem)", lineHeight: 1.1 }}>
                  Every credit, A to Z
                </h2>
                <button type="button" onClick={() => setListOpen((open) => !open)} className="mt-4 font-mono uppercase text-ink border-b border-ink pb-0.5" style={{ fontSize: 12, letterSpacing: "0.12em" }} aria-expanded={listOpen}>
                  {listOpen ? "Hide the list" : "Open the A to Z list"}
                </button>
                {listOpen && (
                  <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
                    {visible.slice().sort((a, b) => a.name.localeCompare(b.name)).map((entry) => (
                      <li key={entry.id}>
                        <Link to={entry.href} className="font-body text-ink text-[15px] hover:underline">{entry.name}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {research.length > 0 && (
                <section id="research" className="mt-14" aria-labelledby="research-heading">
                  <h2 id="research-heading" className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.7rem, 3vw, 2.3rem)", lineHeight: 1.1 }}>
                    Research linked to buildings
                  </h2>
                  <ul className="mt-6 border-b border-ink/15">
                    {research.map((story) => (
                      <li key={story.id} className="border-t border-ink/15 py-4">
                        <Link to={`/practice/${story.slug}`} className="block">
                          {story.category && <span className="font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.12em" }}>{story.category}</span>}
                          <span className="mt-1 block text-ink" style={{ fontSize: "1.25rem", lineHeight: 1.2 }}>{story.title}</span>
                          {readMinutes(story.body) ? <span className="mt-1 block font-mono text-warm-gray" style={{ fontSize: 12 }}>{readMinutes(story.body)} min</span> : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section id="about" className="mt-14" aria-labelledby="about-heading">
                <h2 id="about-heading" className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.7rem, 3vw, 2.3rem)", lineHeight: 1.1 }}>
                  How this list is made
                </h2>
                <p className="mt-4 max-w-2xl font-body text-ink-soft text-[16px] leading-relaxed">
                  Each line is the architect field on a published building in Siana Architecture. The line is copied as stored. A shared credit is not split into separate people, and nothing here is scored, priced, or ranked. A place is the city recorded on the building.
                </p>
                <div className="mt-6 max-w-2xl space-y-3">
                  <Faq question="Are these firms?">No. A credit can name a practice, one person, or several people together. It stays one line.</Faq>
                  <Faq question="Are the places offices?">No. They are the published buildings linked to that credit.</Faq>
                  <Faq question="Why are the other directory categories empty?">Interior designers, product manufacturers, designers, tools, and marketing agencies have no records yet.</Faq>
                </div>
              </section>
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

function Filter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.12em" }}>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 block h-11 min-w-[180px] border border-ink/20 bg-paper px-3 font-body text-ink normal-case" style={{ fontSize: 16, letterSpacing: 0 }}>
        <option>All</option>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Faq({ question, children }: { question: string; children: string }) {
  return (
    <details className="border border-ink/15 bg-paper px-4 py-3">
      <summary className="cursor-pointer font-body text-ink text-[16px]">{question}</summary>
      <p className="mt-2 font-body text-ink-soft text-[15px] leading-relaxed">{children}</p>
    </details>
  );
}

function locations(entry: DirectoryEntry) {
  return [...new Set(entry.buildingsList.map((building) => building.city).filter(Boolean))].join(", ");
}

function unique(values: Array<string | null>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b));
}
