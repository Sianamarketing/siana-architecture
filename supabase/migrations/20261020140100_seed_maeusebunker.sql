-- Mäusebunker, Berlin. First full building entry.
-- Updates the existing projects row (slug maeusebunker) and replaces its
-- images, links and graphics. Safe to re-run.
--
-- Construction chronology is corrected here: work stopped in autumn 1975
-- and the site stood idle from 1976 to 1978 (not a 1976–1977 halt).
-- Coordinates are 52.436778, 13.317075.
--
-- Photographs are 1920px JPEG copies of Wikimedia Commons files, stored in
-- the repo at public/buildings/maeusebunker/ so every deploy serves them.
-- Credits, licences and source pages stay on project_images. Diagrams are
-- SVG (with a PNG twin) and the poster is a web PNG plus an A2 PDF.

do $seed$
declare
  pid uuid;
  berlin uuid;
begin
  select id into pid from public.projects where slug = 'maeusebunker' limit 1;
  if pid is null then
    select id into berlin from public.cities where slug = 'berlin' limit 1;
    if berlin is null then
      raise notice 'No Mäusebunker row and no Berlin city. Skipping seed.';
      return;
    end if;
    insert into public.projects (name, slug, city_id, status)
    values ('Mäusebunker', 'maeusebunker', berlin, 'published')
    returning id into pid;
  end if;

  update public.projects set
    name = 'Mäusebunker',
    tagline = 'Zentrale Tierlaboratorien der Freien Universität Berlin',
    architect = 'Gerd Hänska, Magdalena Hänska, with Kurt Schmersow',
    year_completed = 1982,
    style = 'Brutalist',
    category = 'Civic',
    address = 'Krahmerstraße 6–12, 12207 Berlin',
    latitude = 52.436778,
    longitude = 13.317075,
    status = 'published',
    condition = 'vacant',
    heritage_status = 'Baudenkmal',
    year_listed = 2023,
    siana_pick = $pick$Walk the Teltowkanal path and look across at the long flank: from there the blue air intakes read as a ship's gun battery, and the triangular windows sit between them like hatches.$pick$,
    tldr = $tldr$A sealed concrete lab for the Freie Universität, built 1971 to 1982 with walls tilted at 18.5° and rows of blue air intakes.

Its cost rose from 60 to 93.7 million DM, and in 1975 a senator called it Berlin's "first public building ruin".

The Charité planned to demolish it in 2017; protests saved it, and Berlin listed it as a monument in 2023.$tldr$,
    description = $description$The Freie Universität needed a central home for its laboratory animals, and in the mid-1960s Gerd and Magdalena Hänska began designing one. Their scheme was complete by 1967. The building would breed its own animals under controlled hygiene and house the experiments under the same roof, a brief with few precedents in Europe. A two-storey test building on Bäkestraße, later called the Kleiner Mäusebunker, tried out the construction first. It has since been demolished.

Work started in 1971 on marshy ground near the Teltowkanal. The foundations alone took two years and 1,300 driven piles, and their cost almost doubled. By March 1975 the estimate had climbed to 93.7 million DM, and construction stopped that autumn. Finance senator Klaus Riebschläger called it Berlin's "first public building ruin". The site stood idle from 1976 to 1978. Work resumed in 1978, the fit-out ran four more years, and the labs opened on 27 February 1982.

The form follows the services. Plant floors alternate with lab floors, so every second level holds air handling. Outside, the plant floors show as rows of blue intake pipes and the lab floors as tetrahedral window dormers. The cross-section is a stretched, stepped pyramid with walls inclined at 18.5°. Inside, small cell-like rooms line the corridors, finished in stainless steel and tile.

The Charité took over the building in 2003 and moved its animal research to a new building in Berlin-Buch, which opened in 2019. In 2017 it filed to demolish both the Mäusebunker and the Hygiene Institute next door. A petition, open letters from architects and a takeover offer from Arno Brandlhuber and Johann König followed. The Landesdenkmalamt launched the Modellverfahren Mäusebunker in 2021 to study reuse and listed the building on 25 May 2023. As of the October 2025 public debate, the administration was preparing a Konzeptverfahren, and no new use had been announced.$description$,
    analysis = $analysis$The Mäusebunker is a machine for clean air wearing armour. Every visible move comes from the brief: the sloped walls hold the stacked plant floors, the pipes feed them, the dormers bring daylight into the lab floors without glare. Hänska made the services the ornament, and the 2.60 m grid ties the inside to the outside so tightly you can read the floor plan off the facade. Few buildings of the period are this legible.

That legibility is also why it reads as sinister. A sealed hygienic building has to keep everything out, and the Hänskas let the facade say so. The battleship nickname sticks because the building does look armed. Berlin brutalism mostly means housing slabs or churches; here the material serves a lab, and the toughness has a reason.

Set it beside the Institut für Hygiene und Mikrobiologie across the road, by Fehling and Gogel, and the pairing gets better. Both are concrete, both from the same campus plan, and they are linked by a tunnel. Fehling and Gogel shaped theirs with curving, organic masses; the Hänskas went for acute angles and repetition. The listing authority treats them as an ensemble, and it is right to. Seen together, they show two answers West Berlin gave to the same question in the same decade.

