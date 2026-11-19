/**
 * Springfield place guide. Firm records live on the practice profiles.
 * The sequence is an editorial selection.
 */
import { SPRINGFIELD_PROFILES, springfieldBySlug } from "@/data/springfieldProfiles";
import type { ArchitectProfile, SelectedProject } from "@/data/architectProfiles";

export const SPRINGFIELD_PLACE = {
  slug: "springfield-missouri",
  path: "/d/architects/springfield-missouri",
  city: "Springfield",
  region: "Missouri",
  title: "Best architecture firms in Springfield, Missouri",
  /** Fixed document-title edition. Not the calendar year, so it does not roll forward on its own. */
  edition: "2026",
  summary:
    "Springfield offices have completed senior housing, hotels, a cardiology clinic, and a brewery restaurant in the city. Baron Design & Associates finished The Preston, a senior residence, along with the Hilton Garden Inn and Towneplace Suites. Arkifex Studios turned a former radio station into Lost Signal Brewing.",
  checked: "8 November 2026",
};

export interface GuideRow {
  firmSlug: string;
  projectName: string;
  anchor?: string;
}

export interface GuideSection {
  id: string;
  title: string;
  intro: string;
  rows: GuideRow[];
}

export const SPRINGFIELD_FIRMS: ArchitectProfile[] = SPRINGFIELD_PROFILES;

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "residential",
    title: "Homes and residential buildings",
    intro: "The Preston is senior independent living in Springfield. Township 28 is an apartment community in Galloway Village. Finley River House is a completed house in Nixa, and Sac River Residence sits between a former quarry lake and the river valley.",
    rows: [
      { firmSlug: "baron-design-associates", projectName: "The Preston" },
      { firmSlug: "hdesigngroup", projectName: "Township 28" },
      { firmSlug: "arkifex-studios", projectName: "Finley River House", anchor: "houses" },
      { firmSlug: "nform-architecture", projectName: "Sac River Residence" },
    ],
  },
  {
    id: "commercial",
    title: "Commercial and public-facing projects",
    intro: "Baron Cardiology is a clinic in Springfield. Lost Signal Brewing occupies a former radio station. Care to Learn turned retail space on South Glenstone into offices.",
    rows: [
      { firmSlug: "baron-design-associates", projectName: "Baron Cardiology", anchor: "healthcare" },
      { firmSlug: "baron-design-associates", projectName: "Hilton Garden Inn", anchor: "hotels" },
      { firmSlug: "arkifex-studios", projectName: "Lost Signal Brewing", anchor: "restaurants" },
      { firmSlug: "hood-rich", projectName: "Centerstone Building A Renovation + Addition" },
      { firmSlug: "paragon-architecture", projectName: "Care to Learn | Infill & Remodel", anchor: "renovations" },
      { firmSlug: "brp-architects", projectName: "Caesars Republic Scottsdale" },
    ],
  },
];

export interface MatrixRow {
  slug: string;
  homes: string;
  commercial: string;
  note: string;
}

export const EXPERIENCE_MATRIX: MatrixRow[] = [
  { slug: "baron-design-associates", homes: "The Preston, senior housing", commercial: "Hilton Garden Inn, Towneplace Suites, Baron Cardiology, 3810 East Sunshine", note: "Architecture and interior design." },
  { slug: "arkifex-studios", homes: "Finley River House, Nixa. Casey House is designed.", commercial: "Lost Signal Brewing, Springfield", note: "Boutique studio." },
  { slug: "bkd-design-collective", homes: "", commercial: "St. Jude Mercy Clinic. Interior design at Moxy. Chateau on the Lake, Branson.", note: "Architecture, engineering, and interior design." },
  { slug: "hood-rich", homes: "", commercial: "Centerstone Building A. Burrell administrative campus. Embassy Suites public spaces.", note: "Healthcare and hospitality." },
  { slug: "hdesigngroup", homes: "Township 28 apartments", commercial: "Tru by Hilton", note: "Design consultant and owner representative for The 505." },
  { slug: "esterly-schneider", homes: "", commercial: "O'Reilly, nationwide. Fire Station #13.", note: "Wire Road Brewery, Battlefield." },
  { slug: "nform-architecture", homes: "Sac River Residence", commercial: "", note: "Sac River valley." },
  { slug: "paragon-architecture", homes: "", commercial: "Care to Learn remodel", note: "Springfield, St. Louis, Kansas City, Joplin, and Northwest Arkansas." },
  { slug: "brp-architects", homes: "", commercial: "Caesars Republic, Scottsdale", note: "11-story hotel." },
];

