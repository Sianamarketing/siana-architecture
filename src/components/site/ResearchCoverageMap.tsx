import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import { getMapboxToken } from "@/lib/mapbox";

export interface CoveragePin {
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  city: string | null;
  citySlug: string | null;
  country: string | null;
}

export default function ResearchCoverageMap({ pins }: { pins: CoveragePin[] }) {
  const token = getMapboxToken();
  const [country, setCountry] = useState("All");
  const [city, setCity] = useState("All");
  const countries = useMemo(
    () => [...new Set(pins.map((pin) => pin.country).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b)),
    [pins],
  );
  const cities = useMemo(() => {
    const names = pins
      .filter((pin) => pin.city && (country === "All" || pin.country === country))
      .map((pin) => pin.city as string);
    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }, [pins, country]);
  const visible = useMemo(
    () => pins.filter((pin) => (country === "All" || pin.country === country) && (city === "All" || pin.city === city)),
    [pins, country, city],
  );
  const cards = useMemo(() => {
    const groups = new Map<string, { name: string; slug: string; country: string | null; count: number }>();
    visible.forEach((pin) => {
      if (!pin.city || !pin.citySlug) return;
      const current = groups.get(pin.citySlug) || { name: pin.city, slug: pin.citySlug, country: pin.country, count: 0 };
      current.count += 1;
      groups.set(pin.citySlug, current);
    });
    return [...groups.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [visible]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <label className="font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.12em" }}>
          Country
          <select
            value={country}
            onChange={(event) => {
              setCountry(event.target.value);
              setCity("All");
            }}
            className="mt-1 block h-11 min-w-[180px] border border-ink/20 bg-paper px-3 font-body text-ink normal-case tracking-normal"
            style={{ fontSize: 16, letterSpacing: 0 }}
          >
            <option>All</option>
            {countries.map((name) => <option key={name}>{name}</option>)}
          </select>
        </label>
        <label className="font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.12em" }}>
          City
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="mt-1 block h-11 min-w-[180px] border border-ink/20 bg-paper px-3 font-body text-ink normal-case tracking-normal"
            style={{ fontSize: 16, letterSpacing: 0 }}
          >
            <option>All</option>
            {cities.map((name) => <option key={name}>{name}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.8fr)] gap-4 items-start">
        <CoverageCanvas token={token} pins={visible} />
        <ul className="space-y-3">
          {cards.length === 0 ? (
            <li className="font-body text-ink-soft text-[15px]">No published city is linked to these buildings.</li>
          ) : cards.map((card) => (
            <li key={card.slug}>
              <Link
                to={`/cities/${card.slug}`}
                className="block border border-ink/15 bg-paper px-4 py-4 hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
              >
                <span className="block text-ink" style={{ fontSize: "1.35rem", lineHeight: 1.15 }}>{card.name}</span>
                <span className="mt-1 block font-body text-ink-soft text-[14px]">
                  {[card.country, `${card.count} published ${card.count === 1 ? "building" : "buildings"}`].filter(Boolean).join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CoverageCanvas({ token, pins }: { token: string; pins: CoveragePin[] }) {
  const container = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!token || !container.current || mapRef.current) return;
    mapboxgl.accessToken = token;
    try {
      const map = new mapboxgl.Map({
        container: container.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [10, 30],
        zoom: 1.2,
        attributionControl: true,
        interactive: true,
        scrollZoom: false,
      });
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false, visualizePitch: false }), "top-right");
      mapRef.current = map;
    } catch (error) {
      console.error("Coverage map init failed", error);
    }
    return () => {
      markers.current.forEach((marker) => marker.remove());
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const draw = () => {
      markers.current.forEach((marker) => marker.remove());
      markers.current = pins.map((pin) => {
        const el = document.createElement("span");
        el.style.cssText = "display:block;width:9px;height:9px;border-radius:9999px;background:#bf3a18;border:2px solid #fff;box-shadow:0 0 0 1px #bf3a18;";
        el.title = pin.name;
        return new mapboxgl.Marker({ element: el, anchor: "center" }).setLngLat([pin.longitude, pin.latitude]).addTo(map);
      });
      if (pins.length === 1) {
        map.easeTo({ center: [pins[0].longitude, pins[0].latitude], zoom: 8 });
      } else if (pins.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        pins.forEach((pin) => bounds.extend([pin.longitude, pin.latitude]));
        map.fitBounds(bounds, { padding: 48, maxZoom: 8, duration: 0 });
      }
    };
    if (map.loaded()) draw();
    else map.once("load", draw);
  }, [pins]);

  if (!token) {
    return (
      <div className="h-[320px] lg:h-[420px] border border-ink/10 bg-[#f7f5f2] flex items-end justify-center p-4">
        <p className="font-mono uppercase text-ink-soft text-center" style={{ fontSize: 12, letterSpacing: "0.12em" }}>Map preview unavailable</p>
      </div>
    );
  }

  return <div ref={container} className="h-[320px] lg:h-[420px] border border-ink/10 bg-[#f7f5f2]" />;
}
