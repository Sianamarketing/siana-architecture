import mapSvg from "./us-states.svg?raw";

export default function UsStateMap() {
  return (
    <div
      className="us-state-map bg-white border border-ink/10"
      dangerouslySetInnerHTML={{ __html: mapSvg }}
    />
  );
}
