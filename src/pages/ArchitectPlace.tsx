import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SiteLayout from "@/components/site/SiteLayout";
import SEO from "@/components/site/SEO";
import {
  SPRINGFIELD_FACETS,
  SPRINGFIELD_FIRMS,
  SPRINGFIELD_PLACE,
  firmsForFacet,
} from "@/data/architectPlaces";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: SPRINGFIELD_PLACE.title,
  itemListOrder: "https://schema.org/ItemListUnordered",
  numberOfItems: SPRINGFIELD_FIRMS.length,
  itemListElement: SPRINGFIELD_FIRMS.map((firm) => ({
    "@type": "Organization",
    name: firm.name,
    url: firm.website,
    address: firm.office,
  })),
};

export default function ArchitectPlace() {
  return (
    <SiteLayout>
      <SEO
        title={`${SPRINGFIELD_PLACE.title} - Siana Architecture`}
        description={SPRINGFIELD_PLACE.summary}
        canonical={`https://sianaarchitecture.com${SPRINGFIELD_PLACE.path}`}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <div className="vogue-titles home-paper pb-16" style={{ paddingTop: 76 }}>
        <div className="mx-auto max-w-[980px] px-6 lg:px-10 py-8">
          <nav aria-label="Breadcrumb" className="font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.14em" }}>
            <Link to="/d/" className="hover:text-ink">Directory</Link>
            <span aria-hidden="true"> / </span>
            <Link to="/d/architects" className="hover:text-ink">Architects</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page" className="text-ink">Springfield, Missouri</span>
          </nav>
          <h1 className="mt-4 text-ink" style={{ fontWeight: 400, fontSize: "clamp(2.1rem, 4vw, 3.3rem)", lineHeight: 1.08 }}>
            {SPRINGFIELD_PLACE.title}
          </h1>
          <p className="mt-4 max-w-2xl font-body text-ink text-[17px] leading-relaxed">{SPRINGFIELD_PLACE.summary}</p>

          <section className="mt-10" aria-labelledby="offices-heading">
            <h2 id="offices-heading" className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.7rem, 3vw, 2.4rem)" }}>Offices</h2>
            <ul className="mt-4 md:hidden space-y-3">
              {SPRINGFIELD_FIRMS.map((firm) => (
                <li key={firm.slug} className="border border-ink/15 px-4 py-3">
                  <a href={`#${firm.slug}`} className="text-ink" style={{ fontSize: "1.15rem" }}>{firm.name}</a>
                  <p className="mt-1 font-body text-ink-soft text-[15px]">{firm.office}</p>
                  <a href={firm.website} className="mt-2 inline-block font-body text-ink text-[15px] underline underline-offset-4" target="_blank" rel="noopener noreferrer">Practice website, external</a>
                </li>
              ))}
            </ul>
            <div className="mt-4 hidden md:block overflow-x-auto border border-ink/15">
              <table className="w-full min-w-[640px] text-left">
                <thead className="bg-paper-warm font-mono uppercase text-warm-gray" style={{ fontSize: 11, letterSpacing: "0.12em" }}>
                  <tr>
                    <th className="px-4 py-3 font-medium">Practice</th>
                    <th className="px-4 py-3 font-medium">Springfield office</th>
                    <th className="px-4 py-3 font-medium">Website</th>
                  </tr>
                </thead>
                <tbody>
                  {SPRINGFIELD_FIRMS.map((firm) => (
                    <tr key={firm.slug} className="border-t border-ink/10 align-top">
                      <th scope="row" className="px-4 py-3 font-normal">
                        <a href={`#${firm.slug}`} className="text-ink hover:underline">{firm.name}</a>
                      </th>
                      <td className="px-4 py-3 font-body text-[15px]">{firm.office}</td>
                      <td className="px-4 py-3 font-body text-[15px]">
                        <a href={firm.website} className="text-ink underline underline-offset-4" target="_blank" rel="noopener noreferrer">Practice website, external</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12" aria-labelledby="practices-heading">
            <h2 id="practices-heading" className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.7rem, 3vw, 2.4rem)" }}>Practices</h2>
            <div className="mt-6 space-y-8">
              {SPRINGFIELD_FIRMS.map((firm) => (
                <article key={firm.slug} id={firm.slug} className="scroll-mt-28 border-t border-ink/15 pt-6">
                  <h3 className="text-ink" style={{ fontWeight: 400, fontSize: "1.6rem" }}>{firm.name}</h3>
                  <p className="mt-2 font-body text-ink-soft text-[15px]">{firm.office}</p>
                  <p className="mt-3 max-w-2xl font-body text-ink text-[16px] leading-relaxed">{firm.summary}</p>
                  <ul className="mt-4 space-y-3">
                    {firm.projects.map((project) => (
                      <li key={project.url}>
                        <a href={project.url} className="text-ink underline underline-offset-4" target="_blank" rel="noopener noreferrer">{project.title}, external</a>
                        <span className="mt-1 block font-body text-ink-soft text-[14px]">{project.location}. {project.status}. {project.note}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-14" aria-labelledby="facets-heading">
            <h2 id="facets-heading" className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.7rem, 3vw, 2.4rem)" }}>Work</h2>
            <div className="mt-6 space-y-8">
              {SPRINGFIELD_FACETS.map((facet) => (
                <div key={facet.id} id={facet.id} className="scroll-mt-28">
                  <h3 className="text-ink" style={{ fontWeight: 400, fontSize: "1.35rem" }}>{facet.label}</h3>
                  <p className="mt-2 max-w-2xl font-body text-ink-soft text-[15px] leading-relaxed">{facet.intro}</p>
                  <ul className="mt-3 space-y-1">
                    {firmsForFacet(facet).map((firm) => (
                      <li key={firm.slug}>
                        <a href={`#${firm.slug}`} className="font-body text-ink text-[15px] underline underline-offset-4">{firm.name}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <details className="mt-14 border border-ink/15 px-4 py-3">
            <summary className="cursor-pointer font-body text-ink text-[16px] min-h-11">Sources</summary>
            <p className="mt-3 font-body text-ink-soft text-[15px] leading-relaxed">
              Checked {SPRINGFIELD_PLACE.checked}. The list order is an editorial selection. Office addresses come from each practice website. A project city can differ from the Springfield office. Practice-site photographs are not reproduced.
            </p>
            <ul className="mt-3 space-y-2">
              {SPRINGFIELD_FIRMS.map((firm) => (
                <li key={firm.website}>
                  <a href={firm.website} className="font-body text-ink text-[15px] underline underline-offset-4" target="_blank" rel="noopener noreferrer">{firm.name}, external</a>
                </li>
              ))}
            </ul>
          </details>

          <p className="mt-10">
            <Link to="/d/architects" className="font-mono uppercase text-ink border-b border-ink pb-0.5" style={{ fontSize: 12, letterSpacing: "0.14em" }}>Back to Architects</Link>
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
