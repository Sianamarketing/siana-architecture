import { Link } from "react-router-dom";
import UsStateMap from "@/components/site/UsStateMap";
import { SPRINGFIELD_PLACE } from "@/data/architectPlaces";

export default function ArchitectsPlaces() {
  return (
    <section id="places" className="mt-10" aria-labelledby="places-heading">
      <h2 id="places-heading" className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.05 }}>
        Places
      </h2>
      <p className="mt-3 max-w-2xl font-body text-ink-soft text-[16px] leading-relaxed">
        Guides for practices with an office in the city. Springfield, Missouri is the first.
      </p>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)] gap-4 lg:gap-6 items-start">
        <UsStateMap />
        <ul className="grid gap-3">
          <li>
            <Link
              to={SPRINGFIELD_PLACE.path}
              className="block border border-ink/15 bg-paper px-4 py-4 hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
            >
              <span className="block text-ink" style={{ fontSize: "1.35rem", lineHeight: 1.15 }}>Springfield, Missouri</span>
              <span className="mt-2 block font-body text-ink-soft text-[15px]">Nine practices with a Springfield office.</span>
            </Link>
          </li>
          <li className="border border-ink/10 px-4 py-4">
            <span className="block text-ink" style={{ fontSize: "1.35rem", lineHeight: 1.15 }}>Miami, Florida</span>
            <span className="mt-2 block font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.12em" }}>Later</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
