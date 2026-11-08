import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import handler from "../../api/not-found.js";

const root = resolve(process.cwd());

describe("published routes", () => {
  it("prerenders articles on /practice and keeps journal as a redirect", () => {
    const prerender = readFileSync(resolve(root, "scripts/prerender.mjs"), "utf8");
    const vercel = JSON.parse(readFileSync(resolve(root, "vercel.json"), "utf8"));
    expect(prerender).toContain("write(`/practice/${p.slug}`");
    expect(prerender).not.toContain('const base = p.kind === "resource"');
    expect(vercel.redirects).toEqual(expect.arrayContaining([
      { source: "/journal/:slug", destination: "/practice/:slug", permanent: true },
      { source: "/resources/:slug", destination: "/practice/:slug", permanent: true },
    ]));
    expect(vercel.rewrites.map((rule) => rule.destination)).toContain("/api/not-found");
    expect(vercel.rewrites.at(-1).destination).toBe("/index.html");
  });

  it("lists practice articles, not the old journal paths, in the sitemap generator", () => {
    const seo = readFileSync(resolve(root, "scripts/generate-seo.mjs"), "utf8");
    expect(seo).toContain("urlEntry(`/practice/${p.slug}`");
    expect(seo).not.toContain("urlEntry(`/journal/${p.slug}`");
    expect(seo).not.toContain("urlEntry(`/resources/${p.slug}`");
    const sitemap = readFileSync(resolve(root, "public/sitemap.xml"), "utf8");
    const prerender = readFileSync(resolve(root, "scripts/prerender.mjs"), "utf8");
    expect(sitemap).toContain("https://sianaarchitecture.com/practice/the-drawing-that-thinks-back");
    expect(sitemap).toContain("https://sianaarchitecture.com/cities/berlin");
    expect(sitemap).toContain("https://sianaarchitecture.com/d/architects/herzog-de-meuron");
    expect(sitemap).toContain("https://sianaarchitecture.com/d/architects/springfield-missouri");
    expect(prerender).toContain("write(`/d/architects/${slug}`");
    for (const slug of ["baron-design-associates", "arkifex-studios", "bkd-design-collective", "hood-rich", "hdesigngroup", "esterly-schneider", "nform-architecture", "paragon-architecture", "brp-architects"]) {
      expect(sitemap).toContain(`https://sianaarchitecture.com/d/architects/${slug}`);
      expect(prerender).toContain(`"${slug}"`);
    }
    expect(prerender).toContain('title: "Best architecture firms in Springfield, Missouri in 2026 - Siana Architecture"');
    expect(prerender).toContain("<h1>Best architecture firms in Springfield, Missouri</h1>");
    expect(prerender).toContain("ProfessionalService");
    expect(prerender).toContain("BreadcrumbList");
    expect(sitemap).not.toContain("https://sianaarchitecture.com/journal/");
    expect(sitemap).not.toContain("https://sianaarchitecture.com/resources/");
  });

  it("answers unknown static paths with HTTP 404", () => {
    const headers = new Map();
    const res: { statusCode: number; body: string; setHeader: (name: string, value: string) => void; end: (body: string) => void } = {
      statusCode: 200,
      body: "",
      setHeader(name, value) { headers.set(name, value); },
      end(body) { this.body = body; },
    };
    handler({}, res);
    expect(res.statusCode).toBe(404);
    expect(res.body).toContain("Page not found");
    expect(headers.get("Content-Type")).toContain("text/html");
  });
});
