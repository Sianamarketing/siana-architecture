import { Link } from "react-router-dom";
import { DIRECTORY_CATEGORIES } from "@/lib/directory";

const PRIMARY = [
  { to: "/", label: "Home" },
  { to: "/atlas", label: "Map" },
  { to: "/cities", label: "Cities" },
  { to: "/about", label: "About" },
];

export default function Footer() {
  return (
    <footer className="bg-paper border-t border-ink/10" style={{ paddingTop: "3rem", paddingBottom: "2rem" }}>
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <Link to="/" className="font-logo text-ink" style={{ fontSize: "1.6rem" }}>siana</Link>

        <nav aria-label="Footer" className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {PRIMARY.slice(0, 3).map((item) => (
            <Link key={item.to} to={item.to} className="font-mono uppercase text-ink hover:text-accent-terra focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]" style={{ fontSize: 13, letterSpacing: "0.14em" }}>
              {item.label}
            </Link>
          ))}
          <div>
            <Link to="/directory" className="font-mono uppercase text-ink hover:text-accent-terra focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]" style={{ fontSize: 13, letterSpacing: "0.14em" }}>
              Directory
            </Link>
            <ul className="mt-3 space-y-2">
              {DIRECTORY_CATEGORIES.map((category) => (
                <li key={category.slug}>
                  <Link to={`/directory?category=${category.slug}`} className="font-body text-ink-soft text-[14px] hover:text-ink">
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link to="/about" className="font-mono uppercase text-ink hover:text-accent-terra focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]" style={{ fontSize: 13, letterSpacing: "0.14em" }}>
            About
          </Link>
        </nav>

        <div className="mt-10 pt-6 border-t border-ink/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-6">
            <Link to="/practice" className="font-mono uppercase text-warm-gray hover:text-ink" style={{ fontSize: 12, letterSpacing: "0.14em" }}>Research</Link>
            <Link to="/practice?category=reportage" className="font-mono uppercase text-warm-gray hover:text-ink" style={{ fontSize: 12, letterSpacing: "0.14em" }}>News</Link>
          </div>
          <p className="font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.12em" }}>
            © {new Date().getFullYear()} · Architecture, city by city
          </p>
        </div>
      </div>
    </footer>
  );
}
