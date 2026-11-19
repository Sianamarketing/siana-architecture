import { FirmGuideTable, GuideCards, GuideShell, GuideSources } from "@/components/site/SpringfieldGuide";
import {
  HUB_SOURCES_NOTE,
  SPRINGFIELD_FIRMS,
  SPRINGFIELD_PLACE,
  hubSourceLinks,
} from "@/data/architectPlaces";

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
        url: `https://sianaarchitecture.com/d/architects/${firm.slug}`,
        sameAs: firm.website,
      })),
    },
  ],
};

export default function ArchitectPlace() {
  return (
    <GuideShell
      title={SPRINGFIELD_PLACE.title}
      summary={SPRINGFIELD_PLACE.summary}
      path={SPRINGFIELD_PLACE.path}
      crumbs={[
        { label: "Directory", to: "/d/" },
        { label: "Architects", to: "/d/architects" },
        { label: "Springfield, Missouri" },
      ]}
      jsonLd={jsonLd}
    >
      <GuideCards currentPath={SPRINGFIELD_PLACE.path} className="mt-8" />
      <section className="mt-10" aria-labelledby="offices-heading">
        <h2 id="offices-heading" className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.7rem, 3vw, 2.4rem)" }}>Best architecture firms in Springfield</h2>
        <FirmGuideTable firms={SPRINGFIELD_FIRMS} label="Springfield offices" />
      </section>
      <GuideSources note={HUB_SOURCES_NOTE} links={hubSourceLinks()} />
    </GuideShell>
  );
}
