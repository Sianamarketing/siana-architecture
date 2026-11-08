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
  { slug: "baron-design-associates", homes: "The Preston, senior housing", commercial: "Hilton Garden Inn, Towneplace Suites, Baron Cardiology, 3810 East Sunshine", note: "Architecture and interior design on those project pages." },
  { slug: "arkifex-studios", homes: "Finley River House, Nixa. Casey House is designed.", commercial: "Lost Signal Brewing, Springfield", note: "The firm describes itself as boutique." },
  { slug: "bkd-design-collective", homes: "", commercial: "St. Jude Mercy Clinic. Moxy interiors. Chateau on the Lake credit.", note: "Architecture, engineering, and interior design." },
  { slug: "hood-rich", homes: "", commercial: "Centerstone Building A. Burrell administration. Embassy Suites public spaces.", note: "Burrell's city is not stated. Embassy Suites is a renovation." },
  { slug: "hdesigngroup", homes: "Township 28 apartments", commercial: "Tru by Hilton", note: "The 505 page describes a consultant and owner representative." },
  { slug: "esterly-schneider", homes: "", commercial: "O'Reilly, nationwide. Fire Station #13.", note: "Wire Road Brewery is in Battlefield." },
  { slug: "nform-architecture", homes: "Sac River Residence", commercial: "", note: "The municipality is not stated." },
  { slug: "paragon-architecture", homes: "", commercial: "Care to Learn remodel", note: "Springfield office, with other offices listed." },
  { slug: "brp-architects", homes: "", commercial: "Caesars Republic, Scottsdale", note: "The hotel is in Arizona." },
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
