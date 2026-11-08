import { Link } from "react-router-dom";
import type { SelectedProject } from "@/data/architectProfiles";

export default function ProjectFeature({
  project,
  firmName,
  firmPath,
  id,
}: {
  project: SelectedProject;
  firmName?: string;
  firmPath?: string;
  id?: string;
}) {
  const place = [project.city, project.country].filter(Boolean).join(", ");
  const showStatus = project.status && project.status !== "Date not stated";
  return (
    <article id={id} className={`scroll-mt-28 border-t border-ink/15 py-5 ${project.image ? "grid grid-cols-1 gap-4 md:grid-cols-[11rem_minmax(0,1fr)] md:items-start" : ""}`}>
      {project.image && (
        <figure className="md:max-w-[11rem]">
          <img src={project.image.src} alt={project.image.alt} className="w-full max-h-40 object-cover bg-paper-mid" />
          <figcaption className="mt-2 font-body text-ink-soft text-[12px] leading-relaxed">
            {project.image.author}.{" "}
            <a href={project.image.licenseUrl} className="underline underline-offset-4" target="_blank" rel="noopener noreferrer">{project.image.license}, external</a>.
          </figcaption>
        </figure>
      )}
      <div>
        <h3 className="text-ink" style={{ fontWeight: 400, fontSize: "1.35rem" }}>
          <a href={project.sourceUrl} className="hover:underline" target="_blank" rel="noopener noreferrer">{project.name}</a>
        </h3>
        {firmName && firmPath && (
          <p className="mt-1">
            <Link to={firmPath} className="font-body text-ink text-[15px] underline underline-offset-4">{firmName}</Link>
          </p>
        )}
        <p className="mt-2 font-body text-ink-soft text-[14px]">
          {place}{showStatus ? `. ${project.status}` : ""}
        </p>
        {project.summary && <p className="mt-2 max-w-2xl font-body text-ink text-[16px] leading-relaxed">{project.summary}</p>}
      </div>
    </article>
  );
}