export function guideProject(row: GuideRow): { firm: ArchitectProfile; project: SelectedProject } | null {
  const firm = springfieldBySlug(row.firmSlug);
  const project = firm?.projects.find((item) => item.name === row.projectName);
  if (!firm || !project) return null;
  return { firm, project };
}

export function officeLine(firm: ArchitectProfile): string {
  return firm.offices[0]?.role ?? firm.based;
}

/** Existing editorial order, limited to practices with a verified commercial project. */
export const COMMERCIAL_SLUGS = [
  "baron-design-associates",
  "arkifex-studios",
  "bkd-design-collective",
  "hood-rich",
  "hdesigngroup",
  "esterly-schneider",
  "paragon-architecture",
  "brp-architects",
];

/** Existing editorial order, without Baron Design. */
export const RESIDENTIAL_SLUGS = [
  "arkifex-studios",
  "hdesigngroup",
  "nform-architecture",
];

export function firmsBySlugs(slugs: string[]): ArchitectProfile[] {
  return slugs.map((slug) => springfieldBySlug(slug)).filter((firm): firm is ArchitectProfile => Boolean(firm));
}

export interface InteriorStudio {
  name: string;
  office: string;
  website: string;
  summary: string;
  markSrc: string | null;
  markOnInk: boolean;
}

/** Checked 18 November 2026 from each practice website. No credential column: an NCIDQ or Missouri interior record was not part of the confirmed sources. */
export const INTERIOR_STUDIOS: InteriorStudio[] = [
  {
    name: "Andrea Nesbitt Designs",
    office: "1727 South Chapel Drive, Springfield, MO 65809",
    website: "https://anesbittdesigns.com/",
    summary: "Commercial interiors for businesses, hotels, restaurants, and retailers.",
    markSrc: "/directory-marks/andrea-nesbitt-designs.png",
    markOnInk: false,
  },
  {
    name: "Ella Belle Designs",
    office: "Springfield, Missouri",
    website: "https://www.ellabelledesigns.us/",
    summary: "Full-service interior design studio, established in 2019, for Springfield and nearby.",
    markSrc: "/directory-marks/ella-belle-designs.png",
    markOnInk: true,
  },
  {
    name: "Ellecor Design",
    office: "1951 E McDaniel St, Springfield, MO 65802",
    website: "https://ellecordesign.com/",
    summary: "Interior design for remodels, new houses, and home decor. Haden Long, the lead designer, holds an interior design degree from Missouri State University and is a member of ASID.",
    markSrc: "/directory-marks/ellecor-design.png",
    markOnInk: true,
  },
  {
    name: "Lindsay Lattner Interiors",
    office: "1860 W Arbor St, Suite 104, Springfield, MO 65807",
    website: "https://www.lindsaylattnerinteriors.com/",
    summary: "Full-service residential design for new construction and large renovations since 2016.",
    markSrc: "/directory-marks/lindsay-lattner-interiors.png",
    markOnInk: false,
  },
];

export interface GuideCard {
  path: string;
  title: string;
  card: string;
}

export interface SourceLink {
  label: string;
  href: string;
}

export const BARON_INTERIOR_WORK =
  "Architecture and interior design for The Preston, Towneplace Suites, Hilton Garden Inn, Baron Cardiology, and 3810 East Sunshine.";

const MISSOURI_SEARCH = "https://mopro.mo.gov/license/s/license-search";

export const COMMERCIAL_GUIDE = {
  id: "commercial",
  path: "/d/architects/springfield-missouri/commercial",
  title: "Best commercial architects in Springfield, Missouri",
  crumb: "Commercial",
  summary: "Hotels, clinics, offices, restaurants, and civic buildings from Springfield practices.",
  card: "Hotels, clinics, offices, and restaurants.",
  sourcesNote:
    "Checked 8 November 2026 in the Active Licensee Only search at the Missouri licensee search. Detail pages do not label a record Active. Baron Design & Associates, LLC is Architectural Corporation no. 2003003845. The firm site gives 2003003845-D. Janet Rothberg White, no. 003658, is the architect in charge. Rita Baron: not verified. Firm certificates for the other practices on this page: not verified. Logos are each practice's own mark, shown small to identify the firm. Project photographs are not shown.",
};

