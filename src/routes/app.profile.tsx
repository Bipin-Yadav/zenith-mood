import { createFileRoute } from "@tanstack/react-router";
import { Flame, Heart, History, Sparkles } from "lucide-react";
import { useFavorites, useHistory, useMoodHistory, useStreak } from "@/lib/store";
import { MOODS } from "@/data/quotes";

export const Route = createFileRoute("/app/profile")({ component: Profile });

function Profile() {
  const { favs } = useFavorites();
  const { hist } = useHistory();
  const { moods } = useMoodHistory();
  const streak = useStreak();

  const counts: Record<string, number> = {};
  moods.forEach(m => (counts[m.mood] = (counts[m.mood] || 0) + 1));
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = sorted[0]?.[1] ?? 1;

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-5">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-brand font-display text-2xl text-primary-foreground shadow-glow">M</div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Profile</div>
          <h1 className="mt-0.5 font-display text-3xl font-semibold">Your <span className="text-gradient">journey</span></h1>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={Flame} label="Streak" value={`${streak}d`} />
        <Stat icon={Heart} label="Saved" value={String(favs.length)} />
        <Stat icon={History} label="Viewed" value={String(hist.length)} />
        <Stat icon={Sparkles} label="Top mood" value={sorted[0]?.[0] ?? "—"} />
      </section>

      <section className="glass rounded-3xl p-6">
        <h2 className="mb-4 font-display text-lg">Mood breakdown</h2>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">Explore moods to see your stats here.</p>
        ) : (
          <ul className="space-y-3">
            {sorted.map(([m, n]) => {
              const meta = MOODS.find(x => x.id === m);
              return (
                <li key={m} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-sm capitalize">{meta?.emoji} {m}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-gradient-brand" style={{ width: `${(n / max) * 100}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs text-muted-foreground">{n}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Flame; label: string; value: string }) {
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
