import { useParams } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import { FirmGuideTable, GuideCards, GuideShell, GuideSources, InteriorGuideTable, ResidentialGuideTable } from "@/components/site/SpringfieldGuide";
import {
  COMMERCIAL_SLUGS,
  INTERIOR_STUDIOS,
  RESIDENTIAL_SLUGS,
  RESIDENTIAL_STUDIOS,
  SPRINGFIELD_FIRMS,
  SPRINGFIELD_PLACE,
  TOPIC_GUIDES,
  commercialSourceLinks,
  firmsBySlugs,
  interiorSourceLinks,
  residentialSourceLinks,
  type TopicId,
} from "@/data/architectPlaces";

const SITE = "https://sianaarchitecture.com";

const TOPIC_FIRMS = {
  commercial: () => firmsBySlugs(COMMERCIAL_SLUGS),
  residential: () => firmsBySlugs(RESIDENTIAL_SLUGS),
};

export default function SpringfieldTopic({ id }: { id?: TopicId }) {
  const params = useParams();
  const topic = id || ((params.topic || "") as TopicId);
  const guide = TOPIC_GUIDES[topic];
  if (!guide) return <NotFound />;

  const firms = topic === "interior" ? [] : TOPIC_FIRMS[topic]();
  const links = topic === "commercial"
    ? commercialSourceLinks()
    : topic === "residential"
      ? residentialSourceLinks()
      : interiorSourceLinks();
  const items = topic === "interior"
    ? [
        { name: SPRINGFIELD_FIRMS[0].name, url: `${SITE}/d/architects/${SPRINGFIELD_FIRMS[0].slug}` },
        ...INTERIOR_STUDIOS.map((studio) => ({ name: studio.name, url: studio.website })),
      ]
    : [
        ...firms.map((firm) => ({ name: firm.name, url: `${SITE}/d/architects/${firm.slug}` })),
        ...(topic === "residential" ? RESIDENTIAL_STUDIOS.map((studio) => ({ name: studio.name, url: studio.website })) : []),
      ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Directory", item: `${SITE}/d/` },
          { "@type": "ListItem", position: 2, name: "Architects", item: `${SITE}/d/architects` },
          { "@type": "ListItem", position: 3, name: "Springfield, Missouri", item: `${SITE}${SPRINGFIELD_PLACE.path}` },
          { "@type": "ListItem", position: 4, name: guide.crumb, item: `${SITE}${guide.path}` },
        ],
      },
      {
        "@type": "ItemList",
        name: guide.title,
        itemListOrder: "https://schema.org/ItemListUnordered",
        numberOfItems: items.length,
        itemListElement: items.map((item) => ({ "@type": "Organization", name: item.name, url: item.url })),
      },
    ],
  };

  return (
    <GuideShell
      title={guide.title}
      summary={guide.summary}
      path={guide.path}
      crumbs={[
        { label: "Directory", to: "/d/" },
        { label: "Architects", to: "/d/architects" },
        { label: "Springfield, Missouri", to: SPRINGFIELD_PLACE.path },
        { label: guide.crumb },
      ]}
      jsonLd={jsonLd}
    >
      {topic === "interior" ? <InteriorGuideTable /> : topic === "residential" ? <ResidentialGuideTable firms={firms} /> : <FirmGuideTable firms={firms} label={guide.title} />}
      <GuideCards currentPath={guide.path} />
      <GuideSources note={guide.sourcesNote} links={links} />
    </GuideShell>
  );
}
