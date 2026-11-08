import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Navigate, Route, Routes, useSearchParams } from "react-router-dom";
import Directory from "@/pages/Directory";
import DirectoryCategory from "@/pages/DirectoryCategory";
import ArchitectProfile from "@/pages/ArchitectProfile";
import ArchitectPlace from "@/pages/ArchitectPlace";

function DirectoryLegacyRedirect() {
  const [params] = useSearchParams();
  const category = params.get("category");
  const known = ["architects", "interior-designers", "product-manufacturers", "designers", "tools", "marketing-agency"];
  const q = params.get("q");
  const search = q ? `?q=${encodeURIComponent(q)}` : "";
  const to = category && known.includes(category) ? `/d/${category}${search}` : `/d/${search}`;
  return <Navigate to={to} replace />;
}
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
          <Route path="/d" element={<Directory />} />
          <Route path="/d/" element={<Directory />} />
          <Route path="/d/architects/springfield-missouri" element={<ArchitectPlace />} />
          <Route path="/d/architects/:profileSlug" element={<ArchitectProfile />} />
          <Route path="/d/:slug" element={<DirectoryCategory />} />
          <Route path="/directory" element={<DirectoryLegacyRedirect />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

const CATEGORIES = ["Architects", "Interior Designers", "Product manufacturers", "Designers", "Tools", "Marketing Agency"];

describe("directory page", () => {
  it("filters from the search form and keeps the query in the page", async () => {
    renderAt("/d/");
    expect(await screen.findByRole("heading", { name: "Find the people and tools behind architecture." })).toBeInTheDocument();
    expect(screen.queryByText("Le Corbusier")).not.toBeInTheDocument();
    expect(screen.queryByText("Architect credits")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "All" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Previous" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Browse by category" })).toHaveClass("sr-only");
    expect(screen.getByRole("heading", { name: "Where the research is" })).toBeInTheDocument();
    for (const name of CATEGORIES) {
      const links = screen.getAllByRole("link", { name });
      expect(links.some((link) => link.getAttribute("href")?.startsWith("/d/"))).toBe(true);
    }
    expect(screen.getAllByRole("link", { name: "Architects" }).some((link) => link.getAttribute("href") === "/d/architects")).toBe(true);
    fireEvent.change(screen.getByLabelText("Search architect credits, buildings, or cities"), { target: { value: "Mäusebunker" } });
    fireEvent.submit(screen.getByRole("search"));
    expect(screen.queryByText("Le Corbusier")).not.toBeInTheDocument();
    expect(screen.getByText("Gerd Hänska, Magdalena Hänska, with Kurt Schmersow")).toBeInTheDocument();
    expect(screen.getByLabelText("Search architect credits, buildings, or cities")).toHaveValue("Mäusebunker");
  });

  it("reads a category and query from the address and can clear the search", async () => {
    renderAt("/d/architects?q=Corbusier");
    expect(await screen.findByRole("heading", { name: "Architects" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Directory" })).toHaveAttribute("href", "/d/");
    expect(await screen.findByText("Le Corbusier")).toBeInTheDocument();
    expect(screen.queryByText(/best for/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Score" })).not.toBeInTheDocument();
    expect(screen.queryByText("Gerd Hänska, Magdalena Hänska, with Kurt Schmersow")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(await screen.findByText("Gerd Hänska, Magdalena Hänska, with Kurt Schmersow")).toBeInTheDocument();
  });

  it("shows an empty category without inventing listings", async () => {
    renderAt("/d/tools");
    expect(await screen.findByRole("heading", { name: "Tools" })).toBeInTheDocument();
    expect(screen.getByText("No listings yet.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Credits on published buildings" })).not.toBeInTheDocument();
    expect(screen.queryByText("Le Corbusier")).not.toBeInTheDocument();
  });

  it("sends an old category address to the new page and keeps the query", async () => {
    renderAt("/directory?category=architects&q=Corbusier");
    expect(await screen.findByRole("heading", { name: "Architects" })).toBeInTheDocument();
    expect(await screen.findByText("Le Corbusier")).toBeInTheDocument();
  });

  it("opens the Herzog & de Meuron profile without a score or a price", async () => {
    renderAt("/d/architects/herzog-de-meuron");
    expect(await screen.findByRole("heading", { name: "Herzog & de Meuron" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Practice website, external" })).toHaveAttribute("href", "https://www.herzogdemeuron.com/");
    expect(screen.getByRole("link", { name: "CaixaForum Madrid" })).toHaveAttribute("href", "/projects/caixaforum-madrid");
    expect(screen.getByText("2006-2016")).toBeInTheDocument();
    expect(screen.getByText(/Ai Weiwei/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Services" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "H&dM wordmark" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Jacques Herzog in 2025/ })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Pierre de Meuron seated/ })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Portfolio/ }).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Ranked /)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /pricing/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/out of 10/i)).not.toBeInTheDocument();
    expect(screen.getAllByText("Not verified").length).toBeGreaterThan(0);
    expect(screen.queryByText(/Five licensed exteriors/)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sources" }).closest("details")).toBeInTheDocument();
  });

  it("lists Baron Design first among Springfield offices", async () => {
    const landing = renderAt("/d/architects");
    const placeLinks = await screen.findAllByRole("link", { name: /Springfield, Missouri/ });
    expect(placeLinks.some((link) => link.getAttribute("href") === "/d/architects/springfield-missouri")).toBe(true);
    expect(screen.queryByRole("link", { name: /Miami/ })).not.toBeInTheDocument();
    landing.unmount();
    renderAt("/d/architects/springfield-missouri");
    expect(await screen.findByRole("heading", { name: "Best architecture firms in Springfield, Missouri" })).toBeInTheDocument();
    const names = screen.getAllByRole("rowheader").map((cell) => cell.textContent);
    expect(names[0]).toBe("Baron Design & Associates, LLC");
    expect(names).toContain("Arkifex Studios");
    expect(names).toHaveLength(9);
    expect(screen.queryByRole("columnheader", { name: "Score" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Largest firms" })).not.toBeInTheDocument();
    expect(screen.getAllByText("3810 E. Sunshine St., Suite 101, Springfield, MO 65809").length).toBeGreaterThan(0);
  });

  it("treats an unknown category as not found", async () => {
    renderAt("/d/not-a-category");
    expect(await screen.findByRole("heading", { name: "404" })).toBeInTheDocument();
  });
});
