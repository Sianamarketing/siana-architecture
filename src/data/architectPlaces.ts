/**
 * Editorial place guides under /d/architects. Firm facts come from the
 * practice pages checked on 8 November 2026. The sequence is an editorial
 * selection. Baron Design & Associates, LLC is first because the editor
 * asked for that order.
 */

export interface PlaceProject {
  title: string;
  url: string;
  location: string;
  status: string;
  note: string | null;
}

export interface PlaceFirm {
  slug: string;
  name: string;
  office: string;
  website: string;
  summary: string;
  projects: PlaceProject[];
}

export interface PlaceFacet {
  id: string;
  label: string;
  intro: string;
  firmSlugs: string[];
}

export const SPRINGFIELD_PLACE = {
  slug: "springfield-missouri",
  path: "/d/architects/springfield-missouri",
  city: "Springfield",
  region: "Missouri",
  title: "Best architecture firms in Springfield, Missouri",
  summary:
    "Nine practices with a Springfield office. The sequence is an editorial selection, and Baron Design & Associates, LLC is placed first. Project cities are listed separately from the office address.",
  checked: "8 November 2026",
};

export const SPRINGFIELD_FIRMS: PlaceFirm[] = [
  {
    slug: "baron-design-associates",
    name: "Baron Design & Associates, LLC",
    office: "3810 E. Sunshine St., Suite 101, Springfield, MO 65809",
    website: "https://baron-design.com/",
    summary:
      "Springfield architecture, planning, and design practice established in 2003 by principal Rita Baron. The about page lists renovation experience and names restaurants, hospitality, healthcare, multifamily housing, corporate offices, retail, financial institutions, recreation, and historical renovations among its services. The restaurant and renovation lines are service descriptions. The completed Springfield projects below each state a scope of architecture and interior design.",
    projects: [
      { title: "The Preston", url: "https://baron-design.com/portfolio/the-preston-springfield-mo", location: "Springfield, Missouri", status: "Completed 2022", note: "About 129,000 square feet. Senior independent living, with a commercial kitchen and dining room, outdoor gathering areas, and a poolside cabana. Scope stated as architecture and interior design." },
      { title: "Towneplace Suites", url: "https://baron-design.com/portfolio/towneplace-suites-springfield-mo", location: "Springfield, Missouri", status: "Completed 2014", note: "About 72,000 square feet. Extended-stay hotel with meeting spaces. Scope stated as architecture and interior design." },
      { title: "Baron Cardiology", url: "https://baron-design.com/portfolio/baron-cardiology-springfield-mo", location: "Springfield, Missouri", status: "Completed 2009", note: "About 20,000 square feet. Two-story cardiology clinic and administrative space. Scope stated as architecture and interior design." },
      { title: "3810 East Sunshine", url: "https://baron-design.com/portfolio/3810-east-sunshine-springfield-mo", location: "Springfield, Missouri", status: "Completed 2021", note: "About 47,000 square feet. Office building for Baron Design, Central Bank, OakStar Bancshares, and Husch Blackwell. Scope stated as architecture and interior design." },
      { title: "Hilton Garden Inn", url: "https://baron-design.com/portfolio/hilton-garden-inn-springfield-mo", location: "Springfield, Missouri", status: "Completed 2011", note: "About 83,000 square feet. Five-story hotel with conference space, an enclosed pavilion, and a saltwater pool. Scope stated as architecture and interior design." },
    ],
  },
  {
    slug: "arkifex-studios",
    name: "Arkifex Studios",
    office: "301 W Walnut St, Springfield, MO 65806",
    website: "https://www.arkifexstudios.com/",
    summary:
      "The practice describes itself as a boutique firm and lists single-family houses, multi-family housing, offices, commercial work, and educational work.",
    projects: [
      { title: "Finley River House", url: "https://www.arkifexstudios.com/work/finleyriverhouse", location: "Nixa, Missouri", status: "Completed 2022", note: "5,500 square-foot single-family house on 24 acres. Gabled forms refer to farmhouses and local grist mills." },
      { title: "Lost Signal Brewing", url: "https://www.arkifexstudios.com/work/lostsignal", location: "Springfield, Missouri", status: "Completed 2016", note: "3,603 square-foot brewery and barbecue restaurant in a former AM radio station, mixing a remodel with new construction." },
      { title: "Casey House Remodel and Restoration", url: "https://www.arkifexstudios.com/work/casey-house-remodel-and-restoration", location: "Springfield, Missouri", status: "Designed", note: "Expansion and interior remodel of a 1965 house. The page describes the work as designed." },
    ],
  },
  {
    slug: "bkd-design-collective",
    name: "Buxton Kubik Dodd Design Collective",
    office: "3100 S National Ave. Suite 300, Springfield, MO 65807",
    website: "https://bkddc.com/about/",
    summary:
      "The about page describes architecture, engineering, and interior design in one firm, and says in-house engineering was added in 2013.",
    projects: [
      { title: "St. Jude Mercy Clinic", url: "https://bkddc.com/project/st-jude-mercy-clinic/", location: "Springfield, Missouri", status: "Date not on the project page", note: "Medical project in the portfolio." },
      { title: "Moxy Springfield Downtown", url: "https://bkddc.com/project/moxy-springfield-downtown/", location: "Springfield, Missouri", status: "Date not on the project page", note: "The page title describes hospitality interior design." },
      { title: "Chateau on the Lake Resort, Spa and Convention Center", url: "https://bkddc.com/project/chateau-on-the-lake-resort-spa-and-convention-center/", location: "Branson, Missouri", status: "Date not on the project page", note: "Portfolio credit. The readable page does not state the scope." },
    ],
  },
  {
    slug: "hood-rich",
    name: "Hood-Rich Architecture",
    office: "1722 S Luster Ave, Springfield, MO 65804",
    website: "https://www.hoodrich.com/",
    summary: "The home page describes healthcare and hospitality work.",
    projects: [
      { title: "Burrell Behavioral Health administrative campus", url: "https://www.hoodrich.com/projects/burrell-behavioral-health", location: "Location not stated on the project page", status: "Completed 2020", note: "43,000 square-foot conversion of a former higher-education building into a leadership administrative campus." },
      { title: "Centerstone Building A Renovation + Addition", url: "https://www.hoodrich.com/healthcare", location: "Springfield, Missouri", status: "Date on the healthcare page is not stated", note: "Integrated physical and behavioral healthcare facility." },
      { title: "Embassy Suites - Montgomery", url: "https://www.hoodrich.com/projects/embassy-suites---montgomery", location: "Montgomery, state not stated on the page", status: "Completed 2020", note: "Public-space renovation with the owner interior designer: atrium, bar, hotel restaurant, and 15,000 square feet of meeting space." },
    ],
  },
  {
    slug: "hdesigngroup",
    name: "hdesigngroup",
    office: "5039 S National Ave, Springfield, MO 65810",
    website: "https://hdesigngroup.com/contact",
    summary: "Springfield office listed on the contact page, with apartment and hotel projects in the portfolio.",
    projects: [
      { title: "Township 28", url: "https://hdesigngroup.com/project/township-28", location: "Springfield, Missouri", status: "Completed 2016", note: "Seven apartment buildings and a clubhouse, 138 units, in Galloway Village. The page describes the apartments as luxury." },
      { title: "Tru by Hilton", url: "https://hdesigngroup.com/project/tru-by-hilton", location: "Springfield, Missouri", status: "Completed 2020", note: "40,497 square feet. Described as a downtown midscale hotel prototype." },
      { title: "The 505", url: "https://hdesigngroup.com/project/the-505", location: "Springfield, Missouri", status: "Completed 2021", note: "The page describes the perspectives division as design consultant and owner representative, including units, furniture, amenities, vendors, construction management, and administration." },
    ],
  },
  {
    slug: "esterly-schneider",
    name: "Esterly, Schneider & Associates",
    office: "1736 East Sunshine, Suite 417, Springfield, MO 65804",
    website: "https://esterlyschneider.com/",
    summary: "Commercial practice. The home page also shows Wire Road Brewery in Battlefield and City of Springfield Fire Station #13.",
    projects: [
      { title: "O'Reilly Auto Parts", url: "https://esterlyschneider.com/portfolio/oreilly/", location: "Nationwide", status: "Date not on the project page", note: "Commercial portfolio entry. The page does not describe a Springfield store." },
      { title: "Wire Road Brewery", url: "https://esterlyschneider.com/", location: "Battlefield, Missouri", status: "Date not stated", note: "Shown on the home page." },
    ],
  },
  {
    slug: "nform-architecture",
    name: "N·FORM Architecture",
    office: "312 W Commercial St, Springfield, MO 65803",
    website: "https://nformarc.com/contact-us/",
    summary: "Springfield office on the contact page, with a house project shaped by a river site.",
    projects: [
      { title: "Sac River Residence", url: "https://nformarc.com/project/sac-river-residence/", location: "Municipality not stated", status: "Date not stated", note: "8,000 square feet between a former quarry lake and the Sac River valley, with winter sun, summer shade, geothermal heat pumps, and radiant heat. The page describes a future solar array." },
    ],
  },
  {
    slug: "paragon-architecture",
    name: "Paragon Architecture",
    office: "637 W College St, Springfield, MO 65806",
    website: "https://www.paragonarchitecture.com/locations/springfield/",
    summary: "Springfield office, with other offices in St. Louis, Kansas City, Joplin, and Northwest Arkansas.",
    projects: [
      { title: "Care to Learn | Infill & Remodel", url: "https://www.paragonarchitecture.com/portfolio/care-to-learn-infill-remodel/", location: "Springfield, Missouri", status: "Date not on the project page", note: "Three retail spaces at 1047 S Glenstone converted into headquarters offices, keeping the late-1950s character of the building." },
    ],
  },
  {
    slug: "brp-architects",
    name: "BRP Architects",
    office: "138 Park Central Square Suite #101, Springfield, MO 65806",
    website: "https://www.brparc.com/",
    summary: "Architecture, design, and planning practice with a Springfield office.",
    projects: [
      { title: "Caesars Republic Scottsdale", url: "https://www.brparc.com/post/2025-red-awards-hospitality-project-of-the-year-caesar-republic-scottsdale", location: "Scottsdale, Arizona", status: "Described in a 21 March 2025 article", note: "The article says BRP Architects designed the 11-story hotel, with 265 guestrooms, a rooftop pool and lounge, event space, and two restaurants." },
    ],
  },
];

