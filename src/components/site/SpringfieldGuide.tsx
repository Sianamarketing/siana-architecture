import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SiteLayout from "@/components/site/SiteLayout";
import SEO from "@/components/site/SEO";
import FirmMark from "@/components/site/FirmMark";
import {
  BARON_INTERIOR_WORK,
  INTERIOR_STUDIOS,
  RESIDENTIAL_FACTS,
  RESIDENTIAL_STUDIOS,
  SPRINGFIELD_FIRMS,
  documentTitle,
  officeLine,
  springfieldGuideCards,
  type InteriorStudio,
  type ResidentialFacts,
  type ResidentialStudio,
  type SourceLink,
} from "@/data/architectPlaces";
import type { ArchitectProfile } from "@/data/architectProfiles";

const SITE = "https://sianaarchitecture.com";
const profileUrl = (slug: string) => `/d/architects/${slug}`;

export function GuideShell({
  title,
  summary,
  path,
  crumbs,
  jsonLd,
  children,
}: {
  title: string;
  summary: string;
  path: string;
  crumbs: { label: string; to?: string }[];
  jsonLd: unknown;
  children: ReactNode;
}) {
  return (
    <SiteLayout>
      <SEO title={documentTitle(title)} description={summary} canonical={`${SITE}${path}`} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <div className="vogue-titles home-paper pb-16" style={{ paddingTop: 76 }}>
        <div className="mx-auto max-w-[1040px] px-6 lg:px-10 py-8">
          <nav aria-label="Breadcrumb" className="font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.14em" }}>
            {crumbs.map((crumb, index) => (
              <span key={`${crumb.label}-${index}`}>
                {index > 0 && <span aria-hidden="true"> / </span>}
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-ink">{crumb.label}</Link>
                ) : (
                  <span aria-current="page" className="text-ink">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
          <h1 className="mt-4 text-ink" style={{ fontWeight: 400, fontSize: "clamp(2.1rem, 4vw, 3.3rem)", lineHeight: 1.08 }}>
            {title}
          </h1>
          <p className="mt-4 max-w-2xl font-body text-ink text-[17px] leading-relaxed">{summary}</p>
          {children}
          <p className="mt-10">
            <Link to="/d/architects" className="font-mono uppercase text-ink border-b border-ink pb-0.5" style={{ fontSize: 12, letterSpacing: "0.14em" }}>Back to Architects</Link>
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}

export function FirmGuideTable({ firms, label }: { firms: ArchitectProfile[]; label: string }) {
  return (
    <>
      <ul className="mt-8 md:hidden space-y-3">
        {firms.map((firm) => (
          <li key={firm.slug} className="border border-ink/15 px-4 py-3">
            <div className="flex flex-col items-start gap-1">
              <FirmMark profile={firm} compact />
              <Link to={profileUrl(firm.slug)} className="text-ink" style={{ fontSize: "1.15rem" }}>{firm.name}</Link>
            </div>
            <p className="mt-2 font-body text-ink text-[15px] leading-snug">{firm.experience}</p>
            <div className="mt-2"><RegistrationLines firm={firm} /></div>
            <p className="mt-2 font-body text-ink-soft text-[15px]">{officeLine(firm)}</p>
            <a href={firm.website} className="mt-2 inline-block font-body text-ink text-[15px] underline underline-offset-4" target="_blank" rel="noopener noreferrer">Practice website, external</a>
          </li>
        ))}
      </ul>
      <div className="mt-8 hidden md:block overflow-x-auto border border-ink/15" tabIndex={0} role="region" aria-label={`${label}. Scroll sideways if a column is out of view.`}>
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
            {firms.map((firm) => (
              <tr key={firm.slug} id={firm.slug} className="border-t border-ink/10 align-top">
                <th scope="row" className="px-4 py-3 font-normal">
                  <div className="flex flex-col items-start gap-1">
                    <FirmMark profile={firm} compact />
                    <Link to={profileUrl(firm.slug)} className="text-ink hover:underline">{firm.name}</Link>
                  </div>
                </th>
                <td className="px-4 py-3 font-body text-[15px] leading-snug">{firm.experience}</td>
                <td className="px-4 py-3"><RegistrationLines firm={firm} /></td>
                <td className="px-4 py-3 font-body text-[15px]">
                  {officeLine(firm)}
                  <a href={firm.website} className="mt-1 block text-ink underline underline-offset-4" target="_blank" rel="noopener noreferrer">Practice website, external</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function ResidentialGuideTable({ firms }: { firms: ArchitectProfile[] }) {
  return (
    <>
      <ul className="mt-8 md:hidden space-y-3">
        {firms.map((firm) => (
          <li key={firm.slug} className="border border-ink/15 px-4 py-3">
            <div className="flex flex-col items-start gap-1">
              <FirmMark profile={firm} compact />
              <Link to={profileUrl(firm.slug)} className="text-ink" style={{ fontSize: "1.15rem" }}>{firm.name}</Link>
            </div>
            <ResidentialFactsBlock facts={RESIDENTIAL_FACTS[firm.slug]} />
            <p className="mt-2 font-body text-ink text-[15px] leading-snug">{firm.experience}</p>
            <div className="mt-2"><RegistrationLines firm={firm} /></div>
            <p className="mt-2 font-body text-ink-soft text-[15px]">{officeLine(firm)}</p>
            <a href={firm.website} className="mt-2 inline-block font-body text-ink text-[15px] underline underline-offset-4" target="_blank" rel="noopener noreferrer">Practice website, external</a>
          </li>
        ))}
        {RESIDENTIAL_STUDIOS.map((studio) => (
          <li key={studio.website} className="border border-ink/15 px-4 py-3">
            <StudioName studio={studio} />
            <ResidentialFactsBlock facts={studio.facts} />
            <p className="mt-2 font-body text-ink text-[15px] leading-snug">{studio.experience}</p>
            <p className="mt-2 font-body text-[15px] leading-snug">{studio.registration}</p>
            <p className="mt-2 font-body text-ink-soft text-[15px]">{studio.office}</p>
            <a href={studio.website} className="mt-2 inline-block font-body text-ink text-[15px] underline underline-offset-4" target="_blank" rel="noopener noreferrer">Practice website, external</a>
          </li>
        ))}
      </ul>
      <div className="mt-8 hidden md:block border border-ink/15" role="region" aria-label="Best residential architects in Springfield">
        <table className="w-full table-fixed text-left">
          <thead className="bg-paper-warm font-mono uppercase text-warm-gray" style={{ fontSize: 10, letterSpacing: "0.08em" }}>
            <tr>
              <th className="w-[18%] px-2 py-2 font-medium">Practice</th>
              <th className="w-[18%] px-2 py-2 font-medium">Signature style</th>
              <th className="w-[14%] px-2 py-2 font-medium">Best for</th>
              <th className="w-[22%] px-2 py-2 font-medium">Project experience</th>
              <th className="w-[14%] px-2 py-2 font-medium">Architect registration</th>
              <th className="w-[14%] px-2 py-2 font-medium">Springfield office</th>
            </tr>
          </thead>
          <tbody>
            {firms.map((firm) => {
              const facts = RESIDENTIAL_FACTS[firm.slug];
              return (
                <tr key={firm.slug} className="border-t border-ink/10 align-top">
                  <th scope="row" className="px-2 py-2 font-normal">
                    <div className="flex flex-col items-start gap-1">
                      <FirmMark profile={firm} compact />
                      <Link to={profileUrl(firm.slug)} className="text-ink hover:underline" style={{ fontSize: 14 }}>{firm.name}</Link>
                    </div>
                  </th>
                  <td className="px-2 py-2 font-body text-[13px] leading-snug">
                    <span className="block">{facts.style}</span>
                    <span className="mt-1 block text-ink-soft">{facts.sizeSetting}</span>
                  </td>
                  <td className="px-2 py-2 font-body text-[13px] leading-snug">{facts.bestFor}</td>
                  <td className="px-2 py-2 font-body text-[13px] leading-snug">
                    <span className="block">{firm.experience}</span>
                    <a href={facts.standoutUrl} className="mt-1 inline-block text-ink underline underline-offset-4" target="_blank" rel="noopener noreferrer">{facts.standout}</a>
                  </td>
                  <td className="px-2 py-2 text-[13px]"><RegistrationLines firm={firm} /></td>
                  <td className="px-2 py-2 font-body text-[13px] leading-snug">{officeLine(firm)}</td>
                </tr>
              );
            })}
            {RESIDENTIAL_STUDIOS.map((studio) => (
              <tr key={studio.website} className="border-t border-ink/10 align-top">
                <th scope="row" className="px-2 py-2 font-normal">
                  <StudioName studio={studio} />
                </th>
                <td className="px-2 py-2 font-body text-[13px] leading-snug">
                  <span className="block">{studio.facts.style}</span>
                  <span className="mt-1 block text-ink-soft">{studio.facts.sizeSetting}</span>
                </td>
                <td className="px-2 py-2 font-body text-[13px] leading-snug">{studio.facts.bestFor}</td>
                <td className="px-2 py-2 font-body text-[13px] leading-snug">
                  <span className="block">{studio.experience}</span>
                  <a href={studio.facts.standoutUrl} className="mt-1 inline-block text-ink underline underline-offset-4" target="_blank" rel="noopener noreferrer">{studio.facts.standout}</a>
                </td>
                <td className="px-2 py-2 font-body text-[13px] leading-snug">{studio.registration}</td>
                <td className="px-2 py-2 font-body text-[13px] leading-snug">
                  {studio.office}
                  <a href={studio.website} className="mt-1 block text-ink underline underline-offset-4" target="_blank" rel="noopener noreferrer">Practice website, external</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function InteriorGuideTable() {
  const baron = SPRINGFIELD_FIRMS[0];
  return (
    <>
      <ul className="mt-8 md:hidden space-y-3">
        <li className="border border-ink/15 px-4 py-3">
          <div className="flex flex-col items-start gap-1">
            <FirmMark profile={baron} compact />
            <Link to={profileUrl(baron.slug)} className="text-ink" style={{ fontSize: "1.15rem" }}>{baron.name}</Link>
          </div>
          <p className="mt-2 font-body text-ink text-[15px] leading-snug">{BARON_INTERIOR_WORK}</p>
          <p className="mt-2 font-body text-ink-soft text-[15px]">{officeLine(baron)}</p>
          <a href={baron.website} className="mt-2 inline-block font-body text-ink text-[15px] underline underline-offset-4" target="_blank" rel="noopener noreferrer">Practice website, external</a>
        </li>
        {INTERIOR_STUDIOS.map((studio) => (
          <li key={studio.website} className="border border-ink/15 px-4 py-3">
            <StudioName studio={studio} />
            <p className="mt-2 font-body text-ink text-[15px] leading-snug">{studio.summary}</p>
            <p className="mt-2 font-body text-ink-soft text-[15px]">{studio.office}</p>
            <a href={studio.website} className="mt-2 inline-block font-body text-ink text-[15px] underline underline-offset-4" target="_blank" rel="noopener noreferrer">Practice website, external</a>
          </li>
        ))}
      </ul>
      <div className="mt-8 hidden md:block overflow-x-auto border border-ink/15" tabIndex={0} role="region" aria-label="Best interior designers in Springfield. Scroll sideways if a column is out of view.">
        <table className="w-full min-w-[720px] text-left">
          <thead className="bg-paper-warm font-mono uppercase text-warm-gray" style={{ fontSize: 11, letterSpacing: "0.12em" }}>
            <tr>
              <th className="px-4 py-3 font-medium">Practice</th>
              <th className="px-4 py-3 font-medium">Work</th>
              <th className="px-4 py-3 font-medium">Springfield office</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-ink/10 align-top">
              <th scope="row" className="px-4 py-3 font-normal">
                <div className="flex flex-col items-start gap-1">
                  <FirmMark profile={baron} compact />
                  <Link to={profileUrl(baron.slug)} className="text-ink hover:underline">{baron.name}</Link>
                </div>
              </th>
              <td className="px-4 py-3 font-body text-[15px] leading-snug">{BARON_INTERIOR_WORK}</td>
              <td className="px-4 py-3 font-body text-[15px]">
                {officeLine(baron)}
                <a href={baron.website} className="mt-1 block text-ink underline underline-offset-4" target="_blank" rel="noopener noreferrer">Practice website, external</a>
              </td>
            </tr>
            {INTERIOR_STUDIOS.map((studio) => (
              <tr key={studio.website} className="border-t border-ink/10 align-top">
                <th scope="row" className="px-4 py-3 font-normal">
                  <StudioName studio={studio} />
                </th>
                <td className="px-4 py-3 font-body text-[15px] leading-snug">{studio.summary}</td>
                <td className="px-4 py-3 font-body text-[15px]">
                  {studio.office}
                  <a href={studio.website} className="mt-1 block text-ink underline underline-offset-4" target="_blank" rel="noopener noreferrer">Practice website, external</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function GuideSources({ note, links }: { note: string; links: SourceLink[] }) {
  return (
    <details className="mt-14 border border-ink/15 px-4 py-3">
      <summary className="cursor-pointer font-body text-ink text-[16px] min-h-11">Sources</summary>
      <p className="mt-3 font-body text-ink-soft text-[15px] leading-relaxed">
        {note.split("Missouri licensee search").map((part, index) => (
          index === 0 ? part : (
            <span key={index}>
              <a href="https://mopro.mo.gov/license/s/license-search" className="underline underline-offset-4" target="_blank" rel="noopener noreferrer">Missouri licensee search</a>
              {part}
            </span>
          )
        ))}
      </p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href + link.label}>
            {link.href.startsWith("/") ? (
              <Link to={link.href} className="font-body text-ink text-[15px] underline underline-offset-4">{link.label}</Link>
            ) : (
              <a href={link.href} className="font-body text-ink text-[15px] underline underline-offset-4" target="_blank" rel="noopener noreferrer">{link.label}</a>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}

export function GuideCards({ currentPath, className = "mt-14" }: { currentPath: string; className?: string }) {
  const cards = springfieldGuideCards(currentPath);
  return (
    <nav aria-label="Other Springfield guides" className={className}>
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map((card) => (
          <li key={card.path}>
            <Link to={card.path} className="block h-full border border-ink/15 px-4 py-4 hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]">
              <span className="block text-ink" style={{ fontSize: "1.2rem", lineHeight: 1.2 }}>{card.title}</span>
              <span className="mt-2 block font-body text-ink-soft text-[15px] leading-snug">{card.card}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ResidentialFactsBlock({ facts }: { facts: ResidentialFacts }) {
  const rows = [
    ["Signature style", facts.style],
    ["Size and setting", facts.sizeSetting],
    ["Best for", facts.bestFor],
  ];
  return (
    <div className="mt-3 space-y-2">
      {rows.map(([label, value]) => (
        <p key={label} className="font-body text-[15px] leading-snug">
          <span className="font-mono uppercase text-warm-gray" style={{ fontSize: 11, letterSpacing: "0.12em" }}>{label}</span>
          <span className="mt-0.5 block text-ink">{value}</span>
        </p>
      ))}
      <p className="font-body text-[15px] leading-snug">
        <span className="font-mono uppercase text-warm-gray" style={{ fontSize: 11, letterSpacing: "0.12em" }}>Standout home</span>
        <a href={facts.standoutUrl} className="mt-0.5 block text-ink underline underline-offset-4" target="_blank" rel="noopener noreferrer">{facts.standout}</a>
      </p>
    </div>
  );
}

function RegistrationLines({ firm }: { firm: ArchitectProfile }) {
  const architect = firm.registration.find((item) => item.status.startsWith("Missouri registered architect: "));
  if (!architect) return null;
  return <p className="font-body text-[13px] leading-snug">{architect.status.replace("Missouri registered architect: ", "")}</p>;
}

function StudioName({ studio }: { studio: InteriorStudio | ResidentialStudio }) {
  return (
    <div className="flex flex-col items-start gap-1">
      {studio.markSrc && (
        <img src={studio.markSrc} alt="" className={`${studio.markOnInk ? "bg-ink px-1" : ""} h-6 max-h-[26px] max-w-[4.5rem] w-auto shrink-0 object-contain`} />
      )}
      <a href={studio.website} className="text-ink hover:underline" style={{ fontSize: 14 }} target="_blank" rel="noopener noreferrer">{studio.name}</a>
    </div>
  );
}
