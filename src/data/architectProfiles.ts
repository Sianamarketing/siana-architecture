/**
 * Source-backed practice profiles. A credit string gets a page only when it
 * is entered here. Other credits stay project lines.
 * Checked 8 November 2026.
 */

export interface ProfileImage {
  src: string;
  alt: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  attribution: string;
  permissionStatus: "commons-licensed";
}

export interface SelectedProject {
  name: string;
  city: string;
  country: string;
  year: string;
  status: string;
  use: string;
  client: string | null;
  collaborators: string | null;
  /** Siana building page when one exists. */
  projectPath: string | null;
  sourceUrl: string;
  sourceLabel: string;
  image: ProfileImage | null;
}

export interface ProfileAward {
  year: string;
  name: string;
  issuer: string;
  scope: "person" | "project" | "practice";
  subject: string;
  sourceUrl: string;
}

export interface ArchitectProfile {
  slug: string;
  /** Exact architect credit string this page may be linked from. */
  creditName: string;
  name: string;
  legalName: string;
  founded: string;
  based: string;
  website: string;
  summary: string;
  overview: string[];
  approach: string[];
  sectors: string[];
  practiceModel: string;
  peopleNote: string;
  offices: { city: string; country: string; role: string }[];
  registration: { place: string; status: string; note: string }[];
  principals: { name: string; role: string; note: string }[];
  projects: SelectedProject[];
  awards: ProfileAward[];
  sources: { label: string; url: string }[];
  checked: string;
}

const cc = (version: "4.0" | "3.0" | "2.0", sa = true) =>
  sa
    ? `https://creativecommons.org/licenses/by-sa/${version}/`
    : `https://creativecommons.org/licenses/by/${version}/`;

