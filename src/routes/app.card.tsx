import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Download, Shuffle } from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { QUOTES, randomQuote, type Quote } from "@/data/quotes";

const THEMES = [
  { name: "Aurora", bg: "linear-gradient(135deg,#0f172a,#312e81 40%,#9333ea)" , fg: "#ffffff" },
  { name: "Sunset", bg: "linear-gradient(135deg,#fb7185,#f97316,#facc15)", fg: "#1f1300" },
  { name: "Mint", bg: "linear-gradient(135deg,#0f766e,#06b6d4,#a7f3d0)", fg: "#04221e" },
  { name: "Mono", bg: "linear-gradient(135deg,#0a0a0a,#262626)", fg: "#fafafa" },
  { name: "Peach", bg: "linear-gradient(135deg,#fde68a,#fca5a5,#f472b6)", fg: "#3b0d2a" },
  { name: "Cyber", bg: "linear-gradient(135deg,#020617,#1e3a8a,#22d3ee)", fg: "#e2f3ff" },
];
const FONTS = [
  { name: "Display", className: "font-display" },
  { name: "Sans", className: "font-sans" },
  { name: "Serif", className: "font-serif" },
];

export const Route = createFileRoute("/app/card")({ component: Studio });

function Studio() {
  const [quote, setQuote] = useState<Quote>(() => QUOTES[0]);
  const [theme, setTheme] = useState(THEMES[0]);
  const [font, setFont] = useState(FONTS[0]);
  const ref = useRef<HTMLDivElement>(null);

  const exportPng = async () => {
    if (!ref.current) return;
    try {
      const url = await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.href = url; a.download = `moodhub-${quote.id}.png`; a.click();
      toast.success("Downloaded");
    } catch { toast.error("Export failed"); }
  };

  return (
    <div className="space-y-8">
      <header>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Card Studio</div>
        <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">Design a <span className="text-gradient">shareable</span> card</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Canvas */}
        <div className="grid place-items-center">
          <div ref={ref} className="relative aspect-square w-full max-w-[520px] overflow-hidden rounded-3xl shadow-glow"
            style={{ backgroundImage: theme.bg, color: theme.fg }}>
            <div className="absolute inset-0 grid place-items-center p-10 text-center">
              <div>
                <p className={`${font.className} text-2xl leading-tight md:text-3xl`}>
                  “{quote.text}”
                </p>
                <div className="mt-6 text-xs uppercase tracking-[0.3em] opacity-80">— {quote.author}</div>
              </div>
            </div>
            <div className="absolute bottom-4 right-5 text-[10px] uppercase tracking-[0.3em] opacity-60">MoodHub</div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-5">
          <div>
            <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Quote</div>
            <select value={quote.id} onChange={e => setQuote(QUOTES.find(q => q.id === e.target.value)!)}
              className="w-full rounded-xl glass px-3 py-2.5 text-sm outline-none">
              {QUOTES.map(q => <option key={q.id} value={q.id}>{q.author} — {q.text.slice(0, 40)}…</option>)}
            </select>
            <button onClick={() => setQuote(randomQuote())} className="mt-2 inline-flex items-center gap-2 rounded-full glass px-3 py-2 text-xs"><Shuffle className="h-3 w-3" /> Random</button>
          </div>
          <div>
            <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Theme</div>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map(t => (
                <button key={t.name} onClick={() => setTheme(t)}
                  className={`h-14 rounded-xl border ${theme.name === t.name ? "ring-glow border-transparent" : "border-border"}`}
                  style={{ backgroundImage: t.bg }} title={t.name} />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Font</div>
            <div className="flex gap-2">
              {FONTS.map(f => (
                <button key={f.name} onClick={() => setFont(f)} className={`flex-1 rounded-xl border px-3 py-2 text-sm ${font.name === f.name ? "border-transparent bg-gradient-brand text-primary-foreground" : "border-border glass"} ${f.className}`}>{f.name}</button>
              ))}
            </div>
          </div>
          <button onClick={exportPng}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow transition hover:scale-[1.01]">
            <Download className="h-4 w-4" /> Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}
