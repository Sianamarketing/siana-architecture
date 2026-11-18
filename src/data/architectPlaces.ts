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

/** Checked 18 November 2026 from each practice website. No NCIDQ or Missouri interior licence was confirmed, so the hub does not show a credential column. */
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
