-- Terracotta menu cards for the swipe row on a building page.
-- The plain diagram stays on storage_path / svg_path. card_path is the
-- portrait card (optional). Public read is unchanged: the existing policy
-- on project_graphics already covers every column.

alter table public.project_graphics
  add column if not exists card_path text;

update public.project_graphics g
set card_path = '/buildings/maeusebunker/menu/' || g.slug || '.png'
from public.projects p
where p.id = g.project_id
  and p.slug = 'maeusebunker'
  and g.kind = 'diagram'
  and g.slug in (
    'floors-alternate',
    'how-a-lab-breathes',
    'north-light',
    'the-shape',
    'five-blocks'
  );
