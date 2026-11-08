import { describe, expect, it } from "vitest";
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

  it("counts reading time only from real copy", () => {
    expect(readMinutes("")).toBeNull();
    expect(readMinutes("word ".repeat(220))).toBe(1);
    expect(readMinutes("word ".repeat(440))).toBe(2);
  });
});