import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { readMinutes } from "@/lib/directory";

interface Story {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  hero_image_url: string | null;
  body: string | null;
}

export default function HomeResearch() {
  const [stories, setStories] = useState<Story[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, slug, title, excerpt, category, hero_image_url, body")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (!cancelled) setStories((data || []) as Story[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const lead = stories?.[0];
  const rest = stories?.slice(1) || [];

  return (
    <section id="research" className="bg-transparent py-16 md:py-24 border-t border-ink/10">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
          <div>
            <p className="font-mono uppercase text-warm-gray mb-4" style={{ fontSize: 12, letterSpacing: "0.18em" }}>
              04 / News & research
            </p>
            <h2 className="text-ink" style={{ fontFamily: "'Adobe Garamond Pro', 'EB Garamond', Garamond, Georgia, serif", fontWeight: 400, fontSize: "clamp(2.6rem, 5vw, 4.6rem)", lineHeight: 0.95 }}>
              Ideas worth following.
            </h2>
          </div>
          <Link
            to="/practice"
            className="inline-flex items-center gap-2 font-mono uppercase text-ink border-b border-ink pb-1 hover:gap-3 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]"
            style={{ fontSize: 12, letterSpacing: "0.16em" }}
          >
            View all stories
            <span aria-hidden="true" className="text-accent-terra">→</span>
          </Link>
        </div>

        {stories === null ? (
          <p className="font-body text-ink-soft">Loading stories.</p>
        ) : !lead ? (
          <p className="font-body text-ink-soft text-[16px]">Stories will appear here as they are published.</p>
        ) : (
          <>
            <Link to={`/practice/${lead.slug}`} className="grid grid-cols-1 lg:grid-cols-[56%_1fr] gap-8 lg:gap-14 group">
              {lead.hero_image_url ? (
                <img src={lead.hero_image_url} alt={lead.title} className="w-full h-auto object-cover bg-paper-mid max-h-[560px]" />
              ) : (
                <div className="bg-paper-mid min-h-[280px]" />
              )}
              <div className="flex flex-col justify-center py-2">
                {lead.category && (
                  <p className="font-mono uppercase text-accent-terra mb-4" style={{ fontSize: 12, letterSpacing: "0.16em" }}>
                    {lead.category}
                  </p>
                )}
                <h3 className="text-ink group-hover:opacity-70" style={{ fontFamily: "'Adobe Garamond Pro', 'EB Garamond', Garamond, Georgia, serif", fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.8rem)", lineHeight: 1.05 }}>
                  {lead.title}
                </h3>
                {lead.excerpt && (
                  <p className="mt-5 font-body text-ink-soft text-[16px] leading-relaxed max-w-md">{lead.excerpt}</p>
                )}
                <span className="mt-6 inline-flex items-center gap-2 font-mono uppercase text-ink border-b border-ink self-start pb-1" style={{ fontSize: 12, letterSpacing: "0.14em" }}>
                  Read the story
                  {readMinutes(lead.body) ? <span className="text-warm-gray">{readMinutes(lead.body)} min</span> : null}
                </span>
              </div>
            </Link>

            {rest.length > 0 && (
              <ul className="mt-12 md:mt-16 border-b border-ink/15">
                {rest.map((story) => {
                  const minutes = readMinutes(story.body);
                  return (
                    <li key={story.id} className="border-t border-ink/15">
                      <Link
                        to={`/practice/${story.slug}`}
                        className="grid grid-cols-1 md:grid-cols-[9rem_1fr_auto] gap-3 md:gap-8 items-center py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--accent))]"
                      >
                        <span className="font-mono uppercase text-warm-gray" style={{ fontSize: 12, letterSpacing: "0.14em" }}>
                          {story.category || "Story"}
                        </span>
                        <span className="text-ink" style={{ fontFamily: "'Adobe Garamond Pro', 'EB Garamond', Garamond, Georgia, serif", fontSize: "clamp(1.25rem, 2vw, 1.7rem)", lineHeight: 1.15 }}>
                          {story.title}
                        </span>
                        <span className="flex items-center gap-3 text-ink-soft">
                          {minutes ? <span className="font-mono" style={{ fontSize: 12 }}>{minutes} min</span> : null}
                          <span aria-hidden="true" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/20 text-ink">→</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </section>
  );
}
