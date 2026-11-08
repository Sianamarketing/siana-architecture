import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SiteLayout from "@/components/site/SiteLayout";
import SEO from "@/components/site/SEO";
import FirmMark from "@/components/site/FirmMark";
import ProjectFeature from "@/components/site/ProjectFeature";
import {
  EXPERIENCE_MATRIX,
  GUIDE_SECTIONS,
  SPRINGFIELD_FIRMS,
  SPRINGFIELD_PLACE,
  guideProject,
  officeLine,
} from "@/data/architectPlaces";

const profileUrl = (slug: string) => `/d/architects/${slug}`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Directory", item: "https://sianaarchitecture.com/d/" },
        { "@type": "ListItem", position: 2, name: "Architects", item: "https://sianaarchitecture.com/d/architects" },
        { "@type": "ListItem", position: 3, name: "Springfield, Missouri", item: `https://sianaarchitecture.com${SPRINGFIELD_PLACE.path}` },
      ],
    },
    {
      "@type": "ItemList",
      name: SPRINGFIELD_PLACE.title,
      itemListOrder: "https://schema.org/ItemListUnordered",
      numberOfItems: SPRINGFIELD_FIRMS.length,
      itemListElement: SPRINGFIELD_FIRMS.map((firm) => ({
        "@type": "Organization",
        name: firm.name,
        url: `https://sianaarchitecture.com${profileUrl(firm.slug)}`,
        sameAs: firm.website,
      })),
    },
  ],
};

