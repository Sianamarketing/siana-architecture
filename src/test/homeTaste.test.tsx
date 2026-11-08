import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import Index from "@/pages/Index";
import Directory from "@/pages/Directory";

vi.mock("mapbox-gl", () => ({
  default: {
    Map: class {
      on() {}
      once() {}
      addControl() {}
      remove() {}
      getCenter() { return { lng: 0 }; }
      easeTo() {}
      loaded() { return false; }
    },
    NavigationControl: class {},
    Marker: class {
      setLngLat() { return this; }
      addTo() { return this; }
      remove() {}
    },
  },
}));

vi.mock("@/hooks/useHomeContent", async () => {
  const { HOME_DEFAULTS } = await import("@/lib/homeContent");
  return { useHomeContent: () => HOME_DEFAULTS };
});

vi.mock("@/integrations/supabase/client", () => {
  const result = (data: unknown) => {
    const promise = Promise.resolve({ data, error: null });
    const chain = {
      select: () => chain,
      eq: () => chain,
      order: () => chain,
      limit: () => chain,
      then: promise.then.bind(promise),
    };
    return chain;
  };
  return {
    supabase: {
      from: (table: string) => {
        if (table === "projects") {
          return result([{
            id: "1",
            slug: "unite-d-habitation-berlin",
            name: "Unité d'Habitation Berlin",
            architect: "Le Corbusier",
            updated_at: "2026-01-01",
            featured: true,
            latitude: 52.5,
            longitude: 13.2,
            cover_image_url: null,
            hero_image_url: null,
            city: { name: "Berlin", slug: "berlin" },
          }]);
        }
        if (table === "posts") {
          return result([{
            id: "s",
            slug: "on-the-patience-of-stone",
            title: "On the Patience of Stone",
            excerpt: "Stone.",
            category: "Essay",
            hero_image_url: null,
            body: "word ".repeat(40),
          }]);
        }
        return result([]);
      },
    },
  };
});

function renderAt(path: string, page: ReactElement) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        {page}
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe("homepage taste preview", () => {
  it("keeps the homepage title and scopes the alternate heading face to the home page", () => {
    renderAt("/", <Index />);
    const home = document.querySelector(".home-taste");
    expect(home).toBeTruthy();
    const title = screen.getByRole("heading", { level: 1, name: /explore the world of architecture/i });
    expect(title.className).toContain("home-hero-title");
    expect(title.className).not.toMatch(/italic|text-accent/);
    expect(title.getAttribute("style") || "").not.toMatch(/Garamond|Bodoni/);
    expect(screen.getByRole("link", { name: "Open map" })).toHaveAttribute("href", "/atlas");
    expect(document.querySelector('a[href="#home-map"]')).toHaveAttribute("aria-label", "Map");
  });

  it("leaves the directory landing on the original heading face", () => {
    renderAt("/directory", <Directory />);
    expect(document.querySelector(".home-taste")).toBeNull();
    const title = screen.getByRole("heading", { level: 1 });
    expect(title).toHaveTextContent("Find the people and tools behind architecture.");
    expect(title.getAttribute("style") || "").toMatch(/EB Garamond/);
  });
});
