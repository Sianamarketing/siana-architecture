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
        attributionControl: true,
        interactive: false,
      });
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false, visualizePitch: false }), "top-right");
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
    <div className="home-paper">
      <WelcomeOverlay />
      <Helmet>
        <title>Siana Architecture</title>
        <meta name="description" content="Stories and reviews about architecture, the people who shape it, and the tools and ideas behind the places we live." />
        <link rel="canonical" href="https://sianaarchitecture.com/" />
      </Helmet>
      <Navbar />

      <div className="vogue-titles">
      <section className="border-b border-ink/10" style={{ paddingTop: 76 }}>
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-[minmax(0,42%)_minmax(0,56%)] lg:justify-between gap-8 lg:gap-6 lg:min-h-[calc(100vh-76px)]">
          <div className="flex flex-col">
            <h1 className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(2.8rem, 6.2vw, 4.4rem)", lineHeight: 1.02, letterSpacing: "-0.02em" }}>
              <span className="block">Explore the</span>
              <span className="block">world of</span>
              <span className="block text-accent-terra">architecture</span>
              <span className="block text-accent-terra">&amp; design</span>
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
                href="#home-map"
                aria-label="Map"
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

      <section id="home-map" className="home-map relative w-full overflow-hidden bg-[#e7e6e1]">
        {token ? (
          <div ref={mapContainer} className="absolute inset-0" />
        ) : (
          <p className="absolute bottom-6 left-0 right-0 text-center text-ink-soft font-mono uppercase pointer-events-none" style={{ fontSize: 12, letterSpacing: "0.14em" }}>
            Map preview unavailable
          </p>
        )}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.4) 52%, rgba(255,255,255,0) 100%)" }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-6">
          <div className="text-center max-w-[640px]">
            <h2 className="text-ink" style={{ fontWeight: 400, fontSize: "clamp(2.4rem, 4.4vw, 3.8rem)", lineHeight: 1.05 }}>
              Explore the map
            </h2>
            <p className="mt-4 font-body text-ink-soft text-[16px] leading-relaxed">
              Published buildings, pinned where they stand. Open the atlas to filter by city, material, experience, and style.
            </p>
            <Link
              to="/atlas"
              className="pointer-events-auto inline-flex items-center justify-center h-12 px-6 mt-8 bg-accent-terra text-white font-mono uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]"
              style={{ fontSize: 13, letterSpacing: "0.14em" }}
            >
              Open map
            </Link>
          </div>
        </div>
      </section>

      <div id="featured-buildings">
        <FeaturedBuildings />
      </div>

      <HomeDirectory />
      <HomeResearch />
      <Footer />
      </div>
    </div>
  );
};

export default Index;
