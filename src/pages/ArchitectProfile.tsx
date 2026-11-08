import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SiteLayout from "@/components/site/SiteLayout";
import SEO from "@/components/site/SEO";
import NotFound from "@/pages/NotFound";
import ProjectFeature from "@/components/site/ProjectFeature";
import { profileBySlug, profileStructuredData, type ArchitectProfile, type ProfileImage, type SelectedProject } from "@/data/architectProfiles";

function navFor(profile: ArchitectProfile): [string, string][] {
  const rows = profile.projectPresentation === "rows";
  const items: [string, string][] = [["overview", "Overview"]];
  if (!rows && profile.projects.some((project) => project.image)) items.push(["portfolio", "Portfolio"]);
  if (profile.approach.length) items.push(["approach", "Approach"]);
  if (profile.projects.length) items.push(["projects", rows ? "Projects" : "Selected projects"]);
  if (profile.sectors.length || profile.services.length || profile.principals.length || profile.seniorPartners.length) items.push(["practice", "Practice"]);
  if (!rows && profile.services.length) items.push(["services", "Services"]);
  if (profile.offices.length || profile.registration.length) items.push(["places", rows ? "Offices" : "Places"]);
  if (profile.awards.length) items.push(["recognition", "Recognition"]);
  items.push(["sources", "Sources"]);
  return items;
}

