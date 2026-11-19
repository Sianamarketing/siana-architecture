import { describe, expect, it } from "vitest";
import { COMMERCIAL_GUIDE, INTERIOR_GUIDE, RESIDENTIAL_GUIDE, SPRINGFIELD_PLACE, commercialSourceLinks, documentTitle, hubSourceLinks, interiorSourceLinks, residentialSourceLinks } from "@/data/architectPlaces";
import { profileBySlug, profileForCredit, profileStructuredData } from "@/data/architectProfiles";
import { SPRINGFIELD_PROFILES } from "@/data/springfieldProfiles";
import { architectEntries, filterDirectoryEntries, readMinutes, usableDirectoryImage } from "@/lib/directory";

describe("directory", () => {
  it("groups architect credits without splitting a shared line", () => {
    const entries = architectEntries([
      { id: "1", slug: "unite-d-habitation-berlin", name: "Unité", architect: "Le Corbusier", updated_at: "2026-01-01", image: "/buildings/unite-d-habitation-berlin/01-slab-on-the-lawn.jpg", imageAlt: "The slab" },
      { id: "2", slug: "other", name: "Other", architect: "Le Corbusier", updated_at: "2026-06-01", image: "https://picsum.photos/seed/x/200" },
      { id: "3", slug: "maeusebunker", name: "Mäusebunker", architect: "Gerd Hänska, Magdalena Hänska, with Kurt Schmersow", image: "/buildings/maeusebunker/01-sloped-flank.jpg" },
    ]);
    expect(entries.map((entry) => entry.name)).toEqual([
      "Le Corbusier",
      "Gerd Hänska, Magdalena Hänska, with Kurt Schmersow",
    ]);
    expect(entries[0].buildings).toBe(2);
    expect(entries[0].meta).toBe("2 buildings");
    expect(entries[0].image).toBe("/buildings/unite-d-habitation-berlin/01-slab-on-the-lawn.jpg");
    expect(entries[0].href).toBe("/projects/unite-d-habitation-berlin");
  });

  it("drops placeholder and removed interior photographs", () => {
    expect(usableDirectoryImage("https://picsum.photos/seed/siana/200")).toBeNull();
    expect(usableDirectoryImage("/buildings/icc-berlin/08-saal-1.jpg")).toBeNull();
    expect(usableDirectoryImage("/buildings/icc-berlin/07-car-tunnel.jpg")).toBeNull();
    expect(usableDirectoryImage("/buildings/icc-berlin/01-from-funkturm.jpg")).toBe("/buildings/icc-berlin/01-from-funkturm.jpg");
  });

  it("searches credits, buildings and cities, and leaves other categories empty", () => {
    const entries = architectEntries([
      { id: "1", slug: "unite-d-habitation-berlin", name: "Unité d'Habitation Berlin", architect: "Le Corbusier", city: "Berlin" },
      { id: "2", slug: "maeusebunker", name: "Mäusebunker", architect: "Gerd Hänska, Magdalena Hänska, with Kurt Schmersow", city: "Berlin" },
    ]);
    expect(filterDirectoryEntries(entries, { query: "hänska" }).map((entry) => entry.name)).toEqual([
      "Gerd Hänska, Magdalena Hänska, with Kurt Schmersow",
    ]);
    expect(filterDirectoryEntries(entries, { query: "unité" })).toHaveLength(1);
    expect(filterDirectoryEntries(entries, { query: "berlin" })).toHaveLength(2);
    expect(filterDirectoryEntries(entries, { query: "" })).toHaveLength(2);
    expect(filterDirectoryEntries(entries, { category: "tools", query: "berlin" })).toEqual([]);
    expect(filterDirectoryEntries(entries, { category: "architects", query: "missing" })).toEqual([]);
    expect(filterDirectoryEntries(entries, { category: "architects", city: "Berlin" })).toHaveLength(2);
    expect(filterDirectoryEntries(entries, { category: "architects", city: "Lisbon" })).toEqual([]);
  });

  it("links only the exact Herzog & de Meuron credit to a profile", () => {
    expect(profileForCredit("Herzog & de Meuron")?.slug).toBe("herzog-de-meuron");
    expect(profileForCredit("Herzog & de Meuron with someone")).toBeNull();
    expect(profileForCredit("Amanda Levete (AL_A)")).toBeNull();
  });

  it("keeps nine Springfield profiles clear of the Herzog slug and of cleared photographs", () => {
    const slugs = ["herzog-de-meuron", ...SPRINGFIELD_PROFILES.map((profile) => profile.slug)];
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).not.toContain("springfield-missouri");
    expect(SPRINGFIELD_PROFILES).toHaveLength(9);
    expect(SPRINGFIELD_PROFILES[0].slug).toBe("baron-design-associates");
    const baron = profileBySlug("baron-design-associates");
    expect(baron?.mark?.permissionStatus).toBe("official-identifying-mark");
    expect(baron?.mark?.license).toBe("Official identifying mark");
    expect(baron?.projects.every((project) => project.image === null)).toBe(true);
    expect(baron?.registration[0].status).toBe("Missouri registered architect: Janet Rothberg White, no. 003658");
    expect(baron?.registration[1].status).toContain("2003003845");
    expect(baron?.registration[1].note).toContain("2003003845-D");
    expect(baron?.registration[2].status).toBe("Not verified");
    expect(baron?.registration[2].note.toLowerCase()).not.toContain("unlicensed");
    expect(profileBySlug("brp-architects")?.registration[0].status).toBe("Missouri registered architect: Christopher Michael Swan, no. 2007005985");
    expect(profileBySlug("nform-architecture")?.mark).toBeNull();
    const data = profileStructuredData(baron!);
    const encoded = JSON.stringify(data);
    expect(encoded).toContain("BreadcrumbList");
    expect(encoded).toContain("ProfessionalService");
    expect(encoded).not.toContain("2003003845");
    expect(encoded).not.toContain("aggregateRating");
  });

  it("keeps the Springfield heading and puts 2026 only in the document title", () => {
    expect(SPRINGFIELD_PLACE.title).toBe("Best architecture firms in Springfield, Missouri");
    expect(SPRINGFIELD_PLACE.edition).toBe("2026");
    expect(documentTitle(SPRINGFIELD_PLACE.title)).toBe(
      "Best architecture firms in Springfield, Missouri in 2026 - Siana Architecture",
    );
    expect(documentTitle(COMMERCIAL_GUIDE.title)).toBe("Best commercial architects in Springfield, Missouri in 2026 - Siana Architecture");
    expect(documentTitle(RESIDENTIAL_GUIDE.title)).toBe("Best residential architects in Springfield, Missouri in 2026 - Siana Architecture");
    expect(documentTitle(INTERIOR_GUIDE.title)).toBe("Best interior designers in Springfield, Missouri in 2026 - Siana Architecture");
    expect(COMMERCIAL_GUIDE.path).toBe("/d/architects/springfield-missouri/commercial");
    expect(RESIDENTIAL_GUIDE.path).toBe("/d/architects/springfield-missouri/residential");
    expect(INTERIOR_GUIDE.path).toBe("/d/interior-designers/springfield-missouri");
    expect(hubSourceLinks().some((link) => link.href.includes("anesbitt"))).toBe(false);
    expect(commercialSourceLinks().some((link) => link.href.includes("lostsignal"))).toBe(true);
    expect(commercialSourceLinks().some((link) => link.href.includes("finley"))).toBe(false);
    expect(commercialSourceLinks().some((link) => link.label === "St. Jude Mercy Clinic, external" || link.href.includes("st-jude"))).toBe(true);
    expect(residentialSourceLinks().map((link) => link.label)).toContain("N·FORM Architecture");
    expect(residentialSourceLinks().some((link) => link.href.includes("lostsignal"))).toBe(false);
    expect(interiorSourceLinks().some((link) => link.href === "https://anesbittdesigns.com/")).toBe(true);
    expect(interiorSourceLinks().some((link) => link.href.includes("mopro"))).toBe(false);
    expect(commercialSourceLinks().filter((link) => link.href.includes("lostsignal"))).toHaveLength(1);
  });

  it("counts reading time only from real copy", () => {
    expect(readMinutes("")).toBeNull();
    expect(readMinutes("word ".repeat(220))).toBe(1);
    expect(readMinutes("word ".repeat(440))).toBe(2);
  });
});