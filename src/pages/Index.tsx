import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/site/Navbar";
import WelcomeOverlay from "@/components/site/WelcomeOverlay";
import { getMapboxToken } from "@/lib/mapbox";
import FeaturedBuildings from "@/components/site/FeaturedBuildings";
import HomeDirectory from "@/components/site/HomeDirectory";
import HomeResearch from "@/components/site/HomeResearch";
import Footer from "@/components/site/Footer";

type Pin = { latitude: number | null; longitude: number | null };

const HERO_PHOTO = {
  src: "/buildings/unite-d-habitation-berlin/01-slab-on-the-lawn.jpg",
  alt: "The Unité d'Habitation in Berlin, a 17-storey slab of loggias on its lawn at Flatowallee, seen from the south-west.",
  building: "Unité d'Habitation Berlin",
  credit: "Gunnar Klack, CC BY-SA 4.0",
  href: "/projects/unite-d-habitation-berlin",
};

const MAP_NOTES = [
  "Filter by city, material, experience, and style.",
  "Pins mark published buildings. Select one to open its entry.",
  "A city or a building can live in the address, so a view can be shared.",
];

const serif = "'Adobe Garamond Pro', 'EB Garamond', Garamond, Georgia, serif";

const Index = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [token] = useState<string>(() => getMapboxToken());
  const [pins, setPins] = useState<Pin[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("projects")
        .select("latitude,longitude")
        .eq("status", "published");
      if (data) setPins(data as Pin[]);
    })();
  }, []);

  useEffect(() => {
    if (!token || !mapContainer.current || mapRef.current) return;
    mapboxgl.accessToken = token;
    let io: IntersectionObserver | null = null;
    try {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        projection: { name: "mercator" },
        center: [10, 25],
        zoom: 1.6,
        attributionControl: false,
        interactive: false,
      });
      mapRef.current = map;

      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      let visible = true;
      const SECONDS_PER_REV = 120;
      const spinGlobe = () => {
        if (!visible || reduceMotion) return;
        const c = map.getCenter();
        c.lng -= 360 / SECONDS_PER_REV;
        map.easeTo({ center: c, duration: 1000, easing: (n) => n });
      };
      map.on("moveend", spinGlobe);
      map.on("load", spinGlobe);

      io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (visible) spinGlobe();
        },
        { threshold: 0 },
      );
      io.observe(mapContainer.current);
    } catch (e) {
      console.error("Mapbox preview init failed", e);
    }
    return () => {
      io?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || pins.length === 0) return;
    const draw = () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      pins.filter((pin) => pin.latitude != null && pin.longitude != null).forEach((pin) => {
        const el = document.createElement("span");
        el.style.cssText = "display:block;width:9px;height:9px;border-radius:9999px;background:#bf3a18;border:2px solid #fff;box-shadow:0 0 0 2px #bf3a18;pointer-events:none;";
        markersRef.current.push(
          new mapboxgl.Marker({ element: el, anchor: "center" }).setLngLat([pin.longitude!, pin.latitude!]).addTo(map),
        );
      });
    };
    if (map.loaded()) draw();
    else map.once("load", draw);
  }, [pins]);

  return (
    <div className="bg-paper">
      <WelcomeOverlay />
      <Helmet>
        <title>Siana Architecture</title>
        <meta name="description" content="Stories and reviews about architecture, the people who shape it, and the tools and ideas behind the places we live." />
        <link rel="canonical" href="/" />
      </Helmet>
      <Navbar />

      <section className="bg-paper border-b border-ink/10" style={{ paddingTop: 76 }}>
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-[minmax(0,42%)_minmax(0,56%)] lg:justify-between gap-8 lg:gap-6 lg:min-h-[calc(100vh-76px)]">
          <div className="flex flex-col">
            <p className="font-mono uppercase text-ink flex items-center gap-2" style={{ fontSize: 12, letterSpacing: "0.16em" }}>
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-accent-terra" />
              An independent guide to the built world
            </p>
            <h1 className="mt-6 text-ink" style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(2.8rem, 6.8vw, 4.5rem)", lineHeight: 0.92, letterSpacing: "-0.02em" }}>
              <span className="block">Explore the</span>
              <span className="block">World of</span>
              <span className="block italic text-accent-terra">Architecture</span>
              <span className="block italic text-accent-terra">&amp; Design</span>
            </h1>
            <div className="mt-auto pt-12 md:pt-16 flex items-end justify-between gap-6">
              <div className="max-w-sm">
                <p className="font-body text-ink-soft text-[15px] md:text-[16px] leading-relaxed">
                  Stories and reviews about architecture, the people who shape it, and the tools and ideas behind the places we live.
                </p>
                <p className="mt-8 font-mono uppercase text-ink" style={{ fontSize: 12, letterSpacing: "0.16em" }}>
                  Places · Projects · People
                </p>
              </div>
              <a
                href="#featured-buildings"
                aria-label="Featured buildings"
                className="shrink-0 inline-flex h-12 w-12 items-center justify-center rounded-full border border-ink/30 text-ink hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 2v11M3.5 9.5 8 14l4.5-4.5" stroke="currentColor" strokeWidth="1" />
                </svg>
              </a>
            </div>
          </div>

          <figure>
            <Link to={HERO_PHOTO.href} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]">
              <img src={HERO_PHOTO.src} alt={HERO_PHOTO.alt} className="w-full h-auto object-cover bg-paper-mid max-h-[78vh]" />
            </Link>
            <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono uppercase text-warm-gray" style={{ fontSize: 11, letterSpacing: "0.12em" }}>
              <span>{HERO_PHOTO.building}</span>
              <span>{HERO_PHOTO.credit}</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <div id="featured-buildings">
        <FeaturedBuildings />
      </div>

      <section id="home-map" className="bg-paper py-16 md:py-24 border-t border-ink/10">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 md:mb-10">
            <div className="max-w-xl">
              <h2 className="text-ink" style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(2.4rem, 4.4vw, 3.8rem)", lineHeight: 0.98 }}>
                Explore the map
              </h2>
              <p className="mt-4 font-body text-ink-soft text-[16px] leading-relaxed">
                Published buildings, pinned where they stand. Open the atlas to filter the view and read an entry.
              </p>
            </div>
            <Link
              to="/atlas"
              className="inline-flex items-center justify-center h-12 px-6 bg-accent-terra text-white font-mono uppercase shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]"
              style={{ fontSize: 13, letterSpacing: "0.14em" }}
            >
              Open map
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,76%)_minmax(220px,21%)] lg:justify-between gap-8 lg:gap-10">
            <Link to="/atlas" aria-label="Open the map" className="relative block min-h-[420px] md:min-h-[560px] bg-paper-mid border border-ink/10 overflow-hidden">
              {token ? (
                <div ref={mapContainer} className="absolute inset-0" style={{ pointerEvents: "none" }} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-ink-soft font-mono uppercase px-6 text-center" style={{ fontSize: 13, letterSpacing: "0.14em" }}>
                  The atlas opens from this map
                </div>
              )}
            </Link>
            <aside>
              <p className="font-mono uppercase text-ink mb-4" style={{ fontSize: 12, letterSpacing: "0.16em" }}>
                A world of architecture
              </p>
              <ol>
                {MAP_NOTES.map((note, index) => (
                  <li key={note} className="border-t border-ink/15 py-4 grid grid-cols-[2.2rem_1fr] gap-2">
                    <span className="font-mono text-warm-gray" style={{ fontSize: 12 }}>{String(index + 1).padStart(2, "0")}</span>
                    <p className="font-body text-ink text-[15px] leading-relaxed">{note}</p>
                  </li>
                ))}
              </ol>
              <a href="#featured-buildings" className="inline-block mt-6 font-mono uppercase text-ink border-b border-ink pb-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]" style={{ fontSize: 12, letterSpacing: "0.14em" }}>
                Browse featured buildings
              </a>
            </aside>
          </div>
        </div>
      </section>

      <HomeDirectory />
      <HomeResearch />
      <Footer />
    </div>
  );
};

export default Index;
