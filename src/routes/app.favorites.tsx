import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/store";
import { QuoteCard } from "@/components/QuoteCard";

export const Route = createFileRoute("/app/favorites")({ component: Favs });

function Favs() {
  const { favs } = useFavorites();
  return (
    <div className="space-y-8">
      <header>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Collection</div>
        <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">Your <span className="text-gradient">favorites</span></h1>
      </header>
      {favs.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
            <Heart className="h-6 w-6" />
          </div>
          <h3 className="font-display text-xl">No favorites yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Tap the heart on any quote to save it here.</p>
          <Link to="/app/explore" className="mt-6 inline-flex rounded-full bg-gradient-brand px-5 py-2.5 text-sm text-primary-foreground shadow-glow">Discover quotes</Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {favs.map((q, i) => <QuoteCard key={q.id} quote={q} index={i} />)}
        </div>
      )}
    </div>
  );
}