export const RESIDENTIAL_GUIDE = {
  id: "residential",
  path: "/d/architects/springfield-missouri/residential",
  title: "Best residential architects in Springfield, Missouri",
  crumb: "Residential",
  summary: "A completed house in Nixa, apartments in Galloway Village, a house in the Sac River valley, and custom houses in Republic, Springfield, and Ozark.",
  card: "Houses in Nixa, Republic, Springfield, and the Sac River valley, and apartments in Galloway Village.",
  sourcesNote:
    "Checked 8 November 2026 in the Active Licensee Only search at the Missouri licensee search. Detail pages do not label a record Active. Tyler D. Hellweg, no. 2015000181, Robert Christopher Haik, no. 007461, and Jennifer Lynn Wilson, no. 2001029971. Firm certificates of authority for those three practices: not verified. Checked 19 November 2026 in the Active Licensee Search at the same portal: Nathan Scott Burkholder, Architect, no. 2018041156, Springfield, expires 12/31/2026. Burkholder Architecture, LLC is an Architectural Corporation in Springfield. Rufus Leon Louderback, Architect, no. 2003010225, Nixa, expires 12/31/2027. The search for Jeremy Cook did not return an architect record. Logos are each practice's own mark, shown small to identify the firm. N·FORM Architecture is named in type. Project photographs are not shown. The project pages do not grant reuse of the photographs.",
};

export interface ResidentialFacts {
  style: string;
  standout: string;
  standoutUrl: string;
  sizeSetting: string;
  bestFor: string;
}

export interface ResidentialStudio {
  name: string;
  office: string;
  website: string;
  experience: string;
  registration: string;
  markSrc: string | null;
  markOnInk: boolean;
  facts: ResidentialFacts;
}

/** Phrases and figures are taken from each practice's own project pages. */
export const RESIDENTIAL_FACTS: Record<string, ResidentialFacts> = {
  "arkifex-studios": {
    style: "Modern farmhouse vernacular",
    standout: "Finley River House",
    standoutUrl: "https://www.arkifexstudios.com/work/finleyriverhouse",
    sizeSetting: "5,500 sq ft in Nixa, and a Springfield remodel",
    bestFor: "New houses and remodels",
  },
  hdesigngroup: {
    style: "Modern eclectic apartments",
    standout: "Township 28",
    standoutUrl: "https://hdesigngroup.com/project/township-28",
    sizeSetting: "133,100 sq ft, 138 apartments in Galloway Village",
    bestFor: "Luxury apartments for families",
  },
  "nform-architecture": {
    style: "Stone and cedar rainscreen",
    standout: "Sac River Residence",
    standoutUrl: "https://nformarc.com/project/sac-river-residence/",
    sizeSetting: "8,000 sq ft, Sac River valley",
    bestFor: "A large custom house",
  },
};

