import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { MOODS, QUOTES, type Mood } from "@/data/quotes";
import { QuoteCard } from "@/components/QuoteCard";

export const Route = createFileRoute("/app/search")({ component: SearchPage });

function SearchPage() {
  const [q, setQ] = useState("");
  const [mood, setMood] = useState<Mood | "all">("all");

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return QUOTES.filter(x =>
      (mood === "all" || x.mood === mood) &&
      (!term || x.text.toLowerCase().includes(term) || x.author.toLowerCase().includes(term))
    );
  }, [q, mood]);

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Search</div>
        <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">Find your <span className="text-gradient">line</span></h1>
      </header>

      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by keyword or author..."
          className="w-full rounded-2xl glass py-4 pl-11 pr-4 text-base outline-none transition focus:ring-2 focus:ring-primary/60" />
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setMood("all")} className={`rounded-full border px-3 py-1.5 text-xs ${mood === "all" ? "border-transparent bg-gradient-brand text-primary-foreground" : "border-border glass"}`}>All</button>
        {MOODS.map(m => (
          <button key={m.id} onClick={() => setMood(m.id)} className={`rounded-full border px-3 py-1.5 text-xs ${mood === m.id ? "border-transparent bg-gradient-brand text-primary-foreground" : "border-border glass"}`}>{m.emoji} {m.label}</button>
        ))}
      </div>

      {results.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-muted-foreground">No results. Try a different keyword.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {results.map((qu, i) => <QuoteCard key={qu.id} quote={qu} index={i} />)}
        </div>
      )}
    </div>
  );
}
