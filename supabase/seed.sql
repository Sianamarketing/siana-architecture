-- ============================================================
-- Siana Architecture — demo seed data (published cities + projects)
-- ------------------------------------------------------------
-- Purpose: populate the public site so /cities renders the
-- "Fragment" cards (each card needs a published city; the
-- "N projects" count needs published projects per city).
--
-- How to run (pick one):
--   1. Supabase Dashboard → SQL Editor → paste this file → Run
--      (the editor runs as a privileged role, so RLS is bypassed)
--   2. Local CLI:  supabase db reset       (auto-runs supabase/seed.sql)
--   3. Remote CLI: psql "$SUPABASE_DB_URL" -f supabase/seed.sql
--
-- Safe to re-run: every INSERT uses ON CONFLICT (slug) DO NOTHING.
-- Images use picsum.photos placeholders — swap them for real
-- architecture photography via the admin "Image upload" later.
-- ============================================================

-- ---------- Cities ----------
insert into public.cities
  (name, slug, country, tagline, description, hero_image_url,
   center_latitude, center_longitude, default_zoom, status)
values
  ('Barcelona', 'barcelona', 'Spain',
   'Modernisme, mosaics, and the unfinished cathedral of a dream.',
   'From Gaudí''s organic façades to the rationalist grid of the Eixample.',
   'https://picsum.photos/seed/siana-barcelona/1200/1500',
   41.3874, 2.1686, 12, 'published'),

  ('Lisbon', 'lisbon', 'Portugal',
   'Azulejo light spilling across seven hills.',
   'Pombaline calm meeting a contemporary waterfront ambition.',
   'https://picsum.photos/seed/siana-lisbon/1200/1500',
   38.7223, -9.1393, 12, 'published'),

  ('Mexico City', 'mexico-city', 'Mexico',
   'Barragán''s color and the weight of volcanic stone.',
   'A megacity of muralism, modernism, and pink walls.',
   'https://picsum.photos/seed/siana-mexicocity/1200/1500',
   19.4326, -99.1332, 11, 'published'),

  ('Copenhagen', 'copenhagen', 'Denmark',
   'Quiet Nordic rigor by the water.',
   'Where social housing becomes a discipline of light.',
   'https://picsum.photos/seed/siana-copenhagen/1200/1500',
   55.6761, 12.5683, 12, 'published'),

  ('Porto', 'porto', 'Portugal',
   'Granite, fog, and the precision of Siza.',
   'A school of architecture written in white concrete.',
   'https://picsum.photos/seed/siana-porto/1200/1500',
   41.1579, -8.6291, 12, 'published'),

  ('Chicago', 'chicago', 'United States',
   'The birthplace of the skyscraper.',
   'Steel, glass, and the long shadow of Mies.',
   'https://picsum.photos/seed/siana-chicago/1200/1500',
   41.8781, -87.6298, 11, 'published'),

  -- Slug `newyork` matches the existing city record. ON CONFLICT leaves that
  -- row untouched and the projects below attach to it.
  ('New York', 'newyork', 'USA',
   'The city that nevers sleeps',
   'New York is the city that taught the modern world how to build vertically.',
   'https://picsum.photos/seed/siana-newyork/1200/1500',
   40.712749, -74.005994, 12, 'published')
on conflict (slug) do nothing;

-- ---------- Projects (linked to cities by slug) ----------
-- latitude/longitude are real building coordinates so the home-page map
-- renders a pin per project. cover/hero images are derived from the slug
-- (picsum placeholders) — swap for real photography via the admin later.
insert into public.projects
  (name, slug, architect, category, year_completed,
   latitude, longitude, cover_image_url, hero_image_url,
   city_id, status, featured)
select p.name, p.slug, p.architect, p.category, p.year_completed,
       p.latitude, p.longitude,
       'https://picsum.photos/seed/siana-' || p.slug || '/1200/1500',
       'https://picsum.photos/seed/siana-' || p.slug || '-hero/2000/1200',
       c.id, 'published', p.featured
from (
  values
    ('Sagrada Família',         'sagrada-familia',        'Antoni Gaudí',                 'Religious',   1882, 41.4036::float8,   2.1744::float8, 'barcelona',   true),
    ('Casa Batlló',             'casa-batllo',            'Antoni Gaudí',                 'Residential', 1906, 41.3917,           2.1649,         'barcelona',   false),
    ('Mercat de Santa Caterina','mercat-santa-caterina',  'EMBT',                         'Civic',       2005, 41.3870,           2.1779,         'barcelona',   false),
    ('Champalimaud Centre',     'champalimaud-centre',    'Charles Correa',               'Civic',       2010, 38.6936,          -9.2057,         'lisbon',      true),
    ('MAAT',                    'maat-lisbon',            'Amanda Levete (AL_A)',         'Cultural',    2016, 38.6957,          -9.1939,         'lisbon',      false),
    ('Casa Luis Barragán',      'casa-luis-barragan',     'Luis Barragán',                'Residential', 1948, 19.4116,         -99.1920,         'mexico-city', true),
    ('Museo Soumaya',           'museo-soumaya',          'FR-EE / Fernando Romero',      'Cultural',    2011, 19.4406,         -99.2046,         'mexico-city', false),
    ('8 House',                 '8-house',                'BIG',                          'Residential', 2010, 55.6180,          12.5772,         'copenhagen',  true),
    ('Royal Danish Opera',      'royal-danish-opera',     'Henning Larsen',               'Cultural',    2005, 55.6797,          12.6010,         'copenhagen',  false),
    ('Casa da Música',          'casa-da-musica',         'OMA / Rem Koolhaas',           'Cultural',    2005, 41.1586,          -8.6304,         'porto',       true),
    ('Serralves Museum',        'serralves-museum',       'Álvaro Siza',                  'Cultural',    1999, 41.1597,          -8.6592,         'porto',       false),
    ('Willis Tower',            'willis-tower',           'SOM / Fazlur Rahman Khan',     'Office',      1973, 41.8789,         -87.6359,         'chicago',     true),
    ('Robie House',             'robie-house',            'Frank Lloyd Wright',           'Residential', 1910, 41.7896,         -87.5959,         'chicago',     false)
) as p(name, slug, architect, category, year_completed, latitude, longitude, city_slug, featured)
join public.cities c on c.slug = p.city_slug
on conflict (slug) do nothing;

