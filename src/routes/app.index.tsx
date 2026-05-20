import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Flame, Heart, Sparkles, History, ArrowRight } from "lucide-react";
import { MOODS, quoteOfTheDay } from "@/data/quotes";
import { useFavorites, useHistory, useMoodHistory, useStreak } from "@/lib/store";
import { QuoteCard } from "@/components/QuoteCard";

export const Route = createFileRoute("/app/")({ component: Dashboard });

function Dashboard() {
  const qotd = quoteOfTheDay();
  const { favs } = useFavorites();
  const { hist } = useHistory();
  const { moods } = useMoodHistory();
  const streak = useStreak();

  const topMood = (() => {
    const c: Record<string, number> = {};
    moods.forEach(m => (c[m.mood] = (c[m.mood] || 0) + 1));
    const best = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
    return best ? best[0] : "—";
  })();

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Welcome back</div>
          <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">Today's <span className="text-gradient">vibe</span></h1>
        </div>
        <Link to="/app/explore" className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition hover:scale-[1.02]">
          Pick a mood <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={Flame} label="Streak" value={`${streak} day${streak === 1 ? "" : "s"}`} />
        <StatCard icon={Heart} label="Favorites" value={String(favs.length)} />
        <StatCard icon={History} label="Recently viewed" value={String(hist.length)} />
        <StatCard icon={Sparkles} label="Top mood" value={topMood} />
      </section>

      {/* QOTD */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl glass-strong p-8 shadow-glow md:p-12">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-brand opacity-20 blur-3xl" />
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Quote of the day</div>
        <p className="mt-3 font-display text-3xl leading-tight md:text-4xl">
          <span className="text-gradient">“</span>{qotd.text}<span className="text-gradient">”</span>
        </p>
        <div className="mt-5 text-sm text-muted-foreground">— {qotd.author}</div>
      </motion.section>

      {/* Mood grid */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl">Pick a mood</h2>
          <Link to="/app/explore" className="text-sm text-muted-foreground hover:text-foreground">See all →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {MOODS.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link to="/app/explore" search={{ mood: m.id }} className="group block">
                <div className={`relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br ${m.gradient} p-4 transition-transform group-hover:scale-[1.03]`}>
                  <div className="text-3xl">{m.emoji}</div>
                  <div className="absolute bottom-3 left-4 font-display text-sm text-white drop-shadow">{m.label}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent */}
      {hist.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-xl">Recently viewed</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {hist.slice(0, 4).map((h, i) => <QuoteCard key={h.q.id} quote={h.q} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Flame; label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-2 font-display text-2xl capitalize">{value}</div>
    </div>
  );
}
