import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, Heart, Wand2, Volume2, Search, Image as ImageIcon } from "lucide-react";
import { CinematicBackground } from "@/components/CinematicBackground";
import { quoteOfTheDay } from "@/data/quotes";
import { useState, useEffect, useRef } from "react";

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
  const qotd = quoteOfTheDay();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const totalScrollable = rect.height - viewportHeight;

      if (totalScrollable <= 0) return;

      // Calculate scroll progress (0 at start, 1 when track is scrolled past)
      const progress = Math.max(0, Math.min(1, -rect.top / totalScrollable));
      targetProgressRef.current = progress;
    };

    let animFrameId: number;
    const updateProgress = () => {
      const diff = targetProgressRef.current - currentProgressRef.current;
      if (Math.abs(diff) > 0.0001) {
        currentProgressRef.current += diff * 0.08; // 0.08 gives a premium slow elastic ease
        setScrollProgress(currentProgressRef.current);
      } else if (currentProgressRef.current !== targetProgressRef.current) {
        currentProgressRef.current = targetProgressRef.current;
        setScrollProgress(currentProgressRef.current);
      }
      animFrameId = requestAnimationFrame(updateProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    updateProgress();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  // badgeStyle: Fades and slides up out of view immediately
  const badgeStyle = {
    opacity: Math.max(0, 1 - scrollProgress * 5),
    transform: `translateY(${-scrollProgress * 25}px)`,
  };

  // headlineStyle: Scales down, fades, slides up
  const headlineOpacity = Math.max(0.15, 1 - scrollProgress * 1.6);
  const headlineScale = 1 - scrollProgress * 0.12;
  const headlineTranslateY = -scrollProgress * 50;
  const headlineStyle = {
    opacity: headlineOpacity,
    transform: `scale(${headlineScale}) translateY(${headlineTranslateY}px)`,
  };

  // descriptionStyle: Reveals with elegant blur + fade-up
  let descOpacity = 0;
  let descBlur = 8;
  let descTranslateY = 20;
  if (scrollProgress >= 0.15) {
    const p = Math.min(1, (scrollProgress - 0.15) / 0.35);
    descOpacity = p;
    descBlur = 8 * (1 - p);
    descTranslateY = 20 * (1 - p);
  }
  const descriptionStyle = {
    opacity: descOpacity,
    filter: `blur(${descBlur}px)`,
    transform: `translateY(${descTranslateY}px)`,
  };

  // buttonsStyle: Staggered reveal with glow
  let buttonsOpacity = 0;
  let buttonsScale = 0.93;
  let buttonsTranslateY = 15;
  if (scrollProgress >= 0.35) {
    const p = Math.min(1, (scrollProgress - 0.35) / 0.35);
    buttonsOpacity = p;
    buttonsScale = 0.93 + 0.07 * p;
    buttonsTranslateY = 15 * (1 - p);
  }
  const buttonsStyle = {
    opacity: buttonsOpacity,
    transform: `scale(${buttonsScale}) translateY(${buttonsTranslateY}px)`,
  };

  return (
    <div className="relative min-h-screen">
      {/* Scroll track wrapper for scroll-activated storytelling hero (220vh tall) */}
      <div ref={scrollContainerRef} className="relative h-[220vh] z-0">
        
        {/* Sticky container that stays fixed in viewport while user scrolls */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between bg-[#0c0514]">
          <CinematicBackground scrollProgress={scrollProgress} />
          
          {/* Nav */}
          <header className="relative z-10 mx-auto w-full max-w-7xl items-center justify-between px-6 py-6 flex">
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

          {/* Hero Content Area */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
            <div className="mx-auto max-w-3xl text-center">
              <div 
                style={badgeStyle} 
                className="mb-5 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Now with AI card studio & TTS
              </div>
              <h1 
                style={headlineStyle}
                className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl will-change-transform"
              >
                Quotes that match <span className="text-gradient">how you feel</span>.
              </h1>
              <p 
                style={descriptionStyle}
                className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground md:text-lg transition-all duration-300 ease-out will-change-transform"
              >
                A premium mood-aware motivation hub. Pick a feeling, discover quotes, save favorites, design shareable cards, and build a daily streak.
              </p>
              <div 
                style={buttonsStyle}
                className="mt-8 flex flex-wrap items-center justify-center gap-3 transition-all duration-500 ease-out will-change-transform"
              >
                <Link to="/app/explore" className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition hover:scale-[1.02]">
                  Explore by mood <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/app/generator" className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-medium text-foreground transition hover:bg-secondary">
                  Try the generator
                </Link>
              </div>
            </div>
          </div>

          {/* Seamless bottom fade mask to blend perfectly with solid background when scrolling */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Quote of the day (Placed outside the hero background so it scrolls up naturally) */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:py-24">
        <motion.div id="qotd"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }}
          className="mx-auto max-w-3xl">
          <div className="relative rounded-3xl glass-strong p-8 shadow-glow md:p-12">
            <div className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Quote of the day</div>
            <p className="font-display text-3xl leading-tight md:text-4xl">
              <span className="text-gradient">“</span>{qotd.text}<span className="text-gradient">”</span>
            </p>
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">— {qotd.author}</div>
              <Link to="/app" className="text-sm text-primary hover:underline">Open dashboard →</Link>
            </div>
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

<footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
  <span>
    Developed with ❤️ by{" "}
    <a
      href="https://linkedin.com/in/bipin-yadav-612b102bb"
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium underline underline-offset-4 transition hover:text-cyan-400"
    >
      Bipin Yadav
    </a>
  </span>
</footer>
    </div>
  );
}
