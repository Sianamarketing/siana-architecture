-- Three New York buildings for the atlas map.
-- Attaches to the existing city row (slug `newyork`). Does not insert a city.
-- Safe to re-run: project inserts use ON CONFLICT (slug) DO NOTHING.
-- Same rows live in supabase/seed.sql for a fresh `db reset`, where this
-- migration runs before the city exists and therefore inserts nothing.

DO $$
DECLARE
  nyc_id uuid;
BEGIN
  SELECT id INTO nyc_id FROM public.cities WHERE slug = 'newyork' LIMIT 1;
  IF nyc_id IS NULL THEN
    RAISE NOTICE 'No New York city row (slug newyork). Skipping project seed.';
    RETURN;
  END IF;

  INSERT INTO public.projects
    (name, slug, architect, category, year_completed,
     address, latitude, longitude, tagline, description,
     cover_image_url, hero_image_url,
     city_id, status, featured)
  SELECT p.name, p.slug, p.architect, p.category, p.year_completed,
         p.address, p.latitude, p.longitude, p.tagline, p.description,
         'https://picsum.photos/seed/siana-' || p.slug || '/1200/1500',
         'https://picsum.photos/seed/siana-' || p.slug || '-hero/2000/1200',
         nyc_id, 'published', false
  FROM (
    VALUES
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
  ) AS p(name, slug, architect, category, year_completed, address, latitude, longitude, tagline, description)
  ON CONFLICT (slug) DO NOTHING;
END $$;
