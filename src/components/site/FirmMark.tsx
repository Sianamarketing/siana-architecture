import type { ArchitectProfile } from "@/data/architectProfiles";

export default function FirmMark({ profile, large = false, compact = false }: { profile: ArchitectProfile; large?: boolean; compact?: boolean }) {
  if (!profile.mark || profile.mark.permissionStatus !== "official-identifying-mark") return null;
  const size = compact ? "h-6 max-h-[26px] max-w-[4.5rem]" : large ? "h-10 max-w-[11rem]" : "h-7 max-w-[8.5rem]";
  const plate = profile.markOnInk ? (compact ? "bg-ink px-1" : "bg-ink px-1.5 py-1") : "";
  return (
    <img
      src={profile.mark.src}
      alt=""
      className={`${plate} ${size} w-auto shrink-0 object-contain`}
    />
  );
}
