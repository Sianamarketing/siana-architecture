/**
 * Custom Mapbox markers.
 *
 * Mapbox GL positions a marker by writing `transform: translate(...)` on the
 * element you pass to `new mapboxgl.Marker({ element })`, and its stylesheet
 * places that element with `position: absolute; top: 0; left: 0`.
 *
 * Anything that fights those two properties makes the pin leave its lat/lng:
 * - `transition: transform` (or any transform animation) on the marker element
 *   interpolates Mapbox's translate during zoom and pan, so the pin slides
 *   across the map and only catches up after the gesture.
 * - `transform: scale(...)` on that same element is overwritten by Mapbox on
 *   the next frame, and while a transition is set the two values blend.
 * - `position: relative` (or `all: unset`, which resets `position` / `top` /
 *   `left`) drops the element back into normal flow. Markers then stack on
 *   each other's layout height, so every pin after the first rests a fixed
 *   number of pixels off its coordinate.
 *
 * Visual treatment — the terracotta dot, the selected scale, the pulse —
 * lives on an inner node. The root element stays a plain box Mapbox can move.
 */

const DOT = "#bf3a18";

/** Project pin: 11px terracotta dot, white ring, optional selected scale. */
export function buildProjectMarkerElement(name: string, selected = false): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.setAttribute("aria-label", name);
  // Do not set transform, transition, or position here. Mapbox owns them.
  el.style.cssText = [
    "cursor:pointer",
    "appearance:none",
    "background:transparent",
    "border:0",
    "padding:0",
    "margin:0",
    "display:block",
    "line-height:0",
    "width:11px",
    "height:11px",
  ].join(";");

  const dot = document.createElement("span");
  dot.style.cssText = [
    "display:block",
    "box-sizing:border-box",
    "width:11px",
    "height:11px",
    "border-radius:9999px",
    `background:${DOT}`,
    "border:2px solid #fff",
    `box-shadow:0 0 0 2px ${DOT}`,
    "position:relative",
    `transform:${selected ? "scale(1.35)" : "scale(1)"}`,
    "transform-origin:center",
    "transition:transform .18s ease",
  ].join(";");

  // Pulse is centred on the dot, not on the map, so its transform animation
  // cannot move the coordinate Mapbox is tracking.
  const pulse = document.createElement("span");
  pulse.style.cssText = [
    "position:absolute",
    "top:50%",
    "left:50%",
    "width:16px",
    "height:16px",
    "border-radius:9999px",
    `border:1px solid ${DOT}`,
    "opacity:.3",
    "transform:translate(-50%,-50%)",
    "animation:siana-pulse 2.2s infinite",
    "pointer-events:none",
  ].join(";");
  dot.appendChild(pulse);
  el.appendChild(dot);
  return el;
}

/** City / search pin: terracotta teardrop. Anchor this with `anchor: "bottom"`. */
export function buildTeardropMarkerElement(): HTMLDivElement {
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  // Width and height match the SVG so the bottom-center tip is the anchor
  // point. No position, transform, or transition — those belong to Mapbox.
  el.style.cssText = "width:18px;height:26px;pointer-events:none;line-height:0;";
  el.innerHTML = `
    <svg viewBox="0 0 18 26" width="18" height="26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.18));">
      <path d="M9 0C4.03 0 0 4.03 0 9c0 6.75 9 17 9 17s9-10.25 9-17c0-4.97-4.03-9-9-9z" fill="${DOT}"/>
      <circle cx="9" cy="9" r="3" fill="#ffffff"/>
    </svg>`;
  return el;
}
