import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Directory from "@/pages/Directory";

vi.mock("@/hooks/useHomeContent", async () => {
  const { HOME_DEFAULTS } = await import("@/lib/homeContent");
  return { useHomeContent: () => HOME_DEFAULTS };
});

const projects = [
  { id: "1", slug: "unite-d-habitation-berlin", name: "Unité d'Habitation Berlin", architect: "Le Corbusier", updated_at: "2026-01-01", city: { name: "Berlin", slug: "berlin" } },
  { id: "2", slug: "maeusebunker", name: "Mäusebunker", architect: "Gerd Hänska, Magdalena Hänska, with Kurt Schmersow", updated_at: "2026-02-01", city: { name: "Berlin", slug: "berlin" } },
];

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
        if (table === "projects") return result(projects);
        if (table === "posts") return result([{ id: "s", slug: "on-the-patience-of-stone", title: "On the Patience of Stone", excerpt: "Stone.", category: "Essay", hero_image_url: null, body: "word ".repeat(220) }]);
        return result([]);
      },
    },
  };
});

function renderAt(path: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/directory" element={<Directory />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

const CATEGORIES = ["Architects", "Interior Designers", "Product manufacturers", "Designers", "Tools", "Marketing Agency"];

describe("directory page", () => {
  it("filters from the search form and keeps the query in the page", async () => {
    renderAt("/directory");
    expect(await screen.findByRole("heading", { name: "Find the people and tools behind architecture." })).toBeInTheDocument();
    expect(screen.queryByText("Le Corbusier")).not.toBeInTheDocument();
    expect(screen.queryByText("Architect credits")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "All" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Browse by category" })).toHaveClass("sr-only");
    expect(screen.getByRole("heading", { name: "Where the research is" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Buildings by city" })).not.toBeInTheDocument();
    for (const name of CATEGORIES) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
    fireEvent.change(screen.getByLabelText("Search architect credits, buildings, or cities"), { target: { value: "Mäusebunker" } });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(screen.queryByText("Le Corbusier")).not.toBeInTheDocument();
    expect(screen.getByText("Gerd Hänska, Magdalena Hänska, with Kurt Schmersow")).toBeInTheDocument();
    expect(screen.getByLabelText("Search architect credits, buildings, or cities")).toHaveValue("Mäusebunker");
  });

  it("reads a category and query from the address and can clear the search", async () => {
    renderAt("/directory?category=architects&q=Corbusier");
    expect(await screen.findByText("Le Corbusier")).toBeInTheDocument();
    expect(screen.queryByText("Gerd Hänska, Magdalena Hänska, with Kurt Schmersow")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(await screen.findByText("Gerd Hänska, Magdalena Hänska, with Kurt Schmersow")).toBeInTheDocument();
  });

  it("shows an empty category without inventing listings", async () => {
    renderAt("/directory?category=tools");
    expect(await screen.findByRole("heading", { name: "Tools" })).toBeInTheDocument();
    expect(screen.getByText("No listings yet.")).toBeInTheDocument();
    expect(screen.queryByText("Le Corbusier")).not.toBeInTheDocument();
  });
});
