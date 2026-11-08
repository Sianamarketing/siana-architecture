import { Link, useParams } from "react-router-dom";
import SiteLayout from "@/components/site/SiteLayout";
import SEO from "@/components/site/SEO";
import NotFound from "@/pages/NotFound";
import { profileBySlug, type ProfileImage, type SelectedProject } from "@/data/architectProfiles";

const NAV = [
  ["overview", "Overview"],
  ["portfolio", "Portfolio"],
  ["approach", "Approach"],
  ["projects", "Selected projects"],
  ["practice", "Practice"],
  ["places", "Places"],
  ["recognition", "Recognition"],
  ["sources", "Sources"],
];

export default function ArchitectProfile() {
  const { profileSlug } = useParams();
  const profile = profileBySlug(profileSlug);
  if (!profile) return <NotFound />;

  const photos = profile.projects.filter((project) => project.image);

  return (
    <SiteLayout>
      <SEO
        title={`${profile.name} - Directory - Siana Architecture`}
        description={profile.summary}
        canonical={`https://sianaarchitecture.com/d/architects/${profile.slug}`}
      />
      <div className="vogue-titles home-paper pb-16" style={{ paddingTop: 76 }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-10 py-8">
          <nav aria-label="Breadcrumb" className="font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.14em" }}>
            <Link to="/d/" className="hover:text-ink">Directory</Link>
            <span aria-hidden="true"> / </span>
            <Link to="/d/architects" className="hover:text-ink">Architects</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page" className="text-ink">{profile.name}</span>
          </nav>

          <header id="overview" className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-end">
            <div>
              <h1 className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(2.4rem, 5vw, 4rem)", lineHeight: 1.02 }}>
                {profile.name}
              </h1>
              <p className="mt-4 max-w-2xl font-body text-ink-soft text-[17px] leading-relaxed">{profile.summary}</p>
              <p className="mt-4 font-body text-[15px]">
                <a href={profile.website} className="text-ink underline underline-offset-4" rel="noopener noreferrer">Practice website</a>
                <span className="text-warm-gray"> · Checked {profile.checked}</span>
              </p>
            </div>
            <p className="font-mono uppercase text-warm-gray border border-ink/15 px-4 py-3" style={{ fontSize: 12, letterSpacing: "0.12em" }}>
              {profile.legalName}<br />Founded {profile.founded}<br />{profile.based}
            </p>
          </header>

          <nav aria-label="On this page" className="sticky top-[76px] z-20 mt-8 -mx-6 px-6 py-3 overflow-x-auto bg-white/95 border-y border-ink/10">
            <ul className="flex gap-4 min-w-max">
              {NAV.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="inline-flex h-11 items-center font-mono uppercase text-ink-soft hover:text-ink" style={{ fontSize: 12, letterSpacing: "0.12em" }}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <section className="mt-10 max-w-3xl space-y-4">
            {profile.overview.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="font-body text-ink text-[16px] leading-relaxed">{paragraph}</p>
            ))}
          </section>

          <section id="portfolio" className="mt-14" aria-labelledby="portfolio-heading">
            <h2 id="portfolio-heading" className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.05 }}>Portfolio</h2>
            <p className="mt-3 max-w-2xl font-body text-ink-soft text-[15px]">Exteriors with a Wikimedia Commons licence. A photograph links to the Siana building page when one exists, and otherwise to the source named on the project.</p>
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {photos.map((project, index) => (
                <li key={project.name} className={index === 0 ? "sm:col-span-2" : ""}>
                  <ProjectPhoto project={project} tall={index === 0} />
                </li>
              ))}
            </ul>
          </section>

          <section id="approach" className="mt-14 max-w-3xl" aria-labelledby="approach-heading">
            <h2 id="approach-heading" className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.05 }}>Design approach</h2>
            <div className="mt-4 space-y-4">
              {profile.approach.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="font-body text-ink text-[16px] leading-relaxed">{paragraph}</p>
              ))}
            </div>
          </section>

          <section id="projects" className="mt-14" aria-labelledby="projects-heading">
            <h2 id="projects-heading" className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.05 }}>Selected projects</h2>
            <p className="mt-3 max-w-2xl font-body text-ink-soft text-[15px]">Up to ten projects named by the practice, the Pritzker Prize, or a Siana building entry. This is not a ranking. A client is shown only when a source names one.</p>
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
          </section>

          <section id="practice" className="mt-14" aria-labelledby="practice-heading">
            <h2 id="practice-heading" className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.05 }}>Practice</h2>
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
            <h3 className="mt-8 text-ink" style={{ fontWeight: 400, fontSize: "1.5rem" }}>Principals</h3>
            <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.principals.map((person) => (
                <li key={person.name} className="border border-ink/15 p-5">
                  <p className="text-ink" style={{ fontSize: "1.4rem" }}>{person.name}</p>
                  <p className="mt-1 font-mono uppercase text-accent-terra" style={{ fontSize: 12, letterSpacing: "0.12em" }}>{person.role}</p>
                  <p className="mt-3 font-body text-ink-soft text-[15px] leading-relaxed">{person.note}</p>
                </li>
              ))}
            </ul>
          </section>

          <section id="places" className="mt-14" aria-labelledby="places-heading">
            <h2 id="places-heading" className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.05 }}>Offices and registration</h2>
            <p className="mt-3 max-w-2xl font-body text-ink-soft text-[15px]">Offices are where the practice says it works. They are not the same as the cities of the buildings above, and they are not a licence to practise.</p>
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.offices.map((office) => (
                <li key={office.city} className="border border-ink/15 px-4 py-3">
                  <span className="block text-ink" style={{ fontSize: "1.2rem" }}>{office.city}</span>
                  <span className="mt-1 block font-body text-ink-soft text-[14px]">{office.country}. {office.role}</span>
                </li>
              ))}
            </ul>
            <h3 className="mt-8 text-ink" style={{ fontWeight: 400, fontSize: "1.5rem" }}>Registration</h3>
            <ul className="mt-4 space-y-3">
              {profile.registration.map((item) => (
                <li key={item.place} className="border border-ink/15 px-4 py-3">
                  <span className="font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.12em" }}>{item.place}</span>
                  <span className="mt-1 block text-ink">{item.status}</span>
                  <span className="mt-1 block font-body text-ink-soft text-[15px]">{item.note}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="recognition" className="mt-14" aria-labelledby="recognition-heading">
            <h2 id="recognition-heading" className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.05 }}>Awards</h2>
            <p className="mt-3 max-w-2xl font-body text-ink-soft text-[15px]">Person awards and project awards are marked separately. None of these lines is a professional licence.</p>
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

          <section id="sources" className="mt-14" aria-labelledby="sources-heading">
            <h2 id="sources-heading" className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.05 }}>Sources</h2>
            <p className="mt-3 font-body text-ink-soft text-[15px]">Checked {profile.checked}. Pages were read for facts. Photographs are used only when the file carries a Commons licence.</p>
            <ul className="mt-4 space-y-2">
              {profile.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} className="font-body text-ink text-[15px] underline underline-offset-4" rel="noopener noreferrer">{source.label}</a>
                </li>
              ))}
            </ul>
            <p className="mt-8">
              <Link to="/d/architects" className="font-mono uppercase text-ink border-b border-ink pb-0.5" style={{ fontSize: 12, letterSpacing: "0.14em" }}>Back to Architects</Link>
            </p>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}