-- ---------- New York projects ----------
-- Same table and conflict rule as the catalogue above. Pins are NYC MapPLUTO
-- tax-lot centroids, which sit on the building footprints:
--   Hugh O'Neill Building        40.741427, -73.994319
--   Manhattan Savings Institution 40.726482, -73.995415
--   Bayard-Condict Building       40.726360, -73.994996
-- Neighborhood lives in `address` (there is no neighborhood column), in the
-- same "street, neighborhood, city" shape as other edited projects.
insert into public.projects
  (name, slug, architect, category, year_completed,
   address, latitude, longitude, tagline, description,
   cover_image_url, hero_image_url,
   city_id, status, featured)
select p.name, p.slug, p.architect, p.category, p.year_completed,
       p.address, p.latitude, p.longitude, p.tagline, p.description,
       'https://picsum.photos/seed/siana-' || p.slug || '/1200/1500',
       'https://picsum.photos/seed/siana-' || p.slug || '-hero/2000/1200',
       c.id, 'published', false
from (
  values
    (
      'Hugh O''Neill Building',
      'hugh-o-neill-building',
      'Mortimer C. Merritt',
      'Commercial',
      1890,
      '655 Sixth Avenue at W 20th St, Chelsea, New York',
      40.741427::float8,
      -73.994319::float8,
      'Mortimer C. Merritt''s dry goods store on the Ladies'' Mile.',
      $oneill$<p>Hugh O'Neill Building, 655 Sixth Avenue at W 20th St (the white one with gold domes). Mortimer C. Merritt designed it as Hugh O'Neill's Dry Goods Store. It went up in two stages between 1887 and 1890 so the old store could stay open during construction.</p><p>It was one of the big department stores on the "Ladies' Mile," the 19th-century shopping strip where women with money and free time bought ready-made goods. The front is cast iron, which made it easy to grow: in 1895 the owners added a fifth floor by lifting the pediment and domes and setting them back on top.</p><p>The domes were removed in 1917. During a condo conversion in the 2000s, the architects at CetraRuddy rebuilt them. No original drawings survived, so they worked from old city photos taken to document the Sixth Avenue elevated train next door.</p>$oneill$
    ),
    (
      'Manhattan Savings Institution',
      'manhattan-savings-institution',
      'Stephen Decatur Hatch',
      'Civic',
      1891,
      '644 Broadway at Bleecker, NoHo, New York',
      40.726482::float8,
      -73.995415::float8,
      'Stephen Decatur Hatch''s bank at Broadway and Bleecker.',
      $msi$<p>Manhattan Savings Institution, 644 Broadway at Bleecker (red brick and sandstone, green copper turret). Look for "MSI" in the copper pediment. Stephen Decatur Hatch designed it, and it was finished in 1891.</p><p>The best story belongs to the building it replaced. In 1878 a gang led by George Leonidas Leslie, a trained architect turned master bank robber, hit the bank's earlier building on this corner. They got away with more than $2.8 million in cash and securities, one of the largest bank robberies in US history.</p><p>The bank moved out in the early 1940s, and the building has held residential lofts since the 1970s. Kith now occupies the ground floor.</p>$msi$
    ),
    (
      'Bayard–Condict Building',
      'bayard-condict-building',
      'Louis Sullivan / Lyndon P. Smith',
      'Office',
      1899,
      '65 Bleecker St, NoHo, New York',
      40.726360::float8,
      -73.994996::float8,
      'Louis Sullivan''s only building in New York.',
      $bayard$<p>Bayard–Condict Building, 65 Bleecker St (the cream terracotta tower). This is Louis Sullivan's only building in New York, designed with Lyndon P. Smith and built 1897 to 1899. Sullivan is the Chicago architect behind "form follows function," and this was one of the city's first true steel-frame skyscrapers.</p><p>The Buildings Department filed 35 objections to the plans because the code was written for buildings with load-bearing walls. Six winged angels hold up the cornice. A popular story says owner Silas Condict demanded them over Sullivan's objection, but historians doubt it, because the angels appeared in a June 1898 magazine illustration before the Condicts owned the building.</p><p>The photo was taken from Crosby Street, which ends right at its front door, so it is the classic view.</p>$bayard$
    )
) as p(name, slug, architect, category, year_completed, address, latitude, longitude, tagline, description)
join public.cities c on c.slug = 'newyork'
on conflict (slug) do nothing;
