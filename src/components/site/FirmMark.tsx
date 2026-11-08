import type { ArchitectProfile } from "@/data/architectProfiles";

export default function FirmMark({ profile, large = false }: { profile: ArchitectProfile; large?: boolean }) {
  if (!profile.mark || profile.mark.permissionStatus !== "official-identifying-mark") return null;
  return (
    <img
      src={profile.mark.src}
      alt=""
      className={`${profile.markOnInk ? "bg-ink px-1.5 py-1" : ""} ${large ? "h-10 max-w-[11rem]" : "h-7 max-w-[8.5rem]"} w-auto object-contain`}
    />
  );
}