function ProjectLink({ project }: { project: SelectedProject }) {
  const label = project.name;
  if (project.projectPath) {
    return <Link to={project.projectPath} className="text-ink hover:underline" style={{ fontSize: "1.05rem" }}>{label}</Link>;
  }
  return <a href={project.sourceUrl} className="text-ink hover:underline" style={{ fontSize: "1.05rem" }} rel="noopener noreferrer">{label}</a>;
}

function ProjectPhoto({ project, tall }: { project: SelectedProject; tall?: boolean }) {
  const image = project.image as ProfileImage;
  const frame = (
    <img src={image.src} alt={image.alt} className={`w-full object-cover bg-paper-mid ${tall ? "h-72 sm:h-96" : "h-52"}`} />
  );
  return (
    <figure className="border border-ink/10">
      {project.projectPath
        ? <Link to={project.projectPath} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]">{frame}</Link>
        : <a href={project.sourceUrl} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]" rel="noopener noreferrer">{frame}</a>}
      <figcaption className="px-3 py-2 font-mono uppercase text-warm-gray" style={{ fontSize: 11, letterSpacing: "0.08em" }}>
        <span className="text-ink">{project.name}</span>
        <span className="mt-1 block">{image.attribution}</span>
      </figcaption>
    </figure>
  );
}