function RegistrationLines({ firmSlug }: { firmSlug: string }) {
  const firm = SPRINGFIELD_FIRMS.find((item) => item.slug === firmSlug);
  const architect = firm?.registration.find((item) => item.status.startsWith("Missouri registered architect: "));
  if (!architect) return null;
  return <p className="font-body text-[15px] leading-snug">{architect.status.replace("Missouri registered architect: ", "")}</p>;
}

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
        <div className="mx-auto max-w-[1040px] px-6 lg:px-10 py-8">
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
                <li key={firm.slug} id={`${firm.slug}-card`} className="border border-ink/15 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FirmMark profile={firm} />
                    <Link to={profileUrl(firm.slug)} className="text-ink" style={{ fontSize: "1.15rem" }}>{firm.name}</Link>
                  </div>
                  <p className="mt-2 font-body text-ink-soft text-[15px]">{officeLine(firm)}</p>
                  <p className="mt-2 font-body text-ink text-[15px] leading-snug">{firm.experience}</p>
                  <div className="mt-2"><RegistrationLines firmSlug={firm.slug} /></div>
                  <a href={firm.website} className="mt-2 inline-block font-body text-ink text-[15px] underline underline-offset-4" target="_blank" rel="noopener noreferrer">Practice website, external</a>
                </li>
              ))}
            </ul>
            <div className="mt-4 hidden md:block overflow-x-auto border border-ink/15" tabIndex={0} role="region" aria-label="Springfield offices. Scroll sideways if a column is out of view.">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-paper-warm font-mono uppercase text-warm-gray" style={{ fontSize: 11, letterSpacing: "0.12em" }}>
                  <tr>
                    <th className="px-4 py-3 font-medium">Practice</th>
                    <th className="px-4 py-3 font-medium">Project experience</th>
                    <th className="px-4 py-3 font-medium">Architect registration</th>
                    <th className="px-4 py-3 font-medium">Springfield office</th>
                  </tr>
                </thead>
                <tbody>
                  {SPRINGFIELD_FIRMS.map((firm) => (
                    <tr key={firm.slug} id={firm.slug} className="border-t border-ink/10 align-top scroll-mt-28">
                      <th scope="row" className="px-4 py-3 font-normal">
                        <div className="flex items-center gap-3">
                          <FirmMark profile={firm} />
                          <Link to={profileUrl(firm.slug)} className="text-ink hover:underline">{firm.name}</Link>
                        </div>
                      </th>
                      <td className="px-4 py-3 font-body text-[15px] leading-snug">{firm.experience}</td>
                      <td className="px-4 py-3"><RegistrationLines firmSlug={firm.slug} /></td>
                      <td className="px-4 py-3 font-body text-[15px]">
                        {officeLine(firm)}
                        <a href={firm.website} className="mt-1 block text-ink underline underline-offset-4" target="_blank" rel="noopener noreferrer">Practice website, external</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {GUIDE_SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28 mt-14" aria-labelledby={`${section.id}-heading`}>
              <h2 id={`${section.id}-heading`} className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.7rem, 3vw, 2.4rem)" }}>{section.title}</h2>
              <p className="mt-3 max-w-2xl font-body text-ink text-[16px] leading-relaxed">{section.intro}</p>
              <div className="mt-4">
                {section.rows.map((row) => {
                  const match = guideProject(row);
                  if (!match) return null;
                  return (
                    <ProjectFeature
                      key={`${row.firmSlug}-${row.projectName}`}
                      id={row.anchor}
                      project={match.project}
                      firmName={match.firm.name}
                      firmPath={profileUrl(match.firm.slug)}
                    />
                  );
                })}
              </div>
            </section>
          ))}

          <section id="practice-types" className="scroll-mt-28 mt-14" aria-labelledby="practice-types-heading">
            <h2 id="practice-types-heading" className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.7rem, 3vw, 2.4rem)" }}>Practice types and specialist briefs</h2>
            <div className="mt-4 max-w-2xl space-y-3 font-body text-ink text-[16px] leading-relaxed">
              <p id="boutique">Arkifex Studios is a boutique firm.</p>
              <p id="engineering">Buxton Kubik Dodd Design Collective practices architecture, engineering, and interior design. In-house engineering was added in 2013.</p>
              <p id="luxury">Township 28 is a luxury apartment community. Caesars Republic Scottsdale is a luxury hotel.</p>
              <p id="resorts">Chateau on the Lake is in Branson, in the BKD portfolio.</p>
            </div>

            <h3 className="mt-8 text-ink" style={{ fontWeight: 400, fontSize: "1.35rem" }}>By kind of work</h3>
            <ul className="mt-4 md:hidden space-y-3">
              {EXPERIENCE_MATRIX.map((row) => {
                const firm = SPRINGFIELD_FIRMS.find((item) => item.slug === row.slug);
                if (!firm) return null;
                return (
                  <li key={row.slug} className="border border-ink/15 px-4 py-3">
                    <Link to={profileUrl(firm.slug)} className="text-ink" style={{ fontSize: "1.05rem" }}>{firm.name}</Link>
                    {row.homes && <p className="mt-2 font-body text-[15px]"><span className="text-ink-soft">Homes. </span>{row.homes}</p>}
                    {row.commercial && <p className="mt-1 font-body text-[15px]"><span className="text-ink-soft">Commercial and public. </span>{row.commercial}</p>}
                    <p className="mt-1 font-body text-ink-soft text-[14px]">{row.note}</p>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 hidden md:block overflow-x-auto border border-ink/15" tabIndex={0} role="region" aria-label="Work by practice. Scroll sideways if a column is out of view.">
              <table className="w-full min-w-[720px] text-left">
                <thead className="bg-paper-warm font-mono uppercase text-warm-gray" style={{ fontSize: 11, letterSpacing: "0.12em" }}>
                  <tr>
                    <th className="px-4 py-3 font-medium">Practice</th>
                    <th className="px-4 py-3 font-medium">Homes</th>
                    <th className="px-4 py-3 font-medium">Commercial and public</th>
                    <th className="px-4 py-3 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {EXPERIENCE_MATRIX.map((row) => {
                    const firm = SPRINGFIELD_FIRMS.find((item) => item.slug === row.slug);
                    if (!firm) return null;
                    return (
                      <tr key={row.slug} className="border-t border-ink/10 align-top">
                        <th scope="row" className="px-4 py-3 font-normal">
                          <Link to={profileUrl(firm.slug)} className="text-ink hover:underline">{firm.name}</Link>
                        </th>
                        <td className="px-4 py-3 font-body text-[15px]">{row.homes}</td>
                        <td className="px-4 py-3 font-body text-[15px]">{row.commercial}</td>
                        <td className="px-4 py-3 font-body text-[15px]">{row.note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <details className="mt-14 border border-ink/15 px-4 py-3">
            <summary className="cursor-pointer font-body text-ink text-[16px] min-h-11">Sources</summary>
            <p className="mt-3 font-body text-ink-soft text-[15px] leading-relaxed">
              Checked {SPRINGFIELD_PLACE.checked} in the Active Licensee Only search at the <a href="https://mopro.mo.gov/license/s/license-search" className="underline underline-offset-4" target="_blank" rel="noopener noreferrer">Missouri licensee search, external</a>. Detail pages do not label a record Active. Baron Design & Associates, LLC is Architectural Corporation no. 2003003845. The firm site gives 2003003845-D. Janet Rothberg White, no. 003658, is the architect in charge. Rita Baron: not verified. Firm certificates for the other practices: not verified. The list order is an editorial selection. Logos are the practices' own marks, shown small to identify them, and are not Creative Commons images. N·FORM Architecture is named in type. Project photographs are not shown.
            </p>
            <ul className="mt-3 space-y-2">
              {SPRINGFIELD_FIRMS.map((firm) => (
                <li key={firm.slug}>
                  <Link to={profileUrl(firm.slug)} className="font-body text-ink text-[15px] underline underline-offset-4">{firm.name}</Link>
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