The preservation case won, but the harder part is still open. The building works as one system: the ventilation runs everywhere or nowhere, and asbestos removal comes first. That rules out easy partial uses and explains why bouldering halls and galleries stayed on paper. Listing saved the shell. The building now needs a client with as much patience as the original one, and every empty year raises the bill.$analysis$,
    curious_facts = $facts$[
  "Every second floor is a plant floor. The blue pipes outside feed them, and the triangular dormers light the lab floors in between.",
  "The foundations took two years and 1,300 driven piles on marshy ground by the Teltowkanal.",
  "A two-storey test building on Bäkestraße, the \"Kleiner Mäusebunker\", tried out the construction first. It has since been demolished.",
  "A tunnel links it to the Hygiene Institute across the road, and the listing treats the two as one ensemble.",
  "It has its own documentary: Battleship Berlin by Nathan Eddy, 2021."
]$facts$::jsonb,
    why_section = $why${
  "intro": "Sources: Wiese & Janik, Baugeschichte und Beschreibung (2020); Denkmaldatenbank Berlin 09070102; Wikipedia.",
  "sections": [
    {
      "heading": "Plant floors between the lab floors",
      "graphic_slug": "floors-alternate",
      "paragraphs": [
        "Nine levels stack in strict alternation, starting with a plant floor at the bottom: TK, KG, HK, EG, 1.OG, 2.OG, 3.OG, 4.OG, 5.OG. The plant floors are lower, 2.09 m to 2.51 m against 3.20 m to 3.24 m for the labs.",
        "In 1967 to 1968 the engineers at Ing.-Büro Krauss compared this layout with a single central plant zone. Both needed the same space. Gerd Hänska still argued, in his report of 11 December 1968, that hygiene demands and researchers' need to adjust their own rooms made the alternation the only workable option. Each lab takes its conditioned air from the plant floor above or below."
      ]
    },
    {
      "heading": "The blue pipes",
      "graphic_slug": "how-a-lab-breathes",
      "paragraphs": [
        "There are 94 intake pipes, on the long facades only: 39 on the HK, 26 on the 1.OG and 29 on the 3.OG. They feed 28 fresh-air plants. They reach far out from the wall to draw air from beyond the heat that builds up at the concrete surface.",
        "The blue belongs to an interior colour code: sapphire blue marks the \"unclean\" technical zones, yellow and red the clean zones, green the mixed ones. The pipes carry that code outside."
      ]
    },
    {
      "heading": "The tetrahedral dormers",
      "graphic_slug": "north-light",
      "paragraphs": [
        "The fixed windows sit in pyramid-shaped dormers that always face north. The labs get glare-free daylight and no direct sun, which keeps light and temperature steady. Pipes and dormers follow technical needs and the room plan, and the building history calls the result a machine-like character.",
        "The listing text goes further: the brief shaped the design, and the architects stressed it on purpose."
      ]
    },
    {
      "heading": "The 18.5° walls",
      "graphic_slug": "the-shape",
      "paragraphs": [
        "The precast sandwich panels are mounted at 18.5°. No source we found explains why the Hänskas chose that number. The building history offers readings: the truncated pyramid recalls a tent or roof house, a grounded form that suggests calm and safety, and the slope with its ramps keeps visitors at a distance from an animal-testing building. There is also a practical gain: the receding upper floors let the building sit close to the western site boundary.",
        "With a height of 23.70 m and a base of 37.50 m, the angle is measured from the vertical."
      ]
    },
    {
      "heading": "One grid, five blocks, 1,300 piles",
      "graphic_slug": "five-blocks",
      "paragraphs": [
        "A 2.60 m grid runs the length of the building in axes 0 to 45. Main cross walls stand at 2.60 m or 5.20 m, and the facade panels come in the same two widths. That is why the floor plan shows on the outside. Four expansion joints cut the body into five sections of about equal length, each stable on its own.",
        "The ground by the Teltowkanal is soft alluvial soil, so the building stands on 1,300 prestressed driven piles tied by concrete ground beams. Piling took two years and pushed the foundation cost from 9 to 16.5 million DM."
      ]
    }
  ]
}$why$::jsonb,
    stats = $stats${
  "official_names": {
    "value": [
      "Zentrale Tierlaboratorien der Freien Universität Berlin (ZTL)",
      "Forschungseinrichtungen für Experimentelle Medizin der Charité (FEM), from 2003"
    ],
    "source": "https://de.wikipedia.org/wiki/M%C3%A4usebunker"
  },
  "architects": {
    "value": [
      "Gerd Hänska (1927–1996)",
      "Magdalena Hänska (1924–1986)",
      "Kurt Schmersow (collaborator)"
    ],
    "source": "https://denkmaldatenbank.berlin.de/daobj.php?obj_dok_nr=09070102",
    "note": "Wiese & Janik: Magdalena Hänska involved until 1975"
  },
  "engineers": {
    "value": null,
    "source": "https://www.modellverfahren-maeusebunker.de/sites/default/files/2021-08/ZTL-B_Baugeschichte-Beschreibung.pdf",
    "note": "Ing.-Büro Krauss (comparison calculation, 1967/68); Ing. Heinz Saar (structural review, 1976)."
  },
  "contractor": {
    "value": "Gustav Pegel & Sohn KG (shell and precast panels); Anton Schmittlein Bauunternehmung AG (fit-out)",
    "source": "https://www.modellverfahren-maeusebunker.de/sites/default/files/2021-08/ZTL-B_Baugeschichte-Beschreibung.pdf"
  },
  "client": {
    "value": "Senator für Bau- und Wohnungswesen, for the Freie Universität Berlin",
    "source": "https://denkmaldatenbank.berlin.de/daobj.php?obj_dok_nr=09070102"
  },
  "original_use": {
    "value": "Central animal laboratories: breeding of lab animals and animal experiments, with labs, offices and animal rooms",
    "source": "https://de.wikipedia.org/wiki/M%C3%A4usebunker"
  },
  "current_use": {
    "value": "Vacant since 2019/2020; owned by the Charité",
    "source": "https://www.berlin.de/ba-steglitz-zehlendorf/aktuelles/pressemitteilungen/2025/pressemitteilung.1589381.php"
  },
  "design_year": {
    "value": 1967,
    "source": "https://de.wikipedia.org/wiki/M%C3%A4usebunker",
    "note": "Planning start given as 1965, 1966 or 1967; complete design by 1967 at the latest"
  },
  "construction_start": {
    "value": 1971,
    "source": "https://www.modellverfahren-maeusebunker.de/sites/default/files/2021-08/ZTL-B_Baugeschichte-Beschreibung.pdf",
    "note": "Building permit 19 May 1971; foundations 1971 to 1973 (1,300 prestressed driven piles)"
  },
  "construction_stop": {
    "value": "Stopped in autumn 1975; the site stood idle from 1976 to 1978",
    "source": "https://www.modellverfahren-maeusebunker.de/sites/default/files/2021-08/ZTL-B_Baugeschichte-Beschreibung.pdf"
  },
  "completion": {
    "value": "February 1982",
    "source": "https://www.modellverfahren-maeusebunker.de/sites/default/files/2021-08/ZTL-B_Baugeschichte-Beschreibung.pdf",
    "note": "Opened 27 February 1982. Wikipedia and many sources give 1981.",
    "year": 1982
  },
  "style": {
    "value": "Brutalist",
    "source": "https://de.wikipedia.org/wiki/M%C3%A4usebunker"
  },
  "primary_materials": {
    "value": [
      "Exposed concrete, largely precast facade panels",
      "Blue-painted steel air intake pipes",
      "Stainless steel interior fittings"
    ],
    "source": "https://de.wikipedia.org/wiki/M%C3%A4usebunker"
  },
  "structural_system": {
    "value": "Reinforced concrete cross-wall structure on a 2.60 m grid, five independent sections divided by four expansion joints, on 1,300 prestressed driven piles",
    "source": "https://www.modellverfahren-maeusebunker.de/sites/default/files/2021-08/ZTL-B_Baugeschichte-Beschreibung.pdf"
  },
  "length_m": {
    "value": 117.35,
    "source": "https://www.modellverfahren-maeusebunker.de/sites/default/files/2021-08/ZTL-B_Baugeschichte-Beschreibung.pdf"
  },
  "width_m": {
    "value": 37.5,
    "source": "https://www.modellverfahren-maeusebunker.de/sites/default/files/2021-08/ZTL-B_Baugeschichte-Beschreibung.pdf"
  },
  "height_m": {
    "value": 23.7,
    "source": "https://www.modellverfahren-maeusebunker.de/sites/default/files/2021-08/ZTL-B_Baugeschichte-Beschreibung.pdf"
  },
  "wall_inclination_deg": {
    "value": 18.5,
    "source": "https://www.modellverfahren-maeusebunker.de/sites/default/files/2021-08/ZTL-B_Baugeschichte-Beschreibung.pdf"
  },
  "floors": {
    "value": 9,
    "source": "https://www.modellverfahren-maeusebunker.de/sites/default/files/2021-08/ZTL-B_Baugeschichte-Beschreibung.pdf",
    "note": "Nine levels alternating lab and plant floors (TK, KG, HK, EG, 1.OG to 5.OG)"
  },
  "floor_area_m2": {
    "value": 6202.14,
    "source": "https://www.modellverfahren-maeusebunker.de/sites/default/files/2021-08/ZTL-B_Baugeschichte-Beschreibung.pdf",
    "note": "Usable area in the 1969 permit application. The transformer station adds 1,213.55 m². A 1984 figure of 8,500 m² also appears."
  },
  "site_area_m2": {
    "value": 21750,
    "source": "https://www.modellverfahren-maeusebunker.de/werkstatt/wege-der-entwicklung-0"
  },
  "cost": {
    "value": "Estimated 60 million DM in 1969; 93.7 million DM estimate in March 1975",
    "source": "https://www.modellverfahren-maeusebunker.de/sites/default/files/2021-08/ZTL-B_Baugeschichte-Beschreibung.pdf",
    "note": "Final cost not confirmed"
  },
  "heritage_status": {
    "value": "Baudenkmal (listed monument), Obj.-Dok.-Nr. 09070102",
    "source": "https://denkmaldatenbank.berlin.de/daobj.php?obj_dok_nr=09070102"
  },
  "year_listed": {
    "value": 2023,
    "source": "https://www.berlin.de/landesdenkmalamt/aktivitaeten/kurzmeldungen/2023/maeusebunker-unter-denkmalschutz-1328090.php",
    "note": "Announced 25 May 2023"
  },
  "condition": {
    "value": "Vacant",
    "source": "https://www.berlin.de/ba-steglitz-zehlendorf/aktuelles/pressemitteilungen/2025/pressemitteilung.1589381.php",
    "note": "Asbestos contamination; standing, unused"
  },
  "public_access": {
    "value": "Closed. The exterior is visible from Krahmerstraße and the Teltowkanal path",
    "source": "https://www.morgenpost.de/bezirke/steglitz-zehlendorf/article240528084/lost-place-maeusebunker-tierlabor-steglitz-zehlendorf-vergessene-orte.html"
  },
  "address": {
    "value": "Krahmerstraße 6–12, 12207 Berlin",
    "source": "https://denkmaldatenbank.berlin.de/daobj.php?obj_dok_nr=09070102",
    "note": "Denkmaldatenbank lists Krahmerstraße 6"
  },
  "district": {
    "value": "Lichterfelde, Steglitz-Zehlendorf",
    "source": "https://denkmaldatenbank.berlin.de/daobj.php?obj_dok_nr=09070102"
  },
  "nearest_transit": {
    "value": [
      "Bus M85, 285: Krahmerstr./Stockweg",
      "S1: Lichterfelde West"
    ],
    "source": "https://www.morgenpost.de/bezirke/steglitz-zehlendorf/article240528084/lost-place-maeusebunker-tierlabor-steglitz-zehlendorf-vergessene-orte.html"
  },
  "lat": {
    "value": 52.436778,
    "source": "https://en.wikipedia.org/wiki/M%C3%A4usebunker"
  },
  "lng": {
    "value": 13.317075,
    "source": "https://en.wikipedia.org/wiki/M%C3%A4usebunker"
  },
  "awards": {
    "value": null,
    "source": null,
    "note": "None found"
  },
  "events": [
    {
      "value": "1971: building permit (19 May) and start of foundation works",
      "source": "https://www.modellverfahren-maeusebunker.de/sites/default/files/2021-08/ZTL-B_Baugeschichte-Beschreibung.pdf"
    },
    {
      "value": "Autumn 1975: construction stopped; the site stood idle from 1976 to 1978",
      "source": "https://www.modellverfahren-maeusebunker.de/sites/default/files/2021-08/ZTL-B_Baugeschichte-Beschreibung.pdf"
    },
    {
      "value": "1978: work resumed",
      "source": "https://www.modellverfahren-maeusebunker.de/sites/default/files/2021-08/ZTL-B_Baugeschichte-Beschreibung.pdf"
    },
    {
      "value": "1982: completion and opening (27 February)",
      "source": "https://www.modellverfahren-maeusebunker.de/sites/default/files/2021-08/ZTL-B_Baugeschichte-Beschreibung.pdf"
    },
    {
      "value": "2003: transferred to the Charité as FEM",
      "source": "https://de.wikipedia.org/wiki/M%C3%A4usebunker"
    },
    {
      "value": "2012: Charité decides on a replacement building in Berlin-Buch (opened 2019)",
      "source": "https://de.wikipedia.org/wiki/M%C3%A4usebunker"
    },
    {
      "value": "2017: Charité files demolition notice for the Mäusebunker and the Hygiene Institute",
      "source": "https://de.wikipedia.org/wiki/M%C3%A4usebunker"
    },
    {
      "value": "2019: Landesdenkmalrat recommends keeping the ensemble; use ends",
      "source": "https://de.wikipedia.org/wiki/M%C3%A4usebunker"
    },
    {
      "value": "2020: petition by Gunnar Klack and Felix Torkar; Brandlhuber and König offer to take over the site",
      "source": "https://de.wikipedia.org/wiki/M%C3%A4usebunker"
    },
    {
      "value": "2021: Hygiene Institute listed (January); LDA launches the Modellverfahren Mäusebunker (August)",
      "source": "https://de.wikipedia.org/wiki/M%C3%A4usebunker"
    },
    {
      "value": "2022–2023: four expert workshops under the Modellverfahren",
      "source": "https://www.berlin.de/landesdenkmalamt/aktivitaeten/kurzmeldungen/2023/maeusebunker-unter-denkmalschutz-1328090.php"
    },
    {
      "value": "25 May 2023: listed as a monument",
      "source": "https://www.berlin.de/landesdenkmalamt/aktivitaeten/kurzmeldungen/2023/maeusebunker-unter-denkmalschutz-1328090.php"
    },
    {
      "value": "2024: Festival für urbanes Wohlergehen held on the site (September)",
      "source": "https://de.wikipedia.org/wiki/M%C3%A4usebunker"
    },
    {
      "value": "2025: administration preparing a Konzeptverfahren; no reuse announced as of the 15 October 2025 public debate",
      "source": "https://www.berlin.de/ba-steglitz-zehlendorf/aktuelles/pressemitteilungen/2025/pressemitteilung.1589381.php"
    }
  ]
}$stats$::jsonb,
    hero_image_url = $hero$https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Zentrale_Tierlaboratorien_der_Freien_Universit%C3%A4t_Berlin-Lichterfelde_2024-11-21_01.jpg/1920px-Zentrale_Tierlaboratorien_der_Freien_Universit%C3%A4t_Berlin-Lichterfelde_2024-11-21_01.jpg$hero$,
    cover_image_url = $hero2$https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Zentrale_Tierlaboratorien_der_Freien_Universit%C3%A4t_Berlin-Lichterfelde_2024-11-21_01.jpg/1920px-Zentrale_Tierlaboratorien_der_Freien_Universit%C3%A4t_Berlin-Lichterfelde_2024-11-21_01.jpg$hero2$,
    og_image_url = $hero3$https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Zentrale_Tierlaboratorien_der_Freien_Universit%C3%A4t_Berlin-Lichterfelde_2024-11-21_01.jpg/1920px-Zentrale_Tierlaboratorien_der_Freien_Universit%C3%A4t_Berlin-Lichterfelde_2024-11-21_01.jpg$hero3$,
    meta_title = 'Mäusebunker — Siana Architecture',
    meta_description = 'A sealed concrete lab for the Freie Universität, built 1971 to 1982 with walls tilted at 18.5° and rows of blue air intakes.'
  where id = pid;

  delete from public.project_images where project_id = pid;
  delete from public.project_links where project_id = pid;
  delete from public.project_graphics where project_id = pid;
  insert into public.project_images
    (project_id, position, storage_path, source_url, original_url, width, height, kind, alt, caption, author, license, license_url, attribution, is_hero, permission_status)
  values
  (pid, 0, $img0p$/buildings/maeusebunker/01-sloped-flank.jpg$img0p$, $img0s$https://commons.wikimedia.org/wiki/File:Zentrale_Tierlaboratorien_der_Freien_Universit%C3%A4t_Berlin-Lichterfelde_2024-11-21_01.jpg$img0s$, $img0o$https://upload.wikimedia.org/wikipedia/commons/8/8a/Zentrale_Tierlaboratorien_der_Freien_Universit%C3%A4t_Berlin-Lichterfelde_2024-11-21_01.jpg$img0o$, 1920, 1281, $img0k$exterior$img0k$, $img0a$The Mäusebunker's sloped concrete flank seen across the autumn garden at Krahmerstraße, blue air intakes along the upper floors$img0a$, $img0c$Sloped flank across the autumn garden$img0c$, $img0u$Leonhard Lenz$img0u$, $img0l$CC0$img0l$, $img0lu$http://creativecommons.org/publicdomain/zero/1.0/deed.en$img0lu$, $img0at$Photo: Leonhard Lenz via Wikimedia Commons (CC0, credit appreciated)$img0at$, true, 'free'),
  (pid, 1, $img1p$/buildings/maeusebunker/02-forecourt.jpg$img1p$, $img1s$https://commons.wikimedia.org/wiki/File:Zentrale_Tierlaboratorien_der_Freien_Universit%C3%A4t_Berlin-Lichterfelde_2024-11-21_03.jpg$img1s$, $img1o$https://upload.wikimedia.org/wikipedia/commons/c/c8/Zentrale_Tierlaboratorien_der_Freien_Universit%C3%A4t_Berlin-Lichterfelde_2024-11-21_03.jpg$img1o$, 1920, 1281, $img1k$exterior$img1k$, $img1a$Wide view of the forecourt and the stepped north end, with the ramp structures and blue intake pipes$img1a$, $img1c$Forecourt and stepped north end$img1c$, $img1u$Leonhard Lenz$img1u$, $img1l$CC0$img1l$, $img1lu$http://creativecommons.org/publicdomain/zero/1.0/deed.en$img1lu$, $img1at$Photo: Leonhard Lenz via Wikimedia Commons (CC0, credit appreciated)$img1at$, false, 'free'),
  (pid, 2, $img2p$/buildings/maeusebunker/03-front.jpg$img2p$, $img2s$https://commons.wikimedia.org/wiki/File:FEM_Front.jpg$img2s$, $img2o$https://upload.wikimedia.org/wikipedia/commons/a/a4/FEM_Front.jpg$img2o$, 1920, 1280, $img2k$exterior$img2k$, $img2a$Front of the building: the inclined concrete base, the stepped upper levels and the tetrahedral window dormers$img2a$, $img2c$Front: sloped base and window dormers$img2c$, $img2u$Denis Barthel$img2u$, $img2l$CC BY-SA 4.0$img2l$, $img2lu$https://creativecommons.org/licenses/by-sa/4.0$img2lu$, $img2at$Photo: Denis Barthel, https://commons.wikimedia.org/wiki/File:FEM_Front.jpg (CC BY-SA 4.0)$img2at$, false, 'free'),
  (pid, 3, $img3p$/buildings/maeusebunker/04-side-elevation.jpg$img3p$, $img3s$https://commons.wikimedia.org/wiki/File:FEM_Seite.jpg$img3s$, $img3o$https://upload.wikimedia.org/wikipedia/commons/e/e9/FEM_Seite.jpg$img3o$, 1920, 1280, $img3k$exterior$img3k$, $img3a$Long side elevation under a clear sky, rows of blue air intakes and triangular windows above the sloped base$img3a$, $img3c$Long side elevation$img3c$, $img3u$Denis Barthel$img3u$, $img3l$CC BY-SA 4.0$img3l$, $img3lu$https://creativecommons.org/licenses/by-sa/4.0$img3lu$, $img3at$Photo: Denis Barthel, https://commons.wikimedia.org/wiki/File:FEM_Seite.jpg (CC BY-SA 4.0)$img3at$, false, 'free'),
  (pid, 4, $img4p$/buildings/maeusebunker/05-interior-lab.jpg$img4p$, $img4s$https://commons.wikimedia.org/wiki/File:FEM_Innen_Labor.jpg$img4s$, $img4o$https://upload.wikimedia.org/wikipedia/commons/e/e7/FEM_Innen_Labor.jpg$img4o$, 1920, 1280, $img4k$interior$img4k$, $img4a$Interior laboratory with three triangular dormer windows set into the sloped outer wall$img4a$, $img4c$Lab interior with three triangular windows$img4c$, $img4u$Denis Barthel$img4u$, $img4l$CC BY-SA 4.0$img4l$, $img4lu$https://creativecommons.org/licenses/by-sa/4.0$img4lu$, $img4at$Photo: Denis Barthel, https://commons.wikimedia.org/wiki/File:FEM_Innen_Labor.jpg (CC BY-SA 4.0)$img4at$, false, 'free'),
  (pid, 5, $img5p$/buildings/maeusebunker/06-stepped-end.jpg$img5p$, $img5s$https://commons.wikimedia.org/wiki/File:Zentrale-Tierlaboratorien-Maeusebunker-Gerd-Haenska-06-2019b.jpg$img5s$, $img5o$https://upload.wikimedia.org/wikipedia/commons/2/2f/Zentrale-Tierlaboratorien-Maeusebunker-Gerd-Haenska-06-2019b.jpg$img5o$, 1920, 1422, $img5k$exterior$img5k$, $img5a$Stepped end of the building seen from the forecourt, with terraces and the blue pipe cannons$img5a$, $img5c$Stepped end from the forecourt, 2019$img5c$, $img5u$Gunnar Klack$img5u$, $img5l$CC BY-SA 4.0$img5l$, $img5lu$https://creativecommons.org/licenses/by-sa/4.0$img5lu$, $img5at$Photo: Gunnar Klack, https://commons.wikimedia.org/wiki/File:Zentrale-Tierlaboratorien-Maeusebunker-Gerd-Haenska-06-2019b.jpg (CC BY-SA 4.0)$img5at$, false, 'free'),
  (pid, 6, $img6p$/buildings/maeusebunker/07-full-length.jpg$img6p$, $img6s$https://commons.wikimedia.org/wiki/File:M%C3%A4usebunker_Berlin_(25126384175).jpg$img6s$, $img6o$https://upload.wikimedia.org/wikipedia/commons/0/07/M%C3%A4usebunker_Berlin_%2825126384175%29.jpg$img6o$, 1920, 1359, $img6k$exterior$img6k$, $img6a$Black and white view of the full length of the building under a cloudy sky$img6a$, $img6c$Black and white, full length$img6c$, $img6u$Rolf Dietrich Brecher$img6u$, $img6l$CC BY-SA 2.0$img6l$, $img6lu$https://creativecommons.org/licenses/by-sa/2.0$img6lu$, $img6at$Photo: Rolf Dietrich Brecher from Germany, https://commons.wikimedia.org/wiki/File:M%C3%A4usebunker_Berlin_(25126384175).jpg (CC BY-SA 2.0)$img6at$, false, 'free'),
  (pid, 7, $img7p$/buildings/maeusebunker/08-at-night.jpg$img7p$, $img7s$https://commons.wikimedia.org/wiki/File:Forschungseinrichtungen_f%C3%BCr_Experimentelle_Medizin_(FEM),_bei_Nacht_-_panoramio.jpg$img7s$, $img7o$https://upload.wikimedia.org/wikipedia/commons/f/f4/Forschungseinrichtungen_f%C3%BCr_Experimentelle_Medizin_%28FEM%29%2C_bei_Nacht_-_panoramio.jpg$img7o$, 1920, 1280, $img7k$exterior$img7k$, $img7a$The building at night, lit windows along the upper floors$img7a$, $img7c$At night$img7c$, $img7u$Emediacreation$img7u$, $img7l$CC BY-SA 3.0$img7l$, $img7lu$https://creativecommons.org/licenses/by-sa/3.0$img7lu$, $img7at$Photo: Emediacreation, https://commons.wikimedia.org/wiki/File:Forschungseinrichtungen_f%C3%BCr_Experimentelle_Medizin_(FEM),_bei_Nacht_-_panoramio.jpg (CC BY-SA 3.0)$img7at$, false, 'free'),
  (pid, 8, $img8p$/buildings/maeusebunker/09-transformer.jpg$img8p$, $img8s$https://commons.wikimedia.org/wiki/File:Trafostation_am_M%C3%A4usebunker_(31824993426).jpg$img8s$, $img8o$https://upload.wikimedia.org/wikipedia/commons/9/96/Trafostation_am_M%C3%A4usebunker_%2831824993426%29.jpg$img8o$, 1920, 1260, $img8k$detail$img8k$, $img8a$The concrete transformer tub at the entrance with blue transformer housings between concrete fins$img8a$, $img8c$Transformer tub at the entrance$img8c$, $img8u$Rolf Dietrich Brecher$img8u$, $img8l$CC BY-SA 2.0$img8l$, $img8lu$https://creativecommons.org/licenses/by-sa/2.0$img8lu$, $img8at$Photo: Rolf Dietrich Brecher from Germany, https://commons.wikimedia.org/wiki/File:Trafostation_am_M%C3%A4usebunker_(31824993426).jpg (CC BY-SA 2.0)$img8at$, false, 'free'),
  (pid, 9, $img9p$/buildings/maeusebunker/10-model-1970.jpg$img9p$, $img9s$https://commons.wikimedia.org/wiki/File:Zentrale-Tierlaboratorien-Maeusebunker-Gerd-Haenska-Modellfoto-1970-7.jpg$img9s$, $img9o$https://upload.wikimedia.org/wikipedia/commons/2/22/Zentrale-Tierlaboratorien-Maeusebunker-Gerd-Haenska-Modellfoto-1970-7.jpg$img9o$, 1920, 1346, $img9k$archival$img9k$, $img9a$Architect's model photo, 1970: the stepped pyramid form with the ramp structures in front$img9a$, $img9c$Model photo, 1970$img9c$, $img9u$Gerd Hänska$img9u$, $img9l$CC BY-SA 4.0$img9l$, $img9lu$https://creativecommons.org/licenses/by-sa/4.0$img9lu$, $img9at$Image: Gerd Hänska, https://commons.wikimedia.org/wiki/File:Zentrale-Tierlaboratorien-Maeusebunker-Gerd-Haenska-Modellfoto-1970-7.jpg (CC BY-SA 4.0)$img9at$, false, 'free'),
  (pid, 10, $img10p$/buildings/maeusebunker/11-cross-sections.jpg$img10p$, $img10s$https://commons.wikimedia.org/wiki/File:Zentrale-Tierlaboratorien-Maeusebunker-Gerd-Haenska-Zeichnung-Querschnitte.jpg$img10s$, $img10o$https://upload.wikimedia.org/wikipedia/commons/7/7d/Zentrale-Tierlaboratorien-Maeusebunker-Gerd-Haenska-Zeichnung-Querschnitte.jpg$img10o$, 1920, 1152, $img10k$archival$img10k$, $img10a$Original cross sections by Gerd Hänska showing the alternating lab and plant floors under the sloped walls$img10a$, $img10c$Cross sections$img10c$, $img10u$Gerd Hänska$img10u$, $img10l$CC BY-SA 4.0$img10l$, $img10lu$https://creativecommons.org/licenses/by-sa/4.0$img10lu$, $img10at$Image: Gerd Hänska, https://commons.wikimedia.org/wiki/File:Zentrale-Tierlaboratorien-Maeusebunker-Gerd-Haenska-Zeichnung-Querschnitte.jpg (CC BY-SA 4.0)$img10at$, false, 'free'),
  (pid, 11, $img11p$/buildings/maeusebunker/12-perspective.jpg$img11p$, $img11s$https://commons.wikimedia.org/wiki/File:Zentrale-Tierlaboratorien-Maeusebunker-Gerd-Haenska-Zeichnung-Perspektive.jpg$img11s$, $img11o$https://upload.wikimedia.org/wikipedia/commons/5/5a/Zentrale-Tierlaboratorien-Maeusebunker-Gerd-Haenska-Zeichnung-Perspektive.jpg$img11o$, 1920, 1103, $img11k$archival$img11k$, $img11a$Original perspective and elevation drawings by Gerd Hänska$img11a$, $img11c$Perspective and elevations$img11c$, $img11u$Gerd Hänska$img11u$, $img11l$CC BY-SA 4.0$img11l$, $img11lu$https://creativecommons.org/licenses/by-sa/4.0$img11lu$, $img11at$Image: Gerd Hänska, https://commons.wikimedia.org/wiki/File:Zentrale-Tierlaboratorien-Maeusebunker-Gerd-Haenska-Zeichnung-Perspektive.jpg (CC BY-SA 4.0)$img11at$, false, 'free');
  insert into public.project_links
    (project_id, category, title, url, language, note, last_checked_at, last_status, position)
  values
  (pid, $lk1c$heritage$lk1c$, $lk1t$Berlin Denkmaldatenbank entry 09070102$lk1t$, $lk1u$https://denkmaldatenbank.berlin.de/daobj.php?obj_dok_nr=09070102$lk1u$, $lk1l$de$lk1l$, null, timestamptz '2026-10-20', 200, 0),
  (pid, $lk2c$heritage$lk2c$, $lk2t$Landesdenkmalamt: listing announcement, 25 May 2023$lk2t$, $lk2u$https://www.berlin.de/landesdenkmalamt/aktivitaeten/kurzmeldungen/2023/maeusebunker-unter-denkmalschutz-1328090.php$lk2u$, $lk2l$de$lk2l$, null, timestamptz '2026-10-20', 200, 1),
  (pid, $lk3c$modellverfahren$lk3c$, $lk3t$Modellverfahren Mäusebunker (official site)$lk3t$, $lk3u$https://www.modellverfahren-maeusebunker.de/$lk3u$, $lk3l$de$lk3l$, null, timestamptz '2026-10-20', 200, 0),
  (pid, $lk4c$modellverfahren$lk4c$, $lk4t$Bestand: building documentation$lk4t$, $lk4u$https://modellverfahren-maeusebunker.de/bestand$lk4u$, $lk4l$de$lk4l$, null, timestamptz '2026-10-20', 200, 1),
  (pid, $lk5c$modellverfahren$lk5c$, $lk5t$Wege der Entwicklung: workshop II$lk5t$, $lk5u$https://www.modellverfahren-maeusebunker.de/werkstatt/wege-der-entwicklung-0$lk5u$, $lk5l$de$lk5l$, null, timestamptz '2026-10-20', 200, 2),
  (pid, $lk6c$modellverfahren$lk6c$, $lk6t$Wiese & Janik, Baugeschichte und Beschreibung (PDF, 2020)$lk6t$, $lk6u$https://www.modellverfahren-maeusebunker.de/sites/default/files/2021-08/ZTL-B_Baugeschichte-Beschreibung.pdf$lk6u$, $lk6l$de$lk6l$, null, timestamptz '2026-10-20', 200, 3),
  (pid, $lk7c$encyclopedia$lk7c$, $lk7t$Wikipedia (de)$lk7t$, $lk7u$https://de.wikipedia.org/wiki/M%C3%A4usebunker$lk7u$, $lk7l$de$lk7l$, null, timestamptz '2026-10-20', 200, 0),
  (pid, $lk8c$encyclopedia$lk8c$, $lk8t$Wikipedia (en)$lk8t$, $lk8u$https://en.wikipedia.org/wiki/M%C3%A4usebunker$lk8u$, $lk8l$en$lk8l$, null, timestamptz '2026-10-20', 200, 1),
  (pid, $lk9c$encyclopedia$lk9c$, $lk9t$Wikimedia Commons category$lk9t$, $lk9u$https://commons.wikimedia.org/wiki/Category:Forschungseinrichtung_f%C3%BCr_experimentelle_Medizin$lk9u$, $lk9l$en$lk9l$, null, timestamptz '2026-10-20', 200, 2),
  (pid, $lk10c$database$lk10c$, $lk10t$SOS Brutalism entry$lk10t$, $lk10u$https://www.sosbrutalism.org/cms/15889871$lk10u$, $lk10l$en$lk10l$, null, timestamptz '2026-10-20', 200, 0),
  (pid, $lk11c$database$lk11c$, $lk11t$SOS Brutalism: Hygiene Institute (neighbor)$lk11t$, $lk11u$https://www.sosbrutalism.org/cms/15890561$lk11u$, $lk11l$en$lk11l$, null, timestamptz '2026-10-20', 200, 1),
  (pid, $lk12c$article$lk12c$, $lk12t$Dezeen: Mäusebunker saved from demolition (2023)$lk12t$, $lk12u$https://www.dezeen.com/2023/07/18/brutalist-mausebunker-saved-berlin/$lk12u$, $lk12l$en$lk12l$, null, timestamptz '2026-10-20', 200, 0),
  (pid, $lk13c$article$lk13c$, $lk13t$Bezirksamt Steglitz-Zehlendorf: Quo vadis Mäusebunker? (2025)$lk13t$, $lk13u$https://www.berlin.de/ba-steglitz-zehlendorf/aktuelles/pressemitteilungen/2025/pressemitteilung.1589381.php$lk13u$, $lk13l$de$lk13l$, null, timestamptz '2026-10-20', 200, 1),
  (pid, $lk14c$article$lk14c$, $lk14t$Entwicklungsstadt: Zukunft des Mäusebunkers in der Diskussion$lk14t$, $lk14u$https://www.entwicklungsstadt.de/diskussion-um-den-maeusebunker-in-berlin-lichterfelde-ikone-sucht-neue-bestimmung/$lk14u$, $lk14l$de$lk14l$, null, timestamptz '2026-10-20', 200, 2),
  (pid, $lk15c$article$lk15c$, $lk15t$StadtrandNachrichten: Experten mahnen zur Eile$lk15t$, $lk15u$https://stadtrand-nachrichten.de/nachnutzung-des-maeusebunkers-experten-mahnen-zur-eile/$lk15u$, $lk15l$de$lk15l$, null, timestamptz '2026-10-20', 200, 3),
  (pid, $lk16c$article$lk16c$, $lk16t$Berliner Morgenpost: Lost Places$lk16t$, $lk16u$https://www.morgenpost.de/bezirke/steglitz-zehlendorf/article240528084/lost-place-maeusebunker-tierlabor-steglitz-zehlendorf-vergessene-orte.html$lk16u$, $lk16l$de$lk16l$, null, timestamptz '2026-10-20', 200, 4),
  (pid, $lk17c$article$lk17c$, $lk17t$Greyscape: SOS Brutalism interview with Felix Torkar$lk17t$, $lk17u$https://www.greyscape.com/sos-brutalism/$lk17u$, $lk17l$en$lk17l$, $lk17n$Timed out when last checked from the server; the page is indexed.$lk17n$, null, null, 5),
  (pid, $lk18c$film$lk18c$, $lk18t$Dezeen: Battleship Berlin (Nathan Eddy, 2021)$lk18t$, $lk18u$https://www.dezeen.com/2021/10/29/battleship-berlin-short-film-brutalist-mausebunker/$lk18u$, $lk18l$en$lk18l$, null, timestamptz '2026-10-20', 200, 0),
  (pid, $lk19c$film$lk19c$, $lk19t$MAS Context: Battleship Berlin screening and credits$lk19t$, $lk19u$https://mascontext.com/events/battleship-berlin$lk19u$, $lk19l$en$lk19l$, null, timestamptz '2026-10-20', 200, 1),
  (pid, $lk20c$film$lk20c$, $lk20t$Battleship Berlin trailer (YouTube)$lk20t$, $lk20u$https://youtu.be/bU-QBGFVu1s$lk20u$, $lk20l$en$lk20l$, null, timestamptz '2026-10-20', 200, 2),
  (pid, $lk21c$book$lk21c$, $lk21t$Ludwig Heimbach (ed.): Mäusebunker und Hygieneinstitut. Eine Berliner Versuchsanordnung. jovis, 2025. ISBN 978-3-9861202-9-0$lk21t$, null, $lk21l$de$lk21l$, null, null, null, 0),
  (pid, $lk22c$book$lk22c$, $lk22t$Elser, Kurz, Schmal (eds.): SOS Brutalism: A Global Survey. Park Books, 2017. ISBN 978-3-03860-075-6$lk22t$, null, $lk22l$en$lk22l$, null, null, null, 1),
  (pid, $lk23c$book$lk23c$, $lk23t$Buttlar, Wittmann-Englert, Dolff-Bonekämper (eds.): Baukunst der Nachkriegsmoderne. Architekturführer Berlin 1949–1979. Reimer, 2013. ISBN 978-3-496-01486-7$lk23t$, null, $lk23l$de$lk23l$, null, null, null, 2),
  (pid, $lk24c$visitor$lk24c$, $lk24t$BVG stop Krahmerstr./Stockweg (M85, 285)$lk24t$, $lk24u$https://www.bvg.de/de/verbindungen/stationsuebersicht/krahmerstr-stockweg$lk24u$, $lk24l$de$lk24l$, null, timestamptz '2026-10-20', 200, 0),
  (pid, $lk25c$visitor$lk25c$, $lk25t$S-Bahn Lichterfelde West$lk25t$, $lk25u$https://sbahn.berlin/fahren/bahnhofsuebersicht/lichterfelde-west/$lk25u$, $lk25l$de$lk25l$, null, timestamptz '2026-10-20', 200, 1);
  insert into public.project_graphics
    (project_id, position, slug, kind, storage_path, svg_path, alt, caption, downloadable, download_path, download_label)
  values
  (pid, 0, $g0s$floors-alternate$g0s$, 'diagram', $g0p$/buildings/maeusebunker/diagrams/floors-alternate.png$g0p$, $g0v$/buildings/maeusebunker/diagrams/floors-alternate.svg$g0v$, $g0a$Nine levels in alternation: lower plant floors between the lab floors, with air moving from one to the next.$g0a$, $g0c$Plant floors alternate with lab floors. Conditioned air comes from the plant floor above or below.$g0c$, false, null, null),
  (pid, 1, $g1s$how-a-lab-breathes$g1s$, 'diagram', $g1p$/buildings/maeusebunker/diagrams/how-a-lab-breathes.png$g1p$, $g1v$/buildings/maeusebunker/diagrams/how-a-lab-breathes.svg$g1v$, $g1a$Section through a lab and the plant floor that feeds it, with the blue intake pipes drawn out from the wall.$g1a$, $g1c$94 intake pipes on the long facades feed 28 fresh-air plants. The blue is the colour code for the unclean technical zones.$g1c$, false, null, null),
  (pid, 2, $g2s$north-light$g2s$, 'diagram', $g2p$/buildings/maeusebunker/diagrams/north-light.png$g2p$, $g2v$/buildings/maeusebunker/diagrams/north-light.svg$g2v$, $g2a$North light through the tetrahedral dormers. Direct sun stays off the glass.$g2a$, $g2c$Fixed windows sit in pyramid dormers that face north, so the labs get daylight without direct sun.$g2c$, false, null, null),
  (pid, 3, $g3s$the-shape$g3s$, 'diagram', $g3p$/buildings/maeusebunker/diagrams/the-shape.png$g3p$, $g3v$/buildings/maeusebunker/diagrams/the-shape.svg$g3v$, $g3a$Cross-section: walls inclined at 18.5° from the vertical, over a 37.50 m base and a 23.70 m height.$g3a$, $g3c$The cross-section is a truncated pyramid. The 18.5° is measured from the vertical.$g3c$, false, null, null),
  (pid, 4, $g4s$five-blocks$g4s$, 'diagram', $g4p$/buildings/maeusebunker/diagrams/five-blocks.png$g4p$, $g4v$/buildings/maeusebunker/diagrams/five-blocks.svg$g4v$, $g4a$The plan: five blocks on a 2.60 m grid, separated by four expansion joints, standing on 1,300 piles.$g4a$, $g4c$A 2.60 m grid, four expansion joints, five blocks, and 1,300 driven piles.$g4c$, false, null, null),
  (pid, 5, 'poster', 'poster', $pp$/buildings/maeusebunker/poster/maeusebunker-poster.png$pp$, null, $pa$Poster: a field guide to the Mäusebunker, with the five diagrams.$pa$, $pc$The shape, the floors, the air, the light and the five blocks, on one sheet.$pc$, true, $pd$/buildings/maeusebunker/poster/maeusebunker-poster.pdf$pd$, $pl$maeusebunker-poster.pdf$pl$);
end
$seed$;