export const ARCHITECT_PROFILES: ArchitectProfile[] = [
  {
    slug: "herzog-de-meuron",
    creditName: "Herzog & de Meuron",
    name: "Herzog & de Meuron",
    legalName: "Herzog & de Meuron Basel Ltd.",
    founded: "1978",
    based: "Basel, Switzerland",
    website: "https://www.herzogdemeuron.com/",
    summary: "International architectural practice founded in Basel in 1978 by Jacques Herzog and Pierre de Meuron. The practice describes itself as partner-owned, with headquarters at Rheinschanze 6, 4056 Basel.",
    overview: [
      "Herzog & de Meuron states that it is an international practice based in Basel, founded in 1978, with more than 500 people from 50 countries and more than 600 projects in 40 countries. Those figures are the practice’s own, as published on its practice page when this profile was checked.",
      "The same page says the work runs from small buildings to larger complexes, urban master plans and territorial studies, in the social, cultural and corporate worlds, and that the office treats architecture as public because it affects life in a community.",
    ],
    approach: [
      "The practice writes that it starts without a fixed style: “We have no preconceptions,” and that each project should go beyond the brief, the site and convention, often with collaborators outside architecture.",
      "The 2001 Pritzker Prize jury described the work as refining modernism to an elemental simplicity while transforming materials and surfaces. The prize text also notes collaborations with artists, including Rémy Zaugg, Thomas Ruff and Michael Craig-Martin.",
      "On the Siana building entry for CaixaForum Madrid, the credit is stored as the single line “Herzog & de Meuron”. This page does not split that line, and it does not turn every other credit in the directory into a firm.",
    ],
    sectors: [
      "Cultural and civic buildings, including museums and a concert hall",
      "Conversion and reuse, including the Bankside Power Station as Tate Modern",
      "Heritage work, including Tai Kwun, cited by the practice as a centre for heritage and arts",
      "Commercial and corporate buildings, including the Prada Aoyama Epicenter",
      "Education, including the Blavatnik School of Government",
      "Industrial buildings, including the Ricola storage building",
    ],
    practiceModel: "Partner-owned international practice. The organization page says the firm is owned by its active partners, including the founders. It is not described there as a boutique.",
    peopleNote: "The practice page says more than 500 people work there. That is a headcount given by the practice, not a verified census.",
    offices: [
      { city: "Basel", country: "Switzerland", role: "Founding city and headquarters, Rheinschanze 6, 4056 Basel" },
      { city: "Austin", country: "United States", role: "Office named on the organization page" },
      { city: "Barcelona", country: "Spain", role: "Office named on the organization page" },
      { city: "Berlin", country: "Germany", role: "Office named on the organization page" },
      { city: "Hong Kong", country: "China", role: "Office named on the organization page" },
      { city: "London", country: "United Kingdom", role: "Office named on the organization page" },
      { city: "Munich", country: "Germany", role: "Office named on the organization page" },
      { city: "New York City", country: "United States", role: "Office named on the organization page" },
      { city: "Paris", country: "France", role: "Office named on the organization page" },
      { city: "San Francisco", country: "United States", role: "Office named on the organization page" },
    ],
    registration: [
      {
        place: "Switzerland",
        status: "Not verified",
        note: "A Swiss Society of Engineers and Architects directory URL appears in search, but the membership record could not be read in this check. SIA membership, where it exists, is a professional association and is not a licence to practise in every country.",
      },
      {
        place: "United Kingdom",
        status: "Not verified",
        note: "No Architects Registration Board entry was confirmed for the practice or the founding partners in this check. Registration is personal and territorial. It is not inferred from the fact that the practice has built in the UK.",
      },
    ],
    principals: [
      {
        name: "Jacques Herzog",
        role: "Founding partner",
        note: "Studied at ETH Zurich. Established the practice in Basel with Pierre de Meuron in 1978. No portrait is shown: the practice site credits photographs to Gina Folly, and that credit is not a licence for this page.",
      },
      {
        name: "Pierre de Meuron",
        role: "Founding partner",
        note: "Established the practice with Jacques Herzog in 1978. The Pritzker Prize was awarded to both in 2001. No portrait is shown.",
      },
    ],
    projects: [
      {
        name: "Tate Modern",
        city: "London",
        country: "United Kingdom",
        year: "2000",
        status: "Completed",
        use: "Museum, conversion of the Bankside Power Station",
        client: "Tate",
        collaborators: null,
        projectPath: null,
        sourceUrl: "https://www.pritzkerprize.com/laureates/2001",
        sourceLabel: "The Pritzker Architecture Prize, 2001 laureates",
        image: {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/London_-_Bankside_-_Jubilee_Walkway_-_View_SE_on_Tate_Modern.jpg/1280px-London_-_Bankside_-_Jubilee_Walkway_-_View_SE_on_Tate_Modern.jpg",
          alt: "Tate Modern on Bankside, London, seen from the south-east along the Jubilee Walkway.",
          author: "Txllxt TxllxT",
          license: "CC BY-SA 4.0",
          licenseUrl: cc("4.0"),
          sourceUrl: "https://commons.wikimedia.org/wiki/File:London_-_Bankside_-_Jubilee_Walkway_-_View_SE_on_Tate_Modern.jpg",
          attribution: "Txllxt TxllxT, CC BY-SA 4.0, via Wikimedia Commons",
          permissionStatus: "commons-licensed",
        },
      },
      {
        name: "Ricola Storage Building",
        city: "Laufen",
        country: "Switzerland",
        year: "1987",
        status: "Completed",
        use: "Industrial storage",
        client: null,
        collaborators: null,
        projectPath: null,
        sourceUrl: "https://www.pritzkerprize.com/laureates/2001",
        sourceLabel: "The Pritzker Architecture Prize, 2001 laureates",
        image: null,
      },
      {
        name: "Laban Creekside",
        city: "London",
        country: "United Kingdom",
        year: "2003",
        status: "Completed by the 2003 RIBA Stirling Prize citation",
        use: "Dance centre",
        client: null,
        collaborators: null,
        projectPath: null,
        sourceUrl: "https://www.herzogdemeuron.com/practice/",
        sourceLabel: "Herzog & de Meuron, Selected Awards",
        image: null,
      },
      {
        name: "Prada Aoyama Epicenter",
        city: "Tokyo",
        country: "Japan",
        year: "2005",
        status: "Completed by the 2005 Architectural Institute of Japan citation",
        use: "Retail",
        client: null,
        collaborators: null,
        projectPath: null,
        sourceUrl: "https://www.herzogdemeuron.com/practice/",
        sourceLabel: "Herzog & de Meuron, Selected Awards",
        image: null,
      },
      {
        name: "National Stadium",
        city: "Beijing",
        country: "China",
        year: "2009",
        status: "Completed by the 2009 RIBA Lubetkin Prize citation",
        use: "Stadium",
        client: null,
        collaborators: null,
        projectPath: null,
        sourceUrl: "https://www.herzogdemeuron.com/practice/",
        sourceLabel: "Herzog & de Meuron, Selected Awards",
        image: {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Beijing_China_Beijing-National-Stadium-01.jpg/1280px-Beijing_China_Beijing-National-Stadium-01.jpg",
          alt: "The National Stadium in Beijing, an exterior view of the steel lattice.",
          author: "CEphoto, Uwe Aranas",
          license: "CC BY-SA 3.0",
          licenseUrl: cc("3.0"),
          sourceUrl: "https://commons.wikimedia.org/wiki/File:Beijing_China_Beijing-National-Stadium-01.jpg",
          attribution: "CEphoto, Uwe Aranas, CC BY-SA 3.0, via Wikimedia Commons",
          permissionStatus: "commons-licensed",
        },
      },
      {
        name: "1111 Lincoln Road",
        city: "Miami Beach",
        country: "United States",
        year: "2014",
        status: "Completed by the 2014 Mies Crown Hall Americas Prize citation",
        use: "Not verified beyond the building name",
        client: null,
        collaborators: null,
        projectPath: null,
        sourceUrl: "https://www.herzogdemeuron.com/practice/",
        sourceLabel: "Herzog & de Meuron, Selected Awards",
        image: {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/1111_Lincoln_Road_-_Flickr_-_paologmb.jpg/1280px-1111_Lincoln_Road_-_Flickr_-_paologmb.jpg",
          alt: "1111 Lincoln Road in Miami Beach, an open concrete structure seen from the street.",
          author: "Paolo Gamba",
          license: "CC BY 2.0",
          licenseUrl: cc("2.0", false),
          sourceUrl: "https://commons.wikimedia.org/wiki/File:1111_Lincoln_Road_-_Flickr_-_paologmb.jpg",
          attribution: "Paolo Gamba, CC BY 2.0, via Wikimedia Commons",
          permissionStatus: "commons-licensed",
        },
      },
      {
        name: "Blavatnik School of Government",
        city: "Oxford",
        country: "United Kingdom",
        year: "2016",
        status: "Completed by the 2016 RIBA National Award citation",
        use: "Education",
        client: null,
        collaborators: null,
        projectPath: null,
        sourceUrl: "https://www.herzogdemeuron.com/practice/",
        sourceLabel: "Herzog & de Meuron, Selected Awards",
        image: null,
      },
      {
        name: "Elbphilharmonie",
        city: "Hamburg",
        country: "Germany",
        year: "2018",
        status: "Completed by the 2018 BDA Hamburg Architekturpreis citation",
        use: "Concert hall",
        client: null,
        collaborators: null,
        projectPath: null,
        sourceUrl: "https://www.herzogdemeuron.com/practice/",
        sourceLabel: "Herzog & de Meuron, Selected Awards",
        image: {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Hamburg%2C_Elbphilharmonie_--_2023_--_6565.jpg/1280px-Hamburg%2C_Elbphilharmonie_--_2023_--_6565.jpg",
          alt: "The Elbphilharmonie in Hamburg, a glass volume above a brick warehouse, seen from the harbour.",
          author: "Dietmar Rabich",
          license: "CC BY-SA 4.0",
          licenseUrl: cc("4.0"),
          sourceUrl: "https://commons.wikimedia.org/wiki/File:Hamburg,_Elbphilharmonie_--_2023_--_6565.jpg",
          attribution: "Dietmar Rabich, CC BY-SA 4.0, via Wikimedia Commons",
          permissionStatus: "commons-licensed",
        },
      },
      {
        name: "Tai Kwun, Centre for Heritage and Arts",
        city: "Hong Kong",
        country: "China",
        year: "2019",
        status: "Completed by the 2019 UNESCO Asia-Pacific Award citation",
        use: "Heritage and arts",
        client: null,
        collaborators: null,
        projectPath: null,
        sourceUrl: "https://www.herzogdemeuron.com/practice/",
        sourceLabel: "Herzog & de Meuron, Selected Awards",
        image: null,
      },
      {
        name: "CaixaForum Madrid",
        city: "Madrid",
        country: "Spain",
        year: "2008",
        status: "Completed on the Siana building entry",
        use: "Not verified from the Siana category field",
        client: null,
        collaborators: null,
        projectPath: "/projects/caixaforum-madrid",
        sourceUrl: "https://www.herzogdemeuron.com/practice/",
        sourceLabel: "Siana Architecture building entry; practice site for the office",
        image: {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Caixaforum_Madrid_2024.jpg/1280px-Caixaforum_Madrid_2024.jpg",
          alt: "CaixaForum Madrid, the former power station with a rusted upper volume, seen from the plaza.",
          author: "Fernando",
          license: "CC BY-SA 4.0",
          licenseUrl: cc("4.0"),
          sourceUrl: "https://commons.wikimedia.org/wiki/File:Caixaforum_Madrid_2024.jpg",
          attribution: "Fernando, CC BY-SA 4.0, via Wikimedia Commons",
          permissionStatus: "commons-licensed",
        },
      },
    ],
    awards: [
      { year: "2001", name: "Pritzker Architecture Prize", issuer: "The Hyatt Foundation", scope: "person", subject: "Jacques Herzog and Pierre de Meuron", sourceUrl: "https://www.pritzkerprize.com/laureates/2001" },
      { year: "2003", name: "RIBA Stirling Prize", issuer: "Royal Institute of British Architects", scope: "project", subject: "Laban Creekside, London", sourceUrl: "https://www.herzogdemeuron.com/practice/" },
      { year: "2007", name: "Royal Gold Medal", issuer: "Royal Institute of British Architects", scope: "person", subject: "Jacques Herzog and Pierre de Meuron", sourceUrl: "https://www.herzogdemeuron.com/practice/" },
      { year: "2007", name: "Praemium Imperiale", issuer: "Japan Art Association", scope: "person", subject: "Jacques Herzog and Pierre de Meuron", sourceUrl: "https://www.herzogdemeuron.com/practice/" },
      { year: "2009", name: "RIBA Lubetkin Prize", issuer: "Royal Institute of British Architects", scope: "project", subject: "National Stadium, Beijing", sourceUrl: "https://www.herzogdemeuron.com/practice/" },
      { year: "2019", name: "UNESCO Asia-Pacific Award", issuer: "UNESCO Asia-Pacific", scope: "project", subject: "Tai Kwun, Hong Kong", sourceUrl: "https://www.herzogdemeuron.com/practice/" },
    ],
    sources: [
      { label: "Herzog & de Meuron, Practice", url: "https://www.herzogdemeuron.com/practice/" },
      { label: "Herzog & de Meuron, Organization", url: "https://www.herzogdemeuron.com/practice/organization/" },
      { label: "Herzog & de Meuron, Offices", url: "https://www.herzogdemeuron.com/practice/offices/" },
      { label: "Herzog & de Meuron, Jacques Herzog", url: "https://www.herzogdemeuron.com/practice/people/jacques-herzog/" },
      { label: "The Pritzker Architecture Prize, 2001", url: "https://www.pritzkerprize.com/laureates/2001" },
      { label: "Siana Architecture, CaixaForum Madrid", url: "https://sianaarchitecture.com/projects/caixaforum-madrid" },
    ],
    checked: "8 November 2026",
  },
];

export function profileForCredit(name: string): ArchitectProfile | null {
  const trimmed = name.trim();
  return ARCHITECT_PROFILES.find((profile) => profile.creditName === trimmed) || null;
}

export function profileBySlug(slug: string | undefined): ArchitectProfile | null {
  if (!slug) return null;
  return ARCHITECT_PROFILES.find((profile) => profile.slug === slug) || null;
}
