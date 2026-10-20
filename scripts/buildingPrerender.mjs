/**
 * Crawlable HTML for a building entry. The React page collapses the long
 * sections; this string keeps the full text for search and AI crawlers.
 */

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function isHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(value || "");
}

function paragraphs(value) {
  return String(value || "")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function prose(value) {
  if (!value || !String(value).trim()) return "";
  if (isHtml(value)) return String(value);
  return paragraphs(value).map((part) => `<p>${esc(part)}</p>`).join("");
}

function statText(field) {
  if (!field || typeof field !== "object" || Array.isArray(field)) return "";
  const value = field.value;
  if (value == null || value === "") return "";
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean).join("; ");
  return String(value).trim();
}

const STAT_LABELS = [
  ["architects", "Architects"],
  ["client", "Client"],
  ["original_use", "Original use"],
  ["current_use", "Current use"],
  ["construction_stop", "Construction"],
  ["completion", "Completion"],
  ["style", "Style"],
  ["heritage_status", "Heritage"],
  ["condition", "Condition"],
  ["address", "Address"],
];

function sheetCode(index) {
  return `A-${String(index + 1).padStart(2, "0")}`;
}

/** Crawlable plan set. The viewer animates these same titles and paragraphs. */
export function planSetHtml(projectName, graphics, sections) {
  const list = Array.isArray(graphics) ? graphics : [];
  const posters = list.filter((graphic) => graphic.kind === "poster" || graphic.downloadable);
  const poster = posters[0] || null;
  const drawings = list.filter((graphic) => !posters.includes(graphic));
  const order = (sections || []).map((section) => section.graphic_slug || section.graphicSlug).filter(Boolean);
  drawings.sort((a, b) => {
    const ai = a.slug ? order.indexOf(a.slug) : -1;
    const bi = b.slug ? order.indexOf(b.slug) : -1;
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  const sequence = poster ? [...drawings, poster] : drawings;
  if (!sequence.length) return "";
  const items = sequence.map((graphic, index) => {
    const code = sheetCode(index);
    const id = `sheet-a${String(index + 1).padStart(2, "0")}`;
    const section = graphic.slug ? (sections || []).find((item) => (item.graphic_slug || item.graphicSlug) === graphic.slug) : null;
    const posterSheet = graphic === poster;
    const title = posterSheet ? "Field guide" : section?.heading || graphic.caption || graphic.alt || "Drawing";
    const paragraphs = Array.isArray(section?.paragraphs) && section.paragraphs.length
      ? section.paragraphs
      : [graphic.caption || graphic.alt || ""].filter(Boolean);
    const why = !posterSheet && graphic.slug && section ? `#why-${graphic.slug}` : "";
    return `<li id="${id}"><h3>${esc(code)} ${esc(title)}</h3>${paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}${why ? `<a href="${esc(why)}">Read the full explanation</a>` : ""}${posterSheet ? `<p>Download the poster</p>` : ""}<p>${esc(projectName)}. Siana Architecture. NTS. Concept illustration.</p></li>`;
  });
  return `<h2>Plan set</h2><ol>${items.join("")}</ol>`;
}

export function buildingContentHtml(project, related = {}) {
  const images = related.images || [];
  const links = related.links || [];
  const graphics = related.graphics || [];
  const facts = Array.isArray(project.curious_facts) ? project.curious_facts.filter((fact) => typeof fact === "string" && fact.trim()) : [];
  const why = project.why_section && typeof project.why_section === "object" ? project.why_section : null;
  const sections = why && Array.isArray(why.sections) ? why.sections : Array.isArray(project.why_section) ? project.why_section : [];
  const stats = project.stats && typeof project.stats === "object" && !Array.isArray(project.stats) ? project.stats : {};
  const events = Array.isArray(stats.events) ? stats.events : [];

  const bits = [`<article>`, `<h1>${esc(project.name)}</h1>`];
  if (project.tagline) bits.push(`<p>${esc(project.tagline)}</p>`);
  const line = [project.architect, project.year_completed, project.city?.name].filter(Boolean).join(" · ");
  if (line) bits.push(`<p>${esc(line)}</p>`);
  if (project.tldr) bits.push(`<h2>In short</h2>${prose(project.tldr)}`);
  if (project.siana_pick) bits.push(`<h2>Siana Pick</h2><p>${esc(project.siana_pick)}</p>`);

  const statRows = STAT_LABELS
    .map(([key, label]) => {
      const text = statText(stats[key]);
      return text ? `<dt>${esc(label)}</dt><dd>${esc(text)}</dd>` : "";
    })
    .filter(Boolean);
  if (statRows.length) bits.push(`<h2>The building, measured</h2><dl>${statRows.join("")}</dl>`);
  if (events.length) {
    bits.push(`<h3>Dates</h3><ul>${events.map((event) => (event?.value ? `<li>${esc(event.value)}</li>` : "")).join("")}</ul>`);
  }

  if (facts.length) {
    bits.push(`<h2>Worth knowing</h2><ul>${facts.map((fact) => `<li>${esc(fact)}</li>`).join("")}</ul>`);
  }

  const plan = planSetHtml(project.name, graphics, sections);
  if (plan) bits.push(plan);

  if (sections.length) {
    bits.push(`<h2>Why it looks like this</h2>`);
    if (why?.intro) bits.push(`<p>${esc(why.intro)}</p>`);
    for (const section of sections) {
      if (section?.heading) bits.push(`<h3>${esc(section.heading)}</h3>`);
      const body = Array.isArray(section?.paragraphs) ? section.paragraphs.filter(Boolean) : [];
      for (const paragraph of body) bits.push(`<p>${esc(paragraph)}</p>`);
    }
  }

  if (project.description) bits.push(`<h2>Story</h2>${prose(project.description)}`);
  if (project.analysis) bits.push(`<h2>Analysis</h2>${prose(project.analysis)}`);

  const diagrams = graphics.filter((graphic) => graphic.kind !== "poster" && (graphic.alt || graphic.caption));
  if (diagrams.length) {
    bits.push(`<h2>Diagrams</h2><ul>${diagrams.map((graphic) => `<li>${esc(graphic.caption || graphic.alt)}</li>`).join("")}</ul>`);
  }
  const poster = graphics.find((graphic) => graphic.kind === "poster" || graphic.downloadable);
  if (poster) bits.push(`<h2>Poster</h2><p>${esc(poster.caption || poster.alt || "Download the poster")}</p>`);

  if (links.length) {
    bits.push(`<h2>Further reading</h2><ul>${links.map((link) => {
      const title = esc(link.title);
      return `<li>${link.url ? `<a href="${esc(link.url)}">${title}</a>` : title}</li>`;
    }).join("")}</ul>`);
  }

  if (images.length) {
    bits.push(`<h2>Photographs</h2><ul>${images.map((image) => {
      const credit = [image.author, image.license].filter(Boolean).join(", ");
      const label = esc(image.caption || image.alt || "Photograph");
      const source = image.source_url ? ` <a href="${esc(image.source_url)}">source</a>` : "";
      return `<li>${label}${credit ? `, ${esc(credit)}` : ""}${source}</li>`;
    }).join("")}</ul>`);
  }

  bits.push(`</article>`);
  return bits.join("");
}
