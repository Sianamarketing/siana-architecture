-- Building entries.
-- Editorial fields on projects, credited images, further-reading links,
-- and diagrams / a downloadable poster. Public reads follow the published
-- project, the same way cities and projects already do. Admins write
-- through has_role. Idempotent so a later db push can re-apply safely.

alter table public.projects
  add column if not exists siana_pick text,
  add column if not exists analysis text,
  add column if not exists tldr text,
  add column if not exists curious_facts jsonb not null default '[]'::jsonb,
  add column if not exists why_section jsonb not null default '{}'::jsonb,
  add column if not exists stats jsonb not null default '{}'::jsonb,
  add column if not exists condition text,
  add column if not exists heritage_status text,
  add column if not exists year_listed int;

-- condition is its own column so the map can filter on it. 'demolished'
-- covers lost buildings such as the Ahornblatt.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'projects_condition_check'
  ) then
    alter table public.projects
      add constraint projects_condition_check
      check (condition is null or condition in ('standing', 'vacant', 'threatened', 'converted', 'demolished'));
  end if;
end $$;

comment on column public.projects.tldr is 'Short lead for the building page. Plain text.';
comment on column public.projects.curious_facts is 'JSON array of short fact strings.';
comment on column public.projects.why_section is 'JSON object { intro, sections: [{ heading, paragraphs, graphic_slug }] } for Why it looks like this.';
comment on column public.projects.stats is 'JSON object of { field: { value, source, note } }. See the Mäusebunker seed for the shape.';
comment on column public.projects.siana_pick is 'One-line editorial pick. Distinct from tagline.';

-- Credited photographs. storage_path is either a site path (/buildings/...)
-- or a key in the project-images bucket.
create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  position int not null default 0,
  storage_path text,
  source_url text not null,
  original_url text,
  width int,
  height int,
  kind text check (kind is null or kind in ('exterior', 'detail', 'interior', 'archival', 'drawing', 'model')),
  alt text not null,
  caption text,
  author text not null,
  license text not null,
  license_url text,
  attribution text not null,
  is_hero boolean not null default false,
  permission_status text not null default 'free'
    check (permission_status in ('free', 'requested', 'granted', 'denied')),
  created_at timestamptz not null default now()
);

create index if not exists project_images_project_position
  on public.project_images (project_id, position);
create unique index if not exists project_images_one_hero
  on public.project_images (project_id) where is_hero;

-- Further reading. modellverfahren is its own group for the Berlin
-- reuse study; url may be null for print-only books.
create table if not exists public.project_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  category text not null check (category in (
    'heritage', 'modellverfahren', 'encyclopedia', 'database',
    'article', 'book', 'film', 'official', 'visitor'
  )),
  title text not null,
  url text,
  publisher text,
  published_on date,
  language text,
  note text,
  last_checked_at timestamptz,
  last_status int,
  position int not null default 0
);

create index if not exists project_links_project_category
  on public.project_links (project_id, category, position);

-- Diagrams and the downloadable poster. svg_path is the sharp drawing;
-- storage_path is the raster. downloadable marks the poster.
create table if not exists public.project_graphics (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  position int not null default 0,
  slug text,
  kind text not null default 'diagram' check (kind in ('diagram', 'poster')),
  storage_path text,
  svg_path text,
  alt text,
  caption text,
  downloadable boolean not null default false,
  download_path text,
  download_label text,
  created_at timestamptz not null default now()
);

create index if not exists project_graphics_project_position
  on public.project_graphics (project_id, position);
create unique index if not exists project_graphics_project_slug
  on public.project_graphics (project_id, slug) where slug is not null;

alter table public.project_images enable row level security;
alter table public.project_links enable row level security;
alter table public.project_graphics enable row level security;

drop policy if exists "Public reads images of published projects" on public.project_images;
create policy "Public reads images of published projects"
  on public.project_images for select
  using (exists (
    select 1 from public.projects p
    where p.id = project_id and p.status = 'published'
  ));

drop policy if exists "Admins manage images" on public.project_images;
create policy "Admins manage images"
  on public.project_images for all
  using (public.has_role(auth.uid(), 'admin'::public.app_role))
  with check (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "Public reads links of published projects" on public.project_links;
create policy "Public reads links of published projects"
  on public.project_links for select
  using (exists (
    select 1 from public.projects p
    where p.id = project_id and p.status = 'published'
  ));

drop policy if exists "Admins manage links" on public.project_links;
create policy "Admins manage links"
  on public.project_links for all
  using (public.has_role(auth.uid(), 'admin'::public.app_role))
  with check (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "Public reads graphics of published projects" on public.project_graphics;
create policy "Public reads graphics of published projects"
  on public.project_graphics for select
  using (exists (
    select 1 from public.projects p
    where p.id = project_id and p.status = 'published'
  ));

drop policy if exists "Admins manage graphics" on public.project_graphics;
create policy "Admins manage graphics"
  on public.project_graphics for all
  using (public.has_role(auth.uid(), 'admin'::public.app_role))
  with check (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Match the grants on projects: RLS is the access control.
grant all on table public.project_images to anon, authenticated, service_role;
grant all on table public.project_links to anon, authenticated, service_role;
grant all on table public.project_graphics to anon, authenticated, service_role;
