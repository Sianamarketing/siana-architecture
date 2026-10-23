import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import PlanSet from "@/components/site/PlanSet";
import type { BuildingGraphic, WhyBlock } from "@/lib/buildingEntry";

const sections: WhyBlock[] = [
  { heading: "Twelve trusses", paragraphs: ["The casing hangs from twelve trusses."], graphicSlug: "twelve-trusses" },
];

function graphic(partial: Partial<BuildingGraphic> & Pick<BuildingGraphic, "id">): BuildingGraphic {
  return {
    slug: null,
    kind: "diagram",
    storagePath: null,
    svgPath: null,
    alt: null,
    caption: null,
    downloadable: false,
    downloadPath: null,
    downloadLabel: null,
    cardPath: null,
    ...partial,
  };
}

const graphics: BuildingGraphic[] = [
  graphic({
    id: "poster",
    slug: "poster",
    kind: "poster",
    storagePath: "/buildings/icc-berlin/poster/icc-berlin-poster.png",
    downloadable: true,
    downloadPath: "/buildings/icc-berlin/poster/icc-berlin-poster.pdf",
    downloadLabel: "icc-berlin-poster.pdf",
    alt: "ICC Berlin poster",
  }),
  graphic({
    id: "trusses",
    slug: "twelve-trusses",
    cardPath: "/buildings/icc-berlin/menu/twelve-trusses.png",
    storagePath: "/buildings/icc-berlin/diagrams/twelve-trusses.png",
    svgPath: "/buildings/icc-berlin/diagrams/twelve-trusses.svg",
    alt: "Twelve trusses over the hall",
  }),
];

describe("plan lightbox", () => {
  it("opens the sharp sheet, zooms, and leaves the explanation in the page", () => {
    render(<PlanSet projectName="ICC Berlin" graphics={graphics} sections={sections} overview={{ intro: "A congress hall beside the motorway.", facts: [] }} />);

    expect(screen.getByText("The casing hangs from twelve trusses.")).toBeInTheDocument();
    const enlarge = screen.getAllByRole("button", { name: "Enlarge sheet A-01, Overview" }).find((node) => node.hasAttribute("data-plan-enlarge"));
    expect(enlarge).toBeTruthy();
    fireEvent.click(enlarge!);

    const dialog = screen.getByRole("dialog");
    const view = within(dialog);
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveTextContent("A-01 Overview");
    const enlarged = view.getByRole("img", { name: "ICC Berlin poster" });
    expect(enlarged).toHaveAttribute("src", "/buildings/icc-berlin/poster/icc-berlin-poster.png");
    expect(view.getByRole("link", { name: "Download" })).toHaveAttribute("href", "/buildings/icc-berlin/poster/icc-berlin-poster.png");
    expect(view.getByRole("link", { name: /pdf poster/i })).toHaveAttribute("href", "/buildings/icc-berlin/poster/icc-berlin-poster.pdf");
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(view.getByRole("button", { name: "Zoom in" }));
    expect(view.getByText("1.3×")).toBeInTheDocument();
    fireEvent.click(view.getByRole("button", { name: "Reset zoom" }));
    expect(view.getByText("1×")).toBeInTheDocument();

    fireEvent.click(view.getByRole("button", { name: "Next sheet" }));
    expect(view.getByRole("img", { name: "Twelve trusses over the hall" })).toHaveAttribute("src", "/buildings/icc-berlin/diagrams/twelve-trusses.svg");
    expect(view.getByText("A-02 Twelve trusses")).toBeInTheDocument();
    expect(screen.getByText("The casing hangs from twelve trusses.")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(screen.getByText("The casing hangs from twelve trusses.")).toBeInTheDocument();
  });
});
