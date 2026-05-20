import { Heart, Share2, Volume2, Copy } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Quote } from "@/data/quotes";
import { useFavorites } from "@/lib/store";
import { speak } from "@/lib/tts";

interface Props { quote: Quote; index?: number; }

export function QuoteCard({ quote, index = 0 }: Props) {
  const { isFav, toggle } = useFavorites();
  const fav = isFav(quote.id);

  const share = async () => {
    const text = `"${quote.text}" — ${quote.author}`;
    if (navigator.share) { try { await navigator.share({ text }); return; } catch {} }
    await navigator.clipboard.writeText(text); toast.success("Copied to clipboard");
  };
  const copy = async () => { await navigator.clipboard.writeText(`"${quote.text}" — ${quote.author}`); toast.success("Copied"); };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="glass group relative overflow-hidden rounded-2xl p-6 transition-shadow hover:shadow-glow"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-brand opacity-10 blur-3xl transition-opacity group-hover:opacity-25" />
      <p className="font-display text-xl leading-snug text-foreground md:text-2xl">
        <span className="text-gradient">“</span>{quote.text}<span className="text-gradient">”</span>
      </p>
      <div className="mt-5 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">— {quote.author}</div>
        <div className="flex items-center gap-1">
          <IconBtn onClick={() => speak(quote.text)} label="Listen"><Volume2 className="h-4 w-4" /></IconBtn>
          <IconBtn onClick={copy} label="Copy"><Copy className="h-4 w-4" /></IconBtn>
          <IconBtn onClick={share} label="Share"><Share2 className="h-4 w-4" /></IconBtn>
          <IconBtn onClick={() => toggle(quote)} label="Favorite" active={fav}>
            <Heart className={`h-4 w-4 ${fav ? "fill-current" : ""}`} />
          </IconBtn>
        </div>
      </div>
      <span className="mt-4 inline-block rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs uppercase tracking-wider text-muted-foreground">{quote.mood}</span>
    </motion.article>
  );
}

function IconBtn({ children, onClick, label, active }: { children: React.ReactNode; onClick: () => void; label: string; active?: boolean; }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`grid h-9 w-9 place-items-center rounded-full border border-border transition-all hover:bg-secondary hover:text-primary ${active ? "text-accent" : "text-muted-foreground"}`}
    >
      {children}
    </button>
  );
}