export const SPRINGFIELD_FACETS: PlaceFacet[] = [
  {
    id: "commercial",
    label: "Commercial",
    intro: "Offices, clinics, hotels, and other commercial work tied to a Springfield practice.",
    firmSlugs: ["baron-design-associates", "arkifex-studios", "bkd-design-collective", "hood-rich", "hdesigngroup", "esterly-schneider", "paragon-architecture", "brp-architects"],
  },
  {
    id: "residential",
    label: "Residential",
    intro: "Senior housing, apartments, and houses are separate kinds of residential work.",
    firmSlugs: ["baron-design-associates", "arkifex-studios", "hdesigngroup", "nform-architecture"],
  },
  {
    id: "healthcare",
    label: "Healthcare",
    intro: "Clinics and care buildings named on the practice pages.",
    firmSlugs: ["baron-design-associates", "bkd-design-collective", "hood-rich"],
  },
  {
    id: "hotels",
    label: "Hotels",
    intro: "Hotel projects. The scope on the project page is part of the credit.",
    firmSlugs: ["baron-design-associates", "bkd-design-collective", "hood-rich", "hdesigngroup", "brp-architects"],
  },
  {
    id: "renovations",
    label: "Renovations",
    intro: "Remodels and conversions described on a project page. Baron Design lists renovation among its services on the about page.",
    firmSlugs: ["arkifex-studios", "hood-rich", "paragon-architecture", "baron-design-associates"],
  },
  {
    id: "restaurants",
    label: "Restaurants",
    intro: "Lost Signal Brewing is a completed Springfield restaurant. Baron Design lists restaurants among its services on the about page.",
    firmSlugs: ["arkifex-studios", "baron-design-associates"],
  },
  {
    id: "houses",
    label: "House construction",
    intro: "A completed house in Nixa, and a house design beside the Sac River whose municipality is not stated on the page.",
    firmSlugs: ["arkifex-studios", "nform-architecture"],
  },
  {
    id: "boutique",
    label: "Boutique firms",
    intro: "Arkifex Studios describes itself as a boutique firm.",
    firmSlugs: ["arkifex-studios"],
  },
  {
    id: "engineering",
    label: "Architecture and engineering",
    intro: "Buxton Kubik Dodd Design Collective describes architecture, engineering, and interior design in one firm.",
    firmSlugs: ["bkd-design-collective"],
  },
  {
    id: "luxury",
    label: "Luxury apartments and hotels",
    intro: "The evidence here is an apartment community described as luxury, and a hotel described as luxury. It does not describe luxury houses.",
    firmSlugs: ["hdesigngroup", "brp-architects"],
  },
];

export function firmsForFacet(facet: PlaceFacet): PlaceFirm[] {
  const bySlug = new Map(SPRINGFIELD_FIRMS.map((firm) => [firm.slug, firm]));
  return facet.firmSlugs.map((slug) => bySlug.get(slug)).filter((firm): firm is PlaceFirm => Boolean(firm));
}
