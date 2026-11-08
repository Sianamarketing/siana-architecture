#!/usr/bin/env node
/**
 * Build-time prerender (SSG-lite) for the Vite SPA.
 *
 * Runs after `vite build` (npm "postbuild"). For every public route it writes a
 * static dist/<route>/index.html that contains real, crawlable content BEFORE
 * any JavaScript runs:
 *   · a correct <title> + meta description + canonical + Open Graph/Twitter tags
 *   · JSON-LD structured data (Organization, BlogPosting, …) for AI/search
 *   · the actual heading + body text (the full article for journal posts)
 *
 * Why this and not Puppeteer: AI crawlers (GPTBot, PerplexityBot, …) and many
 * search bots don't execute JS, so a client-only SPA serves them an empty
 * <div id="root">. This injects the content from Supabase into static HTML. No
 * headless browser → can't hang or break the Vercel build. React still boots on
 * top for users (createRoot replaces the prerendered markup).
 *
 * Reads only the PUBLIC Supabase keys (RLS → published rows only). Non-fatal:
 * any failure leaves the normal SPA build untouched.
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { buildingContentHtml } from "./buildingPrerender.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = resolve(ROOT, "dist");
const SITE_URL = (process.env.SITE_URL || "https://sianaarchitecture.com").replace(/\/+$/, "");
const OG_DEFAULT = `${SITE_URL}/favicon.ico`;

function loadEnv() {
  const env = { ...process.env };
  const p = resolve(ROOT, ".env");
  if (existsSync(p)) {
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (m && env[m[1]] === undefined) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  return env;
}
const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const stripHtml = (s) => String(s ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const clamp = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

function researchCityList(projects, cities) {
  const counts = new Map();
  for (const project of projects) {
    const name = project.city?.name;
    if (!name || project.latitude == null || project.longitude == null) continue;
    counts.set(name, (counts.get(name) || 0) + 1);
  }
  const items = cities.filter((city) => counts.has(city.name));
  if (!items.length) return "<p>No published location is on file.</p>";
  return `<ul>` + items.map((city) => {
    const count = counts.get(city.name);
    return `<li><a href="/cities/${esc(city.slug)}">${esc(city.name)}</a>${city.country ? " - " + esc(city.country) : ""}, ${count} published ${count === 1 ? "building" : "buildings"}</li>`;
  }).join("") + `</ul>`;
}

async function fetchRows(query) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`${query} → ${res.status}`);
  return res.json();
}

/** Inject SEO head tags + content into a copy of the built index.html. */
function renderPage(template, { path, title, description, image, type = "website", jsonld, content, preloadImage }) {
  const canonical = SITE_URL + path;
  const desc = clamp(stripHtml(description || ""), 300);
  let html = template;

  const sub = (re, value) => { html = html.replace(re, () => value); };

  sub(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  sub(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}" />`);
  sub(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}" />`);
  sub(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(desc)}" />`);
  sub(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${esc(type)}" />`);

  const head = [
    `<link rel="canonical" href="${esc(canonical)}" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    `<meta property="og:site_name" content="Siana Architecture" />`,
    image ? `<meta property="og:image" content="${esc(image)}" />` : "",
    image ? `<meta name="twitter:image" content="${esc(image)}" />` : "",
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(desc)}" />`,
    jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : "",
    // Starts the cover photo downloading from the very first byte of HTML,
    // in parallel with the JS bundle — instead of after the bundle boots and
    // then queries Supabase for which photo to show.
    preloadImage
      ? `<link rel="preload" as="image" fetchpriority="high" href="${esc(preloadImage)}" />`
      : "",
  ].filter(Boolean).join("\n    ");
  sub(/<\/head>/, `    ${head}\n  </head>`);

  // Crawlable content inside #root; React (createRoot) replaces it on mount.
  if (content) {
    const block = `<div id="root"><div id="prerender">${content}</div></div>`;
    if (html.includes('<div id="root"></div>')) html = html.replace('<div id="root"></div>', () => block);
    else html = html.replace(/<div id="root">\s*<\/div>/, () => block);
  }
  return html;
}

const ORG = {
  "@type": "Organization",
  name: "Siana Architecture",
  url: SITE_URL,
  description: "An editorial atlas of architecture - significant buildings mapped city by city.",
};

function write(path, html) {
  const dir = path === "/" ? DIST : join(DIST, path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html, "utf8");
}

async function main() {
  if (!existsSync(join(DIST, "index.html"))) {
    console.warn("[prerender] dist/index.html not found - run after `vite build`. Skipping.");
    return;
  }
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("[prerender] Missing Supabase env - leaving SPA build as-is.");
    return;
  }
  const template = readFileSync(join(DIST, "index.html"), "utf8");
  const byNewest = (a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? "");

  const [cities, projects, posts, , projectImages, projectLinks, projectGraphics] = await Promise.all([
    fetchRows("cities?status=eq.published&select=slug,name,country,tagline,hero_image_url&order=name"),
    fetchRows("projects?status=eq.published&select=id,slug,name,tagline,architect,year_completed,featured,category,style,description,analysis,tldr,siana_pick,curious_facts,why_section,stats,condition,heritage_status,year_listed,meta_title,meta_description,og_image_url,hero_image_url,cover_image_url,address,latitude,longitude,city:cities(name)&order=name"),
    fetchRows("posts?status=eq.published&select=slug,kind,title,excerpt,body,author,category,hero_image_url,published_at&order=published_at.desc"),
    fetchRows("site_pages?key=eq.home&select=content").catch(() => []),
    fetchRows("project_images?select=project_id,alt,caption,author,license,source_url,position&order=position").catch(() => []),
    fetchRows("project_links?select=project_id,category,title,url,position&order=position").catch(() => []),
    fetchRows("project_graphics?select=project_id,slug,kind,alt,caption,downloadable,position&order=position").catch(() => []),
  ]);
  // The home cover: whichever image the editor put first in /admin/home.
  const heroPreload = "/buildings/unite-d-habitation-berlin/01-slab-on-the-lawn.jpg";
  const journal = posts.filter((p) => p.kind === "journal");
  const resources = posts.filter((p) => p.kind === "resource");
  let n = 0;

  // --- Home ---
  // This block is what a crawler that does not run JavaScript sees, and it is
  // the only version of the page an audit tool reads. Kept deliberately rich:
  // it mirrors, in plain text, the sections the mounted app actually renders
  // (atlas, cities, buildings, journal, resources, about) so the description
  // is faithful rather than padding. No <img> here on purpose - the block is
  // clipped out of view, so images would download for nobody; the real page
  // carries them once React mounts.
  const li = (href, label, tail) =>
    `<li><a href="${esc(href)}">${esc(label)}</a>${tail ? " - " + esc(clamp(stripHtml(tail), 150)) : ""}</li>`;
  const architects = new Map();
  for (const project of projects) {
    const name = String(project.architect || "").trim();
    if (!name || architects.has(name)) continue;
    architects.set(name, project.slug);
  }

  write("/", renderPage(template, {
    path: "/",
    preloadImage: heroPreload,
    title: "Siana Architecture",
    description: "Stories and reviews about architecture, the people who shape it, and the tools and ideas behind the places we live.",
    image: OG_DEFAULT,
    jsonld: { "@context": "https://schema.org", "@graph": [ORG, { "@type": "WebSite", name: "Siana Architecture", url: SITE_URL }] },
    content:
      `<h1>Explore the world of architecture and design</h1>` +
      `<p>Stories and reviews about architecture, the people who shape it, and the tools and ideas behind the places we live.</p>` +
      `<p><a href="/projects/unite-d-habitation-berlin">Unité d'Habitation Berlin</a>. Gunnar Klack, CC BY-SA 4.0.</p>` +

      `<h2>Explore the map</h2>` +
      `<p>Published buildings, pinned where they stand. <a href="/atlas">Open the map</a> to filter by city, material, experience, and style.</p>` +

      `<h2>Featured buildings</h2>` +
      `<p>Each entry carries the architect, the year of completion, the materials and the context that makes the building worth the detour.</p>` +
      (projects.filter((project) => project.featured).length
        ? `<ul>` + projects.filter((project) => project.featured).slice(0, 12).map((p) => li(
            `/projects/${p.slug}`,
            p.name,
            [p.architect, p.year_completed, p.city?.name, p.tagline].filter(Boolean).join(", "),
          )).join("") + `</ul>`
        : "") +

      `<h2>The directory</h2>` +
      `<p>Find architects credited on published buildings. Interior designers, product manufacturers, designers, tools, and marketing agencies will be listed when there are records to show.</p>` +
      (architects.size
        ? `<ul>` + [...architects.entries()].slice(0, 24).map(([name, slug]) => li(`/projects/${slug}`, name, "Architect")).join("") + `</ul>`
        : `<p>Nothing listed here yet.</p>`) +
      `<p><a href="/d/">Browse the directory</a></p>` +

      `<h2>News and research</h2>` +
      `<p>Essays, criticism, interviews and reportage.</p>` +
      (posts.length
        ? `<ul>` + posts.slice(0, 8).map((p) => li(`/practice/${p.slug}`, p.title, p.category || p.excerpt)).join("") + `</ul>`
        : `<p>Stories will appear here as they are published.</p>`) +
      `<p><a href="/practice">View all stories</a></p>` +

      `<h2>Cities we cover</h2>` +
      `<p>City guides pair an essay on the place with the buildings worth walking to. We currently cover ${cities.length} ${cities.length === 1 ? "city" : "cities"}.</p>` +
      (cities.length
        ? `<ul>` + cities.map((c) => li(`/cities/${c.slug}`, c.name, [c.country, c.tagline].filter(Boolean).join(", "))).join("") + `</ul>`
        : "") +
      `<p><a href="/cities">Browse every city guide</a></p>` +

      `<h2>About Siana Architecture</h2>` +
      `<p>We believe the most interesting building in any city is rarely the most famous one, and that the best way to understand a place is to walk it slowly, with someone pointing. No ads, no clutter, no infinite scroll. <a href="/about">More about what we do</a>.</p>`,
  })); n++;

  const directoryCategories = [
    ["architects", "Architects"],
    ["interior-designers", "Interior Designers"],
    ["product-manufacturers", "Product manufacturers"],
    ["designers", "Designers"],
    ["tools", "Tools"],
    ["marketing-agency", "Marketing Agency"],
  ];
  write("/d", renderPage(template, {
    path: "/d/",
    title: "Directory - Siana Architecture",
    description: "Architects credited on published buildings.",
    image: OG_DEFAULT,
    content:
      `<h1>Find the people and tools behind architecture.</h1>` +
      `<p>Architect credits are taken from published buildings. A credit can name more than one person, and it stays as one line. These are not verified business profiles. Search the directory, or choose a category.</p>` +
      `<h2>Browse by category</h2><ul>` +
      directoryCategories.map(([slug, label]) => `<li><a href="/d/${slug}">${label}</a></li>`).join("") +
      `</ul>` +
      `<p>Interior designers, product manufacturers, designers, tools, and marketing agencies: no listings yet.</p>` +
      `<h2>Where the research is</h2>` +
      `<p>Published buildings with a recorded location.</p>` +
      researchCityList(projects, cities) +
      (posts.length
        ? `<h2>Latest research</h2><ul>` + posts.slice(0, 4).map((p) => li(`/practice/${p.slug}`, p.title, p.category || p.excerpt)).join("") + `</ul>`
        : ""),
  })); n++;
  for (const [slug, label] of directoryCategories) {
    const architects = slug === "architects";
    write(`/d/${slug}`, renderPage(template, {
      path: `/d/${slug}`,
      title: `${label} - Directory - Siana Architecture`,
      description: architects
        ? "Springfield, Missouri, with senior housing, hotels, clinics, and a brewery restaurant among the local work."
        : `${label} has no listings yet.`,
      image: OG_DEFAULT,
      content:
        `<nav>Directory / ${label}</nav>` +
        `<h1>${label}</h1>` +
        (architects
          ? `<p>Springfield, Missouri, with senior housing, hotels, clinics, and a brewery restaurant among the local work.</p><p><a href="/d/architects/springfield-missouri">Best architecture firms in Springfield, Missouri</a></p><p><a href="/d/">Back to Directory</a></p>`
          : `<p>No listings yet.</p><p><a href="/d/">Back to Directory</a></p>`),
    }));
    n++;
  }
  write("/d/architects/springfield-missouri", renderPage(template, {
    path: "/d/architects/springfield-missouri",
    title: "Best architecture firms in Springfield, Missouri in 2026 - Siana Architecture",
    description: "Springfield offices have completed senior housing, hotels, a cardiology clinic, and a brewery restaurant in the city.",
    image: OG_DEFAULT,
    jsonld: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Best architecture firms in Springfield, Missouri",
      itemListOrder: "https://schema.org/ItemListUnordered",
      numberOfItems: 9,
    },
    content:
      `<nav><a href="/d/">Directory</a> / <a href="/d/architects">Architects</a> / Springfield, Missouri</nav>` +
      `<h1>Best architecture firms in Springfield, Missouri</h1>` +
      `<p>Springfield offices have completed senior housing, hotels, a cardiology clinic, and a brewery restaurant in the city. Baron Design &amp; Associates finished The Preston, a senior residence, along with the Hilton Garden Inn and Towneplace Suites.</p>` +
      `<ul>` +
      ["Baron Design & Associates, LLC", "Arkifex Studios", "Buxton Kubik Dodd Design Collective", "Hood-Rich Architecture", "hdesigngroup", "Esterly, Schneider & Associates", "N·FORM Architecture", "Paragon Architecture", "BRP Architects"]
        .map((name, index) => `<li><a href="/d/architects/${["baron-design-associates","arkifex-studios","bkd-design-collective","hood-rich","hdesigngroup","esterly-schneider","nform-architecture","paragon-architecture","brp-architects"][index]}">${esc(name)}</a></li>`).join("") +
      `</ul>`,
  }));
  n++;
  const springfieldProfiles = [
    ["baron-design-associates", "Baron Design & Associates, LLC", "Springfield practice for senior housing, clinics, hotels, and offices, with architecture and interior design named on the project pages.", "3810 E. Sunshine St., Suite 101", "65809", "Missouri registered architect: Janet Rothberg White, no. 003658. Firm certificate of authority: Missouri Architectural Corporation no. 2003003845. Rita Baron, principal: Not verified."],
    ["arkifex-studios", "Arkifex Studios", "Springfield studio for houses and commercial work, including a completed house in Nixa and a brewery restaurant in a former radio station.", "301 W Walnut St", "65806", "Missouri registered architect: Tyler D. Hellweg, no. 2015000181. Firm certificate of authority: Not verified."],
    ["bkd-design-collective", "Buxton Kubik Dodd Design Collective", "Springfield practice combining architecture, engineering, and interior design, with a local clinic and hospitality work in the portfolio.", "3100 S National Ave. Suite 300", "65807", "Missouri registered architect: Jonathan Blake Dodd, no. 2004006188. Firm certificate of authority: Not verified."],
    ["hood-rich", "Hood-Rich Architecture", "Springfield practice with healthcare renovations and hotel public-space work, including Centerstone Building A in Springfield.", "1722 S Luster Ave", "65804", "Missouri registered architect: Larry Keith Parke, no. 007546. Firm certificate of authority: Not verified."],
    ["hdesigngroup", "hdesigngroup", "Springfield practice with a completed apartment community and a completed hotel in the city.", "5039 S National Ave", "65810", "Missouri registered architect: Robert Christopher Haik, no. 007461. Firm certificate of authority: Not verified."],
    ["esterly-schneider", "Esterly, Schneider & Associates", "Springfield commercial practice founded in 1947, with nationwide O'Reilly work and a brewery credit in Battlefield.", "1736 East Sunshine, Suite 417", "65804", "Missouri registered architect: Timothy M. Guillot, no. 2016008137. Firm certificate of authority: Not verified."],
    ["nform-architecture", "N·FORM Architecture", "Springfield studio on C-Street, with a house project beside the Sac River whose municipality is not stated.", "312 W Commercial St", "65803", "Missouri registered architect: Jennifer Lynn Wilson, no. 2001029971. Firm certificate of authority: Not verified."],
    ["paragon-architecture", "Paragon Architecture", "Multi-office practice with a Springfield studio, and a local remodel of retail space into the Care to Learn offices.", "637 W College St", "65806", "Missouri registered architect: Brad E. Erwin, no. 2006012472. Firm certificate of authority: Not verified."],
    ["brp-architects", "BRP Architects", "Springfield architecture, design, and planning practice. A 2025 article credits the firm with the design of Caesars Republic Scottsdale.", "138 Park Central Square Suite #101", "65806", "Missouri registered architect: Christopher Michael Swan, no. 2007005985. Firm certificate of authority: Not verified."],
  ];
  for (const [slug, name, description, street, postal, registration] of springfieldProfiles) {
    const url = `${SITE_URL}/d/architects/${slug}`;
    write(`/d/architects/${slug}`, renderPage(template, {
      path: `/d/architects/${slug}`,
      title: `${name} - Directory - Siana Architecture`,
      description,
      image: OG_DEFAULT,
      jsonld: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Directory", item: `${SITE_URL}/d/` },
              { "@type": "ListItem", position: 2, name: "Architects", item: `${SITE_URL}/d/architects` },
              { "@type": "ListItem", position: 3, name: "Springfield, Missouri", item: `${SITE_URL}/d/architects/springfield-missouri` },
              { "@type": "ListItem", position: 4, name, item: url },
            ],
          },
          {
            "@type": "ProfessionalService",
            name,
            url,
            address: {
              "@type": "PostalAddress",
              streetAddress: street,
              addressLocality: "Springfield",
              addressRegion: "MO",
              postalCode: postal,
              addressCountry: "US",
            },
          },
        ],
      },
      content:
        `<nav><a href="/d/">Directory</a> / <a href="/d/architects">Architects</a> / <a href="/d/architects/springfield-missouri">Springfield, Missouri</a> / ${esc(name)}</nav>` +
        `<h1>${esc(name)}</h1><p>${esc(description)}</p>` +
        `<p>${esc(registration)}</p><p>Checked 8 November 2026 in the Active Licensee Only search. <a href="https://mopro.mo.gov/license/s/license-search">Missouri licensee search</a>.</p>`,
    }));
    n++;
  }
  write("/d/architects/herzog-de-meuron", renderPage(template, {
    path: "/d/architects/herzog-de-meuron",
    title: "Herzog & de Meuron - Directory - Siana Architecture",
    description: "Herzog & de Meuron is an international practice founded in Basel in 1978. This profile uses the practice's own pages and the 2001 Pritzker Prize record.",
    image: OG_DEFAULT,
    content:
      `<nav><a href="/d/">Directory</a> / <a href="/d/architects">Architects</a> / Herzog &amp; de Meuron</nav>` +
      `<h1>Herzog &amp; de Meuron</h1>` +
      `<p>International practice founded in Basel in 1978 by Jacques Herzog and Pierre de Meuron, owned by its active partners. <a href="https://www.herzogdemeuron.com/practice/">Practice page</a>.</p>` +
      `<p>Ten selected projects are dated from the practice’s project pages, including <a href="/projects/caixaforum-madrid">CaixaForum Madrid</a>. The Siana credit line “Herzog &amp; de Meuron” is not split.</p>` +
      `<p>Checked 8 November 2026. Swiss and UK registration: not verified. The practice states it is not licensed in Florida. The H&amp;dM wordmark is the Commons PD-textlogo file. Portraits of the founders use Commons licences.</p>`,
  }));
  n++;

  // --- Listing: Cities ---
  write("/cities", renderPage(template, {
    path: "/cities",
    title: "Cities - Siana Architecture",
    description: "Browse Siana's architecture guides city by city: " + cities.map((c) => c.name).join(", ") + ".",
    image: OG_DEFAULT,
    content:
      `<h1>Cities</h1><ul>` +
      cities.map((c) => `<li><a href="/cities/${esc(c.slug)}">${esc(c.name)}</a>${c.country ? " - " + esc(c.country) : ""}${c.tagline ? ": " + esc(c.tagline) : ""}</li>`).join("") +
      `</ul>`,
  })); n++;

  // Practice is the public article route. /journal and /resources redirect there.
  write("/practice", renderPage(template, {
    path: "/practice",
    title: "Practice - Siana Architecture",
    description: "Essays, criticism, interviews and practical notes on architecture from Siana.",
    image: OG_DEFAULT,
    content:
      `<h1>Practice</h1><ul>` +
      posts.map((p) => `<li><a href="/practice/${esc(p.slug)}">${esc(p.title)}</a>${p.excerpt ? " - " + esc(p.excerpt) : ""}</li>`).join("") +
      `</ul>`,
  })); n++;

  // --- About ---
  write("/about", renderPage(template, {
    path: "/about",
    title: "About - Siana Architecture",
    description: "Siana is an architectural magazine that lives on a map - curated projects explored through an editorial lens.",
    image: OG_DEFAULT,
    content:
      `<h1>The city as architecture.</h1>` +
      `<p>Siana is an architectural magazine that lives on a map. We curate projects across cities, write about them with the care of an editor and the eye of an architect, and put them on a map you can actually use.</p>`,
  })); n++;

  // --- Atlas (the discovery tool) ---
  write("/atlas", renderPage(template, {
    path: "/atlas",
    title: "Atlas - Explore Architecture on the Map | Siana Architecture",
    description: "An interactive atlas of significant architecture across the world's cities. Filter by city, architect, style and year, and explore each project on the map.",
    image: OG_DEFAULT,
    content:
      `<h1>The Atlas</h1>` +
      `<p>An interactive map of significant architecture across the world's cities - filter by city, architect, style and year, and explore each project on the map.</p>` +
      `<p><a href="/cities">Browse cities</a> · <a href="/journal">Journal</a></p>`,
  })); n++;

  // --- City detail ---
  for (const c of cities) {
    write(`/cities/${c.slug}`, renderPage(template, {
      path: `/cities/${c.slug}`,
      title: `${c.name} - Architecture Guide | Siana Architecture`,
      description: `Architecture guide to ${c.name}${c.country ? ", " + c.country : ""}.${c.tagline ? " " + c.tagline : ""}`,
      image: c.hero_image_url || OG_DEFAULT,
      jsonld: { "@context": "https://schema.org", "@type": "Place", name: c.name, address: c.country || undefined, url: `${SITE_URL}/cities/${c.slug}` },
      content: `<h1>${esc(c.name)}</h1>${c.country ? `<p>${esc(c.country)}</p>` : ""}${c.tagline ? `<p>${esc(c.tagline)}</p>` : ""}`,
    })); n++;
  }

  // --- Project detail ---
  const byProject = (rows) => {
    const map = new Map();
    for (const row of rows || []) {
      const list = map.get(row.project_id) || [];
      list.push(row);
      map.set(row.project_id, list);
    }
    return map;
  };
  const imagesByProject = byProject(projectImages);
  const linksByProject = byProject(projectLinks);
  const graphicsByProject = byProject(projectGraphics);

  for (const p of projects) {
    const facts = [p.architect, p.year_completed && p.year_completed > 1000 ? p.year_completed : null, p.city?.name].filter(Boolean).join(" · ");
    const description = p.meta_description || p.tldr || p.tagline || `${p.name}${facts ? " - " + facts : ""}.`;
    write(`/projects/${p.slug}`, renderPage(template, {
      path: `/projects/${p.slug}`,
      title: p.meta_title || `${p.name}${p.architect ? " by " + p.architect : ""} | Siana Architecture`,
      description,
      image: p.og_image_url || p.cover_image_url || p.hero_image_url || OG_DEFAULT,
      type: "article",
      preloadImage: p.hero_image_url || p.cover_image_url || null,
      jsonld: {
        "@context": "https://schema.org", "@type": "Article",
        headline: p.name,
        description: stripHtml(description),
        image: p.og_image_url || p.cover_image_url || p.hero_image_url || undefined,
        about: facts || undefined, publisher: ORG, mainEntityOfPage: `${SITE_URL}/projects/${p.slug}`,
      },
      content: buildingContentHtml(p, {
        images: imagesByProject.get(p.id) || [],
        links: linksByProject.get(p.id) || [],
        graphics: graphicsByProject.get(p.id) || [],
      }),
    })); n++;
  }

  // Every published post, journal or resource, lives at /practice/:slug.
  for (const p of posts) {
    write(`/practice/${p.slug}`, renderPage(template, {
      path: `/practice/${p.slug}`,
      title: `${p.title} | Siana Architecture`,
      description: p.excerpt || stripHtml(p.body).slice(0, 200),
      image: p.hero_image_url || OG_DEFAULT,
      type: "article",
      jsonld: {
        "@context": "https://schema.org", "@type": "BlogPosting",
        headline: p.title, description: p.excerpt || undefined, image: p.hero_image_url || undefined,
        datePublished: p.published_at || undefined,
        author: p.author ? { "@type": "Person", name: p.author } : ORG,
        publisher: ORG, mainEntityOfPage: `${SITE_URL}/practice/${p.slug}`,
        articleSection: p.category || undefined,
      },
      content:
        `<article><h1>${esc(p.title)}</h1>${p.category ? `<p>${esc(p.category)}</p>` : ""}` +
        `${p.excerpt ? `<p>${esc(p.excerpt)}</p>` : ""}${p.body ? `<div>${p.body}</div>` : ""}` +
        `<p>${p.author ? esc(p.author) + " · " : ""}${p.published_at ? esc(new Date(p.published_at).toISOString().slice(0, 10)) : ""}</p></article>`,
    })); n++;
  }

  console.log(`[prerender] Wrote ${n} static pages (${cities.length} cities, ${projects.length} projects, ${journal.length} journal, ${resources.length} resources).`);
}

main().catch((err) => {
  console.error("[prerender] Skipped (build is fine, SPA fallback in place):", err.message);
});
