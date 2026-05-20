import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shuffle, Volume2, Heart } from "lucide-react";
import { MOODS, randomQuote, type Mood, type Quote } from "@/data/quotes";
import { useFavorites, useHistory } from "@/lib/store";
import { speak } from "@/lib/tts";

export const Route = createFileRoute("/app/generator")({ component: Generator });

function useTypewriter(text: string, speed = 18) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut(""); let i = 0;
    const t = setInterval(() => {
      i++; setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return out;
}

function Generator() {
  const [mood, setMood] = useState<Mood | "any">("any");
  const [quote, setQuote] = useState<Quote>(() => randomQuote());
  const [spin, setSpin] = useState(false);
  const text = useTypewriter(quote.text);
  const { isFav, toggle } = useFavorites();
  const { push } = useHistory();

  useEffect(() => { push(quote); /* eslint-disable-next-line */ }, [quote]);

  const shuffle = () => {
    setSpin(true);
    setTimeout(() => {
      setQuote(randomQuote(mood === "any" ? undefined : mood));
      setSpin(false);
    }, 250);
  };

  return (
    <div className="space-y-8">
      <header>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Generator</div>
        <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">Roll the <span className="text-gradient">dice</span></h1>
      </header>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setMood("any")} className={`rounded-full border px-3 py-1.5 text-sm ${mood === "any" ? "border-transparent bg-gradient-brand text-primary-foreground shadow-glow" : "border-border glass"}`}>Any</button>
        {MOODS.map(m => (
          <button key={m.id} onClick={() => setMood(m.id)}
            className={`rounded-full border px-3 py-1.5 text-sm ${mood === m.id ? "border-transparent bg-gradient-brand text-primary-foreground shadow-glow" : "border-border glass"}`}>
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-3xl glass-strong p-8 shadow-glow md:p-14">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-brand opacity-20 blur-3xl" />
        <AnimatePresence mode="wait">
          <motion.div key={quote.id}
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
            transition={{ duration: 0.45 }}>
            <p className="font-display text-3xl leading-tight md:text-5xl">
              <span className="text-gradient">“</span>{text}<span className="animate-pulse">▍</span>
            </p>
            <div className="mt-6 text-sm text-muted-foreground">— {quote.author} · <span className="capitalize">{quote.mood}</span></div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={shuffle}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition hover:scale-[1.02]">
          <Shuffle className={`h-4 w-4 transition ${spin ? "rotate-180" : ""}`} /> Shuffle
        </button>
        <button onClick={() => speak(quote.text)} className="inline-flex items-center gap-2 rounded-full glass px-5 py-3 text-sm">
          <Volume2 className="h-4 w-4" /> Listen
        </button>
        <button onClick={() => toggle(quote)} className={`inline-flex items-center gap-2 rounded-full glass px-5 py-3 text-sm ${isFav(quote.id) ? "text-accent" : ""}`}>
          <Heart className={`h-4 w-4 ${isFav(quote.id) ? "fill-current" : ""}`} /> {isFav(quote.id) ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}
