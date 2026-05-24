import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, Heart, Wand2, Volume2, Search, Image as ImageIcon } from "lucide-react";
import { BackgroundFX } from "@/components/BackgroundFX";
import { quoteOfTheDay, MOODS } from "@/data/quotes";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MoodHub — AI Mood Quote Hub" },
      { name: "description", content: "Discover quotes by mood, generate aesthetic cards, listen aloud, and build your daily motivation streak." },
      { property: "og:title", content: "MoodHub — AI Mood Quote Hub" },
      { property: "og:description", content: "A premium quote experience tuned to how you feel." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [qotd, setQotd] = useState<ReturnType<typeof quoteOfTheDay> | null>(null);
  useEffect(() => { setQotd(quoteOfTheDay()); }, []);
  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundFX />
      {/* Nav */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold">Mood<span className="text-gradient">Hub</span></span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#qotd" className="hover:text-foreground">Quote of the day</a>
          <a href="#moods" className="hover:text-foreground">Moods</a>
        </nav>
        <Link to="/app" className="group inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-2 text-sm font-medium text-primary-foreground shadow-glow transition hover:scale-[1.02]">
          Open app <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-10 md:pt-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Now with AI card studio & TTS
          </div>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Quotes that match <span className="text-gradient">how you feel</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
            A premium mood-aware motivation hub. Pick a feeling, discover quotes, save favorites, design shareable cards, and build a daily streak.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/app/explore" className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition hover:scale-[1.02]">
              Explore by mood <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/app/generator" className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-medium text-foreground transition hover:bg-secondary">
              Try the generator
            </Link>
          </div>
        </motion.div>

        {/* Quote of the day */}
        <motion.div id="qotd"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }}
          className="mx-auto mt-16 max-w-3xl">
          <div className="relative rounded-3xl glass-strong p-8 shadow-glow md:p-12">
            <div className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Quote of the day</div>
            {qotd ? (
              <>
                <p className="font-display text-3xl leading-tight md:text-4xl">
                  <span className="text-gradient">"</span>{qotd.text}<span className="text-gradient">"</span>
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">— {qotd.author}</div>
                  <Link to="/app" className="text-sm text-primary hover:underline">Open dashboard →</Link>
                </div>
              </>
            ) : (
              <div className="h-24 animate-pulse rounded-xl bg-muted/40" />
            )}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Built for the feels</div>
            <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Everything you need to stay inspired</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Sparkles, title: "Mood-aware quotes", body: "Pick from 10 moods — from heartbroken to coding flow — and get curated lines." },
            { icon: Wand2, title: "Aesthetic card studio", body: "Generate Instagram-ready quote cards with gradients, fonts and one-click export." },
            { icon: Volume2, title: "Listen aloud", body: "Built-in text-to-speech reads your quote with natural voices." },
            { icon: Heart, title: "Favorites & collections", body: "Save lines that hit, organize them, and revisit on rough days." },
            { icon: Search, title: "Search everything", body: "Find by author, keyword, mood, or vibe — instantly." },
            { icon: ImageIcon, title: "Daily streak", body: "Open the app daily to grow your motivation streak." },
          ].map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="glass group rounded-2xl p-6 transition hover:shadow-glow">
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
                <f.icon className="h-4 w-4" />
              </div>
              <div className="font-display text-lg">{f.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Moods */}
      <section id="moods" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 text-center">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Find your vibe</div>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Pick a mood, get a quote</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            From motivation to heartbreak, each mood has a curated collection of quotes to match exactly how you feel right now.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {MOODS.map((mood, i) => (
            <motion.div
              key={mood.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to="/app/explore"
                search={{ mood: mood.id }}
                className="group flex flex-col items-center gap-2 rounded-2xl glass p-5 transition hover:shadow-glow"
              >
                <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${mood.gradient} text-xl shadow-lg`}>
                  {mood.emoji}
                </div>
                <span className="text-sm font-medium text-foreground">{mood.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        Crafted with care · MoodHub © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