export default function ArchitectProfile() {
  const { profileSlug } = useParams();
  const profile = profileBySlug(profileSlug);
  const items = profile ? navFor(profile) : [["overview", "Overview"] as [string, string]];
  const [active, setActive] = useState<string>(items[0][0]);
  useEffect(() => {
    const current = profileBySlug(profileSlug);
    const ids = (current ? navFor(current) : [["overview", "Overview"]]).map(([id]) => id);
    const onScroll = () => {
      const line = 120;
      let next: string = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) next = id;
      }
      setActive(next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [profileSlug]);
  if (!profile) return <NotFound />;
  const rows = profile.projectPresentation === "rows";

  const photos = profile.projects.filter((project) => project.image);

  return (
    <SiteLayout>
      <SEO
        title={`${profile.name} - Directory - Siana Architecture`}
        description={profile.summary}
        canonical={`https://sianaarchitecture.com/d/architects/${profile.slug}`}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(profileStructuredData(profile))}</script>
      </Helmet>
      <div className="vogue-titles home-paper pb-16" style={{ paddingTop: 76 }}>
        <div className="mx-auto max-w-[1180px] px-6 lg:px-10 py-8">
          <nav aria-label="Breadcrumb" className="font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.14em" }}>
            <Link to="/d/" className="hover:text-ink">Directory</Link>
            <span aria-hidden="true"> / </span>
            <Link to="/d/architects" className="hover:text-ink">Architects</Link>
            {profile.guide && (
              <>
                <span aria-hidden="true"> / </span>
                <Link to={profile.guide.path} className="hover:text-ink">{profile.guide.label}</Link>
              </>
            )}
            <span aria-hidden="true"> / </span>
            <span aria-current="page" className="text-ink">{profile.name}</span>
          </nav>

          <header id="overview" tabIndex={-1} className="scroll-mt-28 mt-6 outline-none">
            <div className="flex items-center gap-4">
              {profile.mark && (
                <img
                  src={profile.mark.src}
                  alt={profile.mark.permissionStatus === "official-identifying-mark" ? "" : profile.mark.alt}
                  className={`${profile.markOnInk ? "bg-ink px-2 py-1" : ""} h-8 sm:h-10 w-auto max-w-[11rem] object-contain shrink-0`}
                />
              )}
              <h1 className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(2.2rem, 5vw, 4rem)", lineHeight: 1.02 }}>
                {profile.name}
              </h1>
            </div>
            <p className="mt-4 max-w-2xl font-body text-ink text-[18px] leading-snug">{profile.summary}</p>
          </header>

          <div className="mt-8 flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-x-10 lg:items-start">
            <div className="min-w-0 order-2 lg:order-none lg:col-start-1">
              <section className="max-w-3xl space-y-4">
                {profile.overview.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)} className="font-body text-ink text-[16px] leading-relaxed">{paragraph}</p>
                ))}
              </section>

              {!rows && photos.length > 0 && (
              <section id="portfolio" className="scroll-mt-28 mt-14" aria-labelledby="portfolio-heading">
                <h2 id="portfolio-heading" tabIndex={-1} className="text-ink outline-none" style={{ fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.05 }}>Portfolio</h2>
                <ul className="mt-6 columns-1 sm:columns-2 xl:columns-3 gap-3">
                  {photos.map((project) => (
                    <li key={project.name} className="mb-3 break-inside-avoid">
                      <ProjectPhoto project={project} />
                    </li>
                  ))}
                </ul>
              </section>
              )}

              {profile.approach.length > 0 && (
              <section id="approach" className="scroll-mt-28 mt-14 max-w-3xl" aria-labelledby="approach-heading">
                <h2 id="approach-heading" tabIndex={-1} className="text-ink outline-none" style={{ fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.05 }}>Design approach</h2>
                <div className="mt-4 space-y-4">
                  {profile.approach.map((paragraph) => (
                    <p key={paragraph.slice(0, 24)} className="font-body text-ink text-[16px] leading-relaxed">{paragraph}</p>
                  ))}
                </div>
              </section>
              )}

              <section id="projects" className="scroll-mt-28 mt-14" aria-labelledby="projects-heading">
                <h2 id="projects-heading" tabIndex={-1} className="text-ink outline-none" style={{ fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.05 }}>{rows ? "Projects" : "Selected projects"}</h2>
                {rows ? (
                  <div className="mt-4">
                    {profile.projects.map((project) => (
                      <ProjectFeature key={project.name} project={project} />
                    ))}
                  </div>
                ) : (
                <>
                <p className="mt-3 max-w-2xl font-body text-ink-soft text-[15px]">Ten projects, in the order of the years on the practice's project pages. A client or a collaborator is included when that page gives one.</p>
                <div className="mt-6 overflow-x-auto border border-ink/15">
                  <table className="w-full min-w-[720px] text-left">
                    <thead className="bg-paper-warm font-mono uppercase text-warm-gray" style={{ fontSize: 11, letterSpacing: "0.12em" }}>
                      <tr>
                        <th className="px-4 py-3 font-medium">Project</th>
                        <th className="px-4 py-3 font-medium">Place</th>
                        <th className="px-4 py-3 font-medium">Year</th>
                        <th className="px-4 py-3 font-medium">Use</th>
                        <th className="px-4 py-3 font-medium">Client</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.projects.map((project) => (
                        <tr key={project.name} className="border-t border-ink/10 align-top">
                          <th scope="row" className="px-4 py-3 font-normal">
                            <ProjectLink project={project} />
                            <span className="mt-1 block font-body text-warm-gray text-[13px]">{project.status}</span>
                            {project.collaborators && (
                              <span className="mt-1 block font-body text-ink-soft text-[13px]">With: {project.collaborators}</span>
                            )}
                          </th>
                          <td className="px-4 py-3 font-body text-[15px]">{project.city}, {project.country}</td>
                          <td className="px-4 py-3 font-body text-[15px]">{project.year}</td>
                          <td className="px-4 py-3 font-body text-[15px]">{project.use}</td>
                          <td className="px-4 py-3 font-body text-[15px]">{project.client || "Not verified"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
                )}
              </section>

              <section id="practice" className="scroll-mt-28 mt-14" aria-labelledby="practice-heading">
                <h2 id="practice-heading" tabIndex={-1} className="text-ink outline-none" style={{ fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.05 }}>Practice</h2>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <article className="border border-ink/15 p-5">
                    <h3 className="font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.14em" }}>Project sectors</h3>
                    <ul className="mt-3 space-y-2 font-body text-[15px] text-ink">
                      {profile.sectors.map((sector) => <li key={sector}>{sector}</li>)}
                    </ul>
                  </article>
                  <article className="border border-ink/15 p-5">
                    <h3 className="font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.14em" }}>Size and model</h3>
                    <p className="mt-3 font-body text-[15px] leading-relaxed">{profile.practiceModel}</p>
                    <p className="mt-3 font-body text-[15px] leading-relaxed">{profile.peopleNote}</p>
                  </article>
                </div>
                <h3 id="services" tabIndex={-1} className="scroll-mt-28 mt-8 text-ink outline-none" style={{ fontWeight: 400, fontSize: "1.5rem" }}>Services</h3>
                <ul className="mt-3 max-w-3xl space-y-2 font-body text-[15px] text-ink">
                  {profile.services.map((service) => <li key={service}>{service}</li>)}
                </ul>
                {profile.principals.length > 0 && (
                  <>
                    <h3 className="mt-8 text-ink" style={{ fontWeight: 400, fontSize: "1.5rem" }}>Principals</h3>
                    <ul className={`mt-4 ${profile.principals.some((person) => person.image) ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "max-w-3xl"}`}>
                      {profile.principals.map((person) => (
                        <li key={person.name} className={person.image ? "border border-ink/15" : "border-t border-ink/10 py-3"}>
                          {person.image && (
                            <img src={person.image.src} alt={person.image.alt} className="w-full h-80 object-cover object-top bg-paper-mid" />
                          )}
                          <div className={person.image ? "p-5" : ""}>
                            <p className="text-ink" style={{ fontSize: "1.4rem" }}>{person.name}</p>
                            <p className="mt-1 font-mono uppercase text-accent-terra" style={{ fontSize: 12, letterSpacing: "0.12em" }}>{person.role}</p>
                            {person.note ? <p className="mt-3 font-body text-ink-soft text-[15px] leading-relaxed">{person.note}</p> : null}
                            {person.image && <ImageCredit image={person.image} />}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {profile.seniorPartners.length > 0 && (
                  <>
                    <h3 className="mt-8 text-ink" style={{ fontWeight: 400, fontSize: "1.5rem" }}>Senior partners</h3>
                    <p className="mt-3 max-w-2xl font-body text-ink-soft text-[15px]">Listed on the organization page.</p>
                    <ul className="mt-4 columns-1 sm:columns-2 gap-x-8 font-body text-[15px] text-ink">
                      {profile.seniorPartners.map((name) => <li key={name} className="border-t border-ink/10 py-2 break-inside-avoid">{name}</li>)}
                    </ul>
                  </>
                )}
              </section>

              <section id="places" className="scroll-mt-28 mt-14" aria-labelledby="places-heading">
                <h2 id="places-heading" tabIndex={-1} className="text-ink outline-none" style={{ fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.05 }}>Offices and registration</h2>
                <p className="mt-3 max-w-2xl font-body text-ink-soft text-[15px]">{rows ? "The office is the studio address. A project city can differ from that office." : "These are the offices on the practice site. The cities in the project table are the buildings."}</p>
                <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.offices.map((office) => (
                    <li key={office.city} className="border border-ink/15 px-4 py-3">
                      <span className="block text-ink" style={{ fontSize: "1.2rem" }}>{office.city}</span>
                      <span className="mt-1 block font-body text-ink-soft text-[14px]">{office.country}. {office.role}</span>
                    </li>
                  ))}
                </ul>
                {rows ? (
                  <ul className="mt-6 max-w-3xl space-y-4">
                    {profile.registration.map((item) => (
                      <li key={item.place}>
                        <span className="font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.12em" }}>{item.place}</span>
                        <span className="mt-1 block text-ink">{item.status}</span>
                        <span className="mt-1 block font-body text-ink-soft text-[15px]">{item.note}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                <details className="mt-8 border border-ink/15 px-4 py-3">
                  <summary className="cursor-pointer font-body text-ink text-[16px] min-h-11">Registration notes</summary>
                  <ul className="mt-3 space-y-3">
                    {profile.registration.map((item) => (
                      <li key={item.place}>
                        <span className="font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.12em" }}>{item.place}</span>
                        <span className="mt-1 block text-ink">{item.status}</span>
                        <span className="mt-1 block font-body text-ink-soft text-[15px]">{item.note}</span>
                      </li>
                    ))}
                  </ul>
                </details>
                )}
              </section>

              {profile.awards.length > 0 && (
              <section id="recognition" className="scroll-mt-28 mt-14" aria-labelledby="recognition-heading">
                <h2 id="recognition-heading" tabIndex={-1} className="text-ink outline-none" style={{ fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.05 }}>Awards</h2>
                <p className="mt-3 max-w-2xl font-body text-ink-soft text-[15px]">Person awards and project awards are listed separately. A prize here is not a professional licence.</p>
                <ul className="mt-6 border-b border-ink/15">
                  {profile.awards.map((award) => (
                    <li key={`${award.year}-${award.name}`} className="border-t border-ink/15 py-4 grid grid-cols-1 sm:grid-cols-[5rem_1fr] gap-2">
                      <span className="font-mono text-warm-gray" style={{ fontSize: 13 }}>{award.year}</span>
                      <span>
                        <a href={award.sourceUrl} className="text-ink hover:underline" rel="noopener noreferrer">{award.name}</a>
                        <span className="mt-1 block font-body text-ink-soft text-[14px]">{award.issuer}. {award.scope === "person" ? "Awarded to people" : "Awarded to a project"}: {award.subject}.</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
              )}

              <details id="sources" className="scroll-mt-28 mt-14 border border-ink/15 px-4 py-3">
                <summary className="cursor-pointer min-h-11">
                  <h2 id="sources-heading" tabIndex={-1} className="inline text-ink outline-none" style={{ fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.05 }}>Sources</h2>
                </summary>
                <p className="mt-3 font-body text-ink-soft text-[15px]">{profile.sourcesNote ?? `Checked ${profile.checked}. CaixaForum Madrid opens its page on Siana. The other portfolio photographs open the practice project page. Each caption names the photographer and the licence.`}</p>
                {profile.mark && profile.mark.permissionStatus !== "official-identifying-mark" && (
                  <p className="mt-3 max-w-2xl font-body text-ink-soft text-[14px] leading-relaxed">
                    {profile.mark.attribution}.{" "}
                    <a href={profile.mark.licenseUrl} className="underline underline-offset-4" target="_blank" rel="noopener noreferrer">Licence, external</a>.{" "}
                    <a href={profile.mark.sourceUrl} className="underline underline-offset-4" target="_blank" rel="noopener noreferrer">File page, external</a>.{" "}
                    {profile.mark.caveat} Portraits on the practice website are credited to Gina Folly and are not reproduced here.
                  </p>
                )}
                <ul className="mt-4 space-y-2">
                  {profile.sources.map((source) => (
                    <li key={source.url}>
                      <a href={source.url} className="font-body text-ink text-[15px] underline underline-offset-4" target="_blank" rel="noopener noreferrer">{source.label}</a>
                    </li>
                  ))}
                </ul>
                <p className="mt-8">
                  <Link to="/d/architects" className="font-mono uppercase text-ink border-b border-ink pb-0.5" style={{ fontSize: 12, letterSpacing: "0.14em" }}>Back to Architects</Link>
                </p>
              </details>
            </div>

            <aside className="order-1 lg:order-none lg:col-start-2 lg:sticky lg:top-[88px] lg:self-start lg:max-h-[calc(100vh-104px)] lg:overflow-y-auto" style={{ overscrollBehavior: "contain" }}>
              <section aria-labelledby="facts-heading" className="border border-ink/15 p-4">
                <h2 id="facts-heading" className="font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.14em" }}>Facts</h2>
                <dl className="mt-3">
                  {profile.facts.map((fact) => (
                    <div key={fact.label} className="grid grid-cols-[6.5rem_1fr] gap-2 border-t border-ink/10 py-2">
                      <dt className="font-mono uppercase text-warm-gray" style={{ fontSize: 11, letterSpacing: "0.08em" }}>{fact.label}</dt>
                      <dd className="font-body text-ink text-[14px] leading-snug">{fact.value}</dd>
                    </div>
                  ))}
                  <div className="grid grid-cols-[6.5rem_1fr] gap-2 border-t border-ink/10 py-2">
                    <dt className="font-mono uppercase text-warm-gray" style={{ fontSize: 11, letterSpacing: "0.08em" }}>Site</dt>
                    <dd className="font-body text-[14px]">
                      <a href={profile.website} className="text-ink underline underline-offset-4" target="_blank" rel="noopener noreferrer">Practice website, external</a>
                    </dd>
                  </div>
                </dl>
              </section>

              <details className="lg:hidden mt-3 border border-ink/15">
                <summary className="cursor-pointer px-4 py-3 font-mono uppercase text-ink min-h-11" style={{ fontSize: 12, letterSpacing: "0.14em" }}>Contents</summary>
                <Contents active={active} items={items} />
              </details>
              <nav aria-label="Contents" className="hidden lg:block mt-4 border border-ink/15 bg-white">
                <p className="px-4 pt-3 font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.14em" }}>Contents</p>
                <Contents active={active} items={items} />
              </nav>
            </aside>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function Contents({ active, items }: { active: string; items: [string, string][] }) {
  return (
    <ol className="px-2 py-2">
      {items.map(([id, label], index) => {
        const current = active === id;
        return (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={current ? "true" : undefined}
              onClick={(event) => {
                const target = document.getElementById(id);
                if (!target) return;
                event.preventDefault();
                if (target instanceof HTMLDetailsElement) target.open = true;
                const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
                if (target instanceof HTMLElement) target.focus({ preventScroll: true });
                window.history.pushState(null, "", `#${id}`);
              }}
              className={`flex items-center gap-3 min-h-11 px-2 font-body text-[15px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))] ${current ? "text-ink border-l-2 border-[hsl(var(--accent))] bg-paper-warm" : "text-ink-soft border-l-2 border-transparent hover:text-ink"}`}
            >
              <span className="font-mono text-warm-gray" style={{ fontSize: 11 }}>{String(index + 1).padStart(2, "0")}</span>
              {label}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

function ImageCredit({ image }: { image: ProfileImage }) {
  return (
    <p className="mt-3 font-body text-ink-soft text-[13px] leading-relaxed">
      {image.author}. <a href={image.licenseUrl} className="underline underline-offset-4" target="_blank" rel="noopener noreferrer">{image.license}, external</a>.{" "}
      <a href={image.sourceUrl} className="underline underline-offset-4" target="_blank" rel="noopener noreferrer">File page, external</a>.
    </p>
  );
}

function ProjectLink({ project }: { project: SelectedProject }) {
  if (project.projectPath) {
    return (
      <span className="block">
        <Link to={project.projectPath} className="text-ink hover:underline" style={{ fontSize: "1.05rem" }}>{project.name}</Link>
        <a href={project.sourceUrl} className="mt-1 block font-body text-ink-soft text-[13px] underline underline-offset-4" target="_blank" rel="noopener noreferrer">Official project page, external</a>
      </span>
    );
  }
  return (
    <a href={project.sourceUrl} className="text-ink hover:underline" style={{ fontSize: "1.05rem" }} target="_blank" rel="noopener noreferrer">
      {project.name}
      <span className="ml-2 font-mono uppercase text-warm-gray" style={{ fontSize: 11, letterSpacing: "0.12em" }}>External</span>
    </a>
  );
}

function ProjectPhoto({ project }: { project: SelectedProject }) {
  const image = project.image as ProfileImage;
  const frame = (
    <>
      <img src={image.src} alt={image.alt} className="w-full h-auto bg-paper-mid" />
      <span className="sr-only">{project.projectPath ? "Siana building page." : "Official project page, external."}</span>
    </>
  );
  const focus = "block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]";
  return (
    <figure className="border border-ink/10">
      {project.projectPath
        ? <Link to={project.projectPath} className={focus}>{frame}</Link>
        : <a href={project.sourceUrl} className={focus} target="_blank" rel="noopener noreferrer">{frame}</a>}
      <figcaption className="px-3 py-3 font-body text-ink-soft text-[13px] leading-relaxed">
        <span className="block text-ink text-[15px]">{project.name}</span>
        <span className="mt-1 block">{project.city}, {project.country}</span>
        <span className="mt-1 block">
          {image.author}. <a href={image.licenseUrl} className="underline underline-offset-4" target="_blank" rel="noopener noreferrer">{image.license}, external</a>.{" "}
          <a href={image.sourceUrl} className="underline underline-offset-4" target="_blank" rel="noopener noreferrer">File page, external</a>.
        </span>
      </figcaption>
    </figure>
  );
}