/** Added 19 November 2026. Baron Design stays off this list. These rows link out. They do not have profile pages. */
export const RESIDENTIAL_STUDIOS: ResidentialStudio[] = [
  {
    name: "Burkholder Architecture",
    office: "Springfield, MO 65802",
    website: "https://www.burkholderarchitecture.com/",
    experience: "Lineage, a 4,060 square foot custom residence in Republic.",
    registration: "Nathan Scott Burkholder, no. 2018041156",
    markSrc: "/directory-marks/burkholder-architecture.png",
    markOnInk: true,
    facts: {
      style: "High-performance custom homes",
      standout: "Lineage",
      standoutUrl: "https://www.burkholderarchitecture.com/residential-portfolio/lineage",
      sizeSetting: "4,060 to 6,144 sq ft, Republic and Kimberling City",
      bestFor: "New houses and additions",
    },
  },
  {
    name: "OZMO",
    office: "1801 West Riverdale Drive, Nixa, MO 65714",
    website: "https://ozmo.llc/",
    experience: "Louderback Residence 3, a four-bedroom house, and Linear Residence, a house in progress in Springfield.",
    registration: "Rufus Leon Louderback, no. 2003010225",
    markSrc: "/directory-marks/ozmo.png",
    markOnInk: false,
    facts: {
      style: "Lakeside and container houses",
      standout: "Louderback Residence 3",
      standoutUrl: "https://ozmo.llc/louderback-residence",
      sizeSetting: "2,820 sq ft, plus houses in Springfield and on Table Rock",
      bestFor: "Custom houses, large and small",
    },
  },
  {
    name: "Cook Haus Design",
    office: "Springfield, MO 65809",
    website: "https://www.cookhausdesign.com/",
    experience: "Natural Bridge II, a new 6,000 square foot house in Springfield, and Crashing Creeks, a new house in Ozark.",
    registration: "Residential designer. Missouri architect registration: not verified.",
    markSrc: "/directory-marks/cook-haus-design.png",
    markOnInk: false,
    facts: {
      style: "Ozark mountain and modern",
      standout: "Natural Bridge II",
      standoutUrl: "https://www.cookhausdesign.com/copy-of-buddy-trl",
      sizeSetting: "3,000 to 10,000 sq ft, Springfield, Ozark, and Table Rock",
      bestFor: "New houses and renovations",
    },
  },
];

export const INTERIOR_GUIDE = {
  id: "interior",
  path: "/d/interior-designers/springfield-missouri",
  title: "Best interior designers in Springfield, Missouri",
  crumb: "Interior design",
  summary: "Baron Design includes interiors with its architecture. Four other studios keep a Springfield practice.",
  card: "Baron Design, and four Springfield studios.",
  sourcesNote:
    "Baron Design names architecture and interior design for The Preston, Towneplace Suites, Baron Cardiology, 3810 East Sunshine, and Hilton Garden Inn. Andrea Nesbitt Designs, Ella Belle Designs, Ellecor Design, and Lindsay Lattner Interiors were checked 18 November 2026. Logos are each practice's own mark, shown small to identify the firm. Project photographs are not shown.",
};

export const TOPIC_GUIDES = {
  commercial: COMMERCIAL_GUIDE,
  residential: RESIDENTIAL_GUIDE,
  interior: INTERIOR_GUIDE,
} as const;

export type TopicId = keyof typeof TOPIC_GUIDES;

export function documentTitle(title: string): string {
  return `${title} in ${SPRINGFIELD_PLACE.edition} - Siana Architecture`;
}

export function springfieldGuideCards(currentPath: string): GuideCard[] {
  const cards: GuideCard[] = [
    {
      path: SPRINGFIELD_PLACE.path,
      title: "Best architecture firms in Springfield",
      card: "Nine Springfield offices, with hotels, clinics, houses, and a brewery restaurant.",
    },
    { path: COMMERCIAL_GUIDE.path, title: "Best commercial architects in Springfield", card: COMMERCIAL_GUIDE.card },
    { path: RESIDENTIAL_GUIDE.path, title: "Best residential architects in Springfield", card: RESIDENTIAL_GUIDE.card },
    { path: INTERIOR_GUIDE.path, title: "Best interior designers in Springfield", card: INTERIOR_GUIDE.card },
  ];
  return cards.filter((card) => card.path !== currentPath);
}

function profileLinks(slugs: string[]): SourceLink[] {
  return firmsBySlugs(slugs).map((firm) => ({ label: firm.name, href: `/d/architects/${firm.slug}` }));
}

function projectLinks(pairs: [string, string][]): SourceLink[] {
  const seen = new Set<string>();
  return pairs.flatMap(([slug, name]) => {
    const project = springfieldBySlug(slug)?.projects.find((item) => item.name === name);
    if (!project || seen.has(project.sourceUrl)) return [];
    seen.add(project.sourceUrl);
    return [{ label: `${project.sourceLabel}, external`, href: project.sourceUrl }];
  });
}

export const HUB_SOURCES_NOTE =
  "Checked 8 November 2026 in the Active Licensee Only search at the Missouri licensee search. Detail pages do not label a record Active. Baron Design & Associates, LLC is Architectural Corporation no. 2003003845. The firm site gives 2003003845-D. Janet Rothberg White, no. 003658, is the architect in charge. Rita Baron: not verified. Firm certificates for the other architecture practices: not verified. Logos are each practice's own mark, shown small to identify the firm. N·FORM Architecture is named in type. Project photographs are not shown.";

