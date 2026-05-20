import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MOODS, quotesByMood, type Mood } from "@/data/quotes";
import { QuoteCard } from "@/components/QuoteCard";
import { useMoodHistory } from "@/lib/store";

type Search = { mood?: Mood };

export const Route = createFileRoute("/app/explore")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    mood: (s.mood as Mood) ?? undefined,
  }),
  component: Explore,
});

function Explore() {
  const { mood } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [selected, setSelected] = useState<Mood>(mood ?? "motivated");
  const { push } = useMoodHistory();

  useEffect(() => { if (mood && mood !== selected) setSelected(mood); /* eslint-disable-next-line */ }, [mood]);
  useEffect(() => { push(selected); /* eslint-disable-next-line */ }, [selected]);

  const list = quotesByMood(selected);

  return (
    <div className="space-y-8">
      <header>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Mood Explorer</div>
        <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">How are you <span className="text-gradient">feeling</span>?</h1>
      </header>

      <div className="flex flex-wrap gap-2">
        {MOODS.map(m => {
          const active = selected === m.id;
          return (
            <button key={m.id}
              onClick={() => { setSelected(m.id); navigate({ search: { mood: m.id } }); }}
              className={`relative inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${active ? "border-transparent bg-gradient-brand text-primary-foreground shadow-glow" : "border-border glass hover:bg-secondary"}`}>
              <span>{m.emoji}</span><span>{m.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={selected}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="grid gap-4 md:grid-cols-2">
          {list.map((q, i) => <QuoteCard key={q.id} quote={q} index={i} />)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
