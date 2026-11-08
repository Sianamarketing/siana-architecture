/**
 * Source-backed practice profiles. A credit string gets a page only when it
 * is entered here. Other credits stay project lines.
 * Checked 8 November 2026.
 */
import { SPRINGFIELD_PROFILES } from "@/data/springfieldProfiles";

export interface ProfileImage {
  src: string;
  alt: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  attribution: string;
  permissionStatus: "commons-licensed" | "commons-pd-textlogo" | "official-identifying-mark";
}

export interface ProfileMark extends ProfileImage {
  caveat: string;
}

export interface ProfileFact {
  label: string;
  value: string;
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
  /** Editorial paragraph for a text row. Gallery profiles can omit it. */
  summary?: string;
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
  services: string[];
  seniorPartners: string[];
  offices: { city: string; country: string; role: string }[];
  registration: { place: string; status: string; note: string }[];
  principals: { name: string; role: string; note: string; image: ProfileImage | null }[];
  mark: ProfileMark | null;
  facts: ProfileFact[];
  projects: SelectedProject[];
  awards: ProfileAward[];
  sources: { label: string; url: string }[];
  checked: string;
  /** Local guides use text rows. The default keeps the gallery and project table. */
  projectPresentation?: "gallery" | "rows";
  sourcesNote?: string;
  guide?: { label: string; path: string };
  address?: { street: string; locality: string; region: string; postalCode: string; country: string };
  /** Short project-experience line for a place table. */
  experience?: string;
  /** Reversed official marks sit on ink so the white drawing stays visible. */
  markOnInk?: boolean;
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
    summary: "International practice founded in Basel in 1978 by Jacques Herzog and Pierre de Meuron, owned by its active partners.",
    overview: [
      "Herzog & de Meuron is an international architecture office in Basel. Jacques Herzog and Pierre de Meuron founded it in 1978. The work runs from small buildings to large complexes, urban plans, and territorial studies, across social, cultural, and corporate projects. The partners treat a building as public, because it changes daily life in a community.",
      "More than 500 people from 50 countries work on more than 600 projects in 40 countries. The headcount and the project count come from the practice.",
    ],
    approach: [
      "The practice page opens with “We have no preconceptions,” and describes each project as going beyond the brief, the site, and convention, often with people from outside architecture.",
      "For Tate Modern, the project page gives the method in the architects' words: “Our strategy was to accept the physical power of Bankside’s massive mountain-like brick building and to even enhance it rather than breaking it or trying to diminish it.”",
      "In July 2018, on the Tai Kwun project page, Jacques Herzog wrote that the office works with what is already there, and he pointed to Tate Modern and Tai Kwun.",
      "Ada Louise Huxtable, for the 2001 Pritzker Prize jury, wrote that the work refines modernism to an elemental simplicity while transforming materials and surfaces. The prize biography also records collaborations with Rémy Zaugg, Thomas Ruff, and Michael Craig-Martin.",
    ],
    sectors: [
      "Cultural and civic buildings, including museums and a concert hall",
      "Conversion and reuse, including the Bankside Power Station as Tate Modern",
      "Heritage work, including Tai Kwun, cited by the practice as a centre for heritage and arts",
      "Commercial and corporate buildings, including the Prada Aoyama Epicenter",
      "Education, including the Blavatnik School of Government",
      "Industrial buildings, including the Ricola storage building",
    ],
    practiceModel: "Owned by its active partners, including the founders.",
    peopleNote: "More than 500 people, from the practice's own count.",
    services: [
      "Buildings, from small ones to large complexes, with the design shaped for each project.",
      "Urban master plans and territorial studies.",
      "Social, cultural, and corporate work.",
      "A project carried from concept through completion, with partners, associates, project teams, and studios in other cities.",
    ],
    seniorPartners: [
      "Christine Binswanger",
      "Ascan Mergenthaler",
      "Stefan Marbach",
      "Jason Frantzen",
      "Andreas Fries",
      "Wim Walschap",
      "Robert Hösl",
      "Simon Demeuse",
      "Santiago Espitia Berndt",
      "Martin Knüsel",
      "Olga Bolshanina",
      "Christoph Röttinger",
      "Tobias Winkelmann",
      "Helen Ng",
      "Julian Oggier",
      "Tristan Zelic",
    ],
    offices: [
      { city: "Basel", country: "Switzerland", role: "Headquarters, Rheinschanze 6, 4056 Basel" },
      { city: "Austin", country: "United States", role: "Office" },
      { city: "Barcelona", country: "Spain", role: "Office" },
      { city: "Berlin", country: "Germany", role: "Office" },
      { city: "Hong Kong", country: "China", role: "Office" },
      { city: "London", country: "United Kingdom", role: "Office" },
      { city: "Munich", country: "Germany", role: "Office" },
      { city: "New York City", country: "United States", role: "Office" },
      { city: "Paris", country: "France", role: "Office" },
      { city: "San Francisco", country: "United States", role: "Office" },
    ],
    registration: [
      {
        place: "Switzerland",
        status: "Not verified",
        note: "No public Swiss register entry was confirmed in this check. Membership of a professional association, where it exists, is not a licence to practise in every country.",
      },
      {
        place: "United Kingdom",
        status: "Not verified",
        note: "The Architects Registration Board site did not return a readable register entry for Jacques Herzog, Pierre de Meuron, or the practice name in this check. Registration is personal and territorial. It is not inferred from buildings in the UK.",
      },
      {
        place: "Florida, United States",
        status: "Stated by the practice",
        note: "The 1111 Lincoln Road project page says the practice is not licensed to practise architecture in Florida, and that a Florida-licensed architect of record took part. That person is not named. The sentence is about one state, not a finding about any other jurisdiction.",
      },
    ],
    mark: {
      src: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Herzog_%26_de_Meuron_logo.png",
      alt: "H&dM wordmark",
      author: "Herzog & de Meuron",
      license: "Public domain (PD-textlogo)",
      licenseUrl: "https://commons.wikimedia.org/wiki/Template:PD-textlogo",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Herzog_%26_de_Meuron_logo.png",
      attribution: "H&dM wordmark, via Wikimedia Commons, PD-textlogo",
      permissionStatus: "commons-pd-textlogo",
      caveat: "Wikimedia Commons records this as a simple text logo, public domain under the PD-textlogo claim. H&dM is a trademark of the practice. It is shown here only to identify the firm.",
    },
    facts: [
      { label: "Model", value: "Partner-owned" },
      { label: "Founded", value: "1978" },
      { label: "Base", value: "Basel, Switzerland" },
      { label: "Legal name", value: "Herzog & de Meuron Basel Ltd." },
      { label: "Offices", value: "10 offices" },
      { label: "People", value: "More than 500" },
      { label: "Sectors", value: "Cultural, civic, reuse, heritage, commercial, education, industrial" },
      { label: "Registration", value: "Not verified" },
    ],
    principals: [
      {
        name: "Jacques Herzog",
        role: "Founding partner",
        note: "He studied architecture at ETH Zurich from 1970 to 1975, and founded the office with Pierre de Meuron in 1978.",
        image: {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Jacques_Herzog_2025.jpg/1280px-Jacques_Herzog_2025.jpg",
          alt: "Jacques Herzog in 2025, wearing a dark knit cap and sweater, against a plain wall.",
          author: "Quaenuncabibis",
          license: "CC BY-SA 4.0",
          licenseUrl: cc("4.0"),
          sourceUrl: "https://commons.wikimedia.org/wiki/File:Jacques_Herzog_2025.jpg",
          attribution: "Quaenuncabibis, CC BY-SA 4.0, via Wikimedia Commons",
          permissionStatus: "commons-licensed",
        },
      },
      {
        name: "Pierre de Meuron",
        role: "Founding partner",
        note: "He attended ETH Zurich and founded the practice with Jacques Herzog in 1978. The two shared the 2001 Pritzker Prize.",
        image: {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/31._ISC-Symposium-Pierre_de_Meuron-HSGN_028-01578.jpg/1280px-31._ISC-Symposium-Pierre_de_Meuron-HSGN_028-01578.jpg",
          alt: "Pierre de Meuron seated at the 31st ISC Symposium, in a pinstripe jacket.",
          author: "St. Gallen Symposium, Universitätsarchiv St. Gallen, HSGN 028/01578",
          license: "CC BY-SA 4.0",
          licenseUrl: cc("4.0"),
          sourceUrl: "https://commons.wikimedia.org/wiki/File:31._ISC-Symposium-Pierre_de_Meuron-HSGN_028-01578.jpg",
          attribution: "St. Gallen Symposium, Universitätsarchiv St. Gallen, HSGN 028/01578, CC BY-SA 4.0, via Wikimedia Commons",
          permissionStatus: "commons-licensed",
        },
      },
    ],
    projects: [
      {
        name: "Ricola Storage Building",
        city: "Laufen",
        country: "Switzerland",
        year: "1987",
        status: "Realized 1987",
        use: "Automated storage of herbal sweets",
        client: "Ricola, Laufen",
        collaborators: null,
        projectPath: null,
        sourceUrl: "https://www.herzogdemeuron.com/projects/038-ricola-storage-building/",
        sourceLabel: "Herzog & de Meuron, Ricola Storage Building",
        image: null,
      },
      {
        name: "Tate Modern",
        city: "London",
        country: "United Kingdom",
        year: "1998-2000",
        status: "Realized 1998-2000",
        use: "Museum, conversion of the Bankside Power Station",
        client: "Tate Gallery, London",
        collaborators: "Associate architect: Sheppard Robson + Partners",
        projectPath: null,
        sourceUrl: "https://www.herzogdemeuron.com/projects/126-tate-modern/",
        sourceLabel: "Herzog & de Meuron, Tate Modern",
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
        name: "Laban Dance Centre",
        city: "London",
        country: "United Kingdom",
        year: "2000-2003",
        status: "Realized 2000-2003",
        use: "Dance centre",
        client: "Laban Centre, London",
        collaborators: "Michael Craig-Martin, for a wall painting and the building colours",
        projectPath: null,
        sourceUrl: "https://www.herzogdemeuron.com/projects/160-laban-dance-centre/",
        sourceLabel: "Herzog & de Meuron, Laban Dance Centre",
        image: null,
      },
      {
        name: "Prada Aoyama",
        city: "Tokyo",
        country: "Japan",
        year: "2001-2003",
        status: "Realized 2001-2003",
        use: "Retail",
        client: "Prada (PRADA Japan Co., Ltd.), Tokyo",
        collaborators: "Associate architect: Takenaka Corporation",
        projectPath: null,
        sourceUrl: "https://www.herzogdemeuron.com/projects/178-prada-aoyama/",
        sourceLabel: "Herzog & de Meuron, Prada Aoyama",
        image: null,
      },
      {
        name: "CaixaForum Madrid",
        city: "Madrid",
        country: "Spain",
        year: "2003-2008",
        status: "Realized 2003-2008",
        use: "Cultural institution in a converted power station",
        client: "Obra Social Fundación “LaCaixa”, Madrid, and Caixa d’Estalvis i Pensions de Barcelona",
        collaborators: "Associate architect: Mateu i Bausells Arquitectura. Green wall with Patrick Blanc.",
        projectPath: "/projects/caixaforum-madrid",
        sourceUrl: "https://www.herzogdemeuron.com/projects/201-caixaforum-madrid/",
        sourceLabel: "Herzog & de Meuron, CaixaForum Madrid",
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
      {
        name: "National Stadium",
        city: "Beijing",
        country: "China",
        year: "2003-2008",
        status: "Realized 2003-2008",
        use: "Main stadium for the 2008 Olympic Games",
        client: "National Stadium Co. Ltd., Beijing",
        collaborators: "Artistic advisor: Ai Weiwei. Competition consortium with Arup and China Architectural Design & Research Group.",
        projectPath: null,
        sourceUrl: "https://www.herzogdemeuron.com/projects/226-national-stadium/",
        sourceLabel: "Herzog & de Meuron, National Stadium",
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
        year: "2008-2010",
        status: "Realized 2008-2010",
        use: "Mixed use: parking, retail and a private residence",
        client: "MBeach1 and Robert Wennett",
        collaborators: "A Florida-licensed architect of record is mentioned. The person is not named.",
        projectPath: null,
        sourceUrl: "https://www.herzogdemeuron.com/projects/279-1111-lincoln-road/",
        sourceLabel: "Herzog & de Meuron, 1111 Lincoln Road",
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
        year: "2013-2015",
        status: "Realized 2013-2015",
        use: "School of government",
        client: "The University of Oxford",
        collaborators: null,
        projectPath: null,
        sourceUrl: "https://www.herzogdemeuron.com/projects/387-blavatnik-school-of-government/",
        sourceLabel: "Herzog & de Meuron, Blavatnik School of Government",
        image: null,
      },
      {
        name: "Elbphilharmonie",
        city: "Hamburg",
        country: "Germany",
        year: "2006-2016",
        status: "Realized 2006-2016. Opened January 2017.",
        use: "Concert halls, with apartments, a hotel and public rooms, on the Kaispeicher warehouse",
        client: "Freie und Hansestadt Hamburg",
        collaborators: "General designer with Hohler+Partner Architekten (2005-2013), then with H+P Planungsgesellschaft and Hochtief (2013-2016).",
        projectPath: null,
        sourceUrl: "https://www.herzogdemeuron.com/projects/230-elbphilharmonie-hamburg/",
        sourceLabel: "Herzog & de Meuron, Elbphilharmonie Hamburg",
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
        year: "2011-2018",
        status: "Realized 2011-2018",
        use: "Heritage and arts, reuse of the former Central Police Station compound",
        client: "The Hong Kong Jockey Club",
        collaborators: "Executive architect: Rocco Design Architects. Conservation architect: Purcell.",
        projectPath: null,
        sourceUrl: "https://www.herzogdemeuron.com/projects/296-tai-kwun-centre-for-heritage-art/",
        sourceLabel: "Herzog & de Meuron, Tai Kwun",
        image: null,
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
      { label: "Herzog & de Meuron, Ricola Storage Building", url: "https://www.herzogdemeuron.com/projects/038-ricola-storage-building/" },
      { label: "Herzog & de Meuron, Tate Modern", url: "https://www.herzogdemeuron.com/projects/126-tate-modern/" },
      { label: "Herzog & de Meuron, Laban Dance Centre", url: "https://www.herzogdemeuron.com/projects/160-laban-dance-centre/" },
      { label: "Herzog & de Meuron, Prada Aoyama", url: "https://www.herzogdemeuron.com/projects/178-prada-aoyama/" },
      { label: "Herzog & de Meuron, CaixaForum Madrid", url: "https://www.herzogdemeuron.com/projects/201-caixaforum-madrid/" },
      { label: "Herzog & de Meuron, National Stadium", url: "https://www.herzogdemeuron.com/projects/226-national-stadium/" },
      { label: "Herzog & de Meuron, 1111 Lincoln Road", url: "https://www.herzogdemeuron.com/projects/279-1111-lincoln-road/" },
      { label: "Herzog & de Meuron, Elbphilharmonie Hamburg", url: "https://www.herzogdemeuron.com/projects/230-elbphilharmonie-hamburg/" },
      { label: "Herzog & de Meuron, Tai Kwun", url: "https://www.herzogdemeuron.com/projects/296-tai-kwun-centre-for-heritage-art/" },
      { label: "Herzog & de Meuron, Blavatnik School of Government", url: "https://www.herzogdemeuron.com/projects/387-blavatnik-school-of-government/" },
      { label: "Wikimedia Commons, H&dM wordmark", url: "https://commons.wikimedia.org/wiki/File:Herzog_%26_de_Meuron_logo.png" },
      { label: "Wikimedia Commons, Jacques Herzog, 2025", url: "https://commons.wikimedia.org/wiki/File:Jacques_Herzog_2025.jpg" },
      { label: "Wikimedia Commons, Pierre de Meuron at the 31st ISC Symposium", url: "https://commons.wikimedia.org/wiki/File:31._ISC-Symposium-Pierre_de_Meuron-HSGN_028-01578.jpg" },
      { label: "Siana Architecture, CaixaForum Madrid", url: "https://sianaarchitecture.com/projects/caixaforum-madrid" },
    ],
    checked: "8 November 2026",
  },
];

const PRACTICE_PROFILES = [...ARCHITECT_PROFILES, ...SPRINGFIELD_PROFILES];

export function profileForCredit(name: string): ArchitectProfile | null {
  const trimmed = name.trim();
  return PRACTICE_PROFILES.find((profile) => profile.creditName === trimmed) || null;
}

export function profileBySlug(slug: string | undefined): ArchitectProfile | null {
  if (!slug) return null;
  return PRACTICE_PROFILES.find((profile) => profile.slug === slug) || null;
}

export function profileStructuredData(profile: ArchitectProfile) {
  const url = `https://sianaarchitecture.com/d/architects/${profile.slug}`;
  const crumbs = [
    { name: "Directory", item: "https://sianaarchitecture.com/d/" },
    { name: "Architects", item: "https://sianaarchitecture.com/d/architects" },
  ];
  if (profile.guide) crumbs.push({ name: profile.guide.label, item: `https://sianaarchitecture.com${profile.guide.path}` });
  crumbs.push({ name: profile.name, item: url });
  const graph: Record<string, unknown>[] = [
    {
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: crumb.item,
      })),
    },
  ];
  if (profile.address) {
    graph.push({
      "@type": "ProfessionalService",
      name: profile.name,
      url,
      sameAs: profile.website,
      address: {
        "@type": "PostalAddress",
        streetAddress: profile.address.street,
        addressLocality: profile.address.locality,
        addressRegion: profile.address.region,
        postalCode: profile.address.postalCode,
        addressCountry: profile.address.country,
      },
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