export function hubSourceLinks(): SourceLink[] {
  return [
    { label: "Missouri licensee search, external", href: MISSOURI_SEARCH },
    ...profileLinks(SPRINGFIELD_FIRMS.map((firm) => firm.slug)),
  ];
}

export function commercialSourceLinks(): SourceLink[] {
  return [
    { label: "Missouri licensee search, external", href: MISSOURI_SEARCH },
    ...profileLinks(COMMERCIAL_SLUGS),
    ...projectLinks([
      ["baron-design-associates", "The Preston"],
      ["baron-design-associates", "Towneplace Suites"],
      ["baron-design-associates", "Baron Cardiology"],
      ["baron-design-associates", "3810 East Sunshine"],
      ["baron-design-associates", "Hilton Garden Inn"],
      ["arkifex-studios", "Lost Signal Brewing"],
      ["bkd-design-collective", "St. Jude Mercy Clinic"],
      ["bkd-design-collective", "Moxy Springfield Downtown"],
      ["bkd-design-collective", "Chateau on the Lake Resort, Spa and Convention Center"],
      ["hood-rich", "Centerstone Building A Renovation + Addition"],
      ["hood-rich", "Burrell Behavioral Health administrative campus"],
      ["hood-rich", "Embassy Suites - Montgomery"],
      ["hdesigngroup", "Tru by Hilton"],
      ["esterly-schneider", "O'Reilly Auto Parts"],
      ["esterly-schneider", "Wire Road Brewery"],
      ["esterly-schneider", "City of Springfield Fire Station #13"],
      ["paragon-architecture", "Care to Learn | Infill & Remodel"],
      ["brp-architects", "Caesars Republic Scottsdale"],
    ]),
  ];
}

export function residentialSourceLinks(): SourceLink[] {
  return [
    { label: "Missouri licensee search, external", href: "https://pr.mo.gov/licensee-search.asp" },
    ...profileLinks(RESIDENTIAL_SLUGS),
    ...projectLinks([
      ["arkifex-studios", "Finley River House"],
      ["arkifex-studios", "Casey House Remodel and Restoration"],
      ["hdesigngroup", "Township 28"],
      ["nform-architecture", "Sac River Residence"],
    ]),
    ...RESIDENTIAL_STUDIOS.map((studio) => ({ label: `${studio.name}, external`, href: studio.website })),
    { label: "Burkholder Architecture, Lineage, external", href: "https://www.burkholderarchitecture.com/residential-portfolio/lineage" },
    { label: "OZMO, about, external", href: "https://ozmo.llc/about" },
    { label: "OZMO, Louderback Residence 3, external", href: "https://ozmo.llc/louderback-residence" },
    { label: "OZMO, residential work, external", href: "https://ozmo.llc/residential-1" },
    { label: "Cook Haus Design, about, external", href: "https://www.cookhausdesign.com/about" },
    { label: "Cook Haus Design, Natural Bridge II, external", href: "https://www.cookhausdesign.com/copy-of-buddy-trl" },
    { label: "Burkholder Architecture, Kimberling, external", href: "https://www.burkholderarchitecture.com/residential-portfolio/kimberling" },
  ];
}

export function interiorSourceLinks(): SourceLink[] {
  return [
    { label: "Baron Design & Associates, LLC", href: "/d/architects/baron-design-associates" },
    { label: "Baron Design, about, external", href: "https://baron-design.com/about" },
    ...projectLinks([
      ["baron-design-associates", "The Preston"],
      ["baron-design-associates", "Towneplace Suites"],
      ["baron-design-associates", "Baron Cardiology"],
      ["baron-design-associates", "3810 East Sunshine"],
      ["baron-design-associates", "Hilton Garden Inn"],
    ]),
    ...INTERIOR_STUDIOS.map((studio) => ({ label: `${studio.name}, external`, href: studio.website })),
    { label: "Andrea Nesbitt Designs, contact, external", href: "https://anesbittdesigns.com/contact" },
    { label: "Ellecor Design, team, external", href: "https://ellecordesign.com/meet-our-staff/" },
    { label: "Ellecor Design, contact, external", href: "https://ellecordesign.com/contact/" },
  ];
}
