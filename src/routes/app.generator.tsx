import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shuffle, Volume2, Heart, Sparkles, Brain, Key, AlertCircle, CheckCircle2, Eye, EyeOff, ExternalLink, Settings } from "lucide-react";
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

  // Gemini AI States
  const [mode, setMode] = useState<"classic" | "ai">("classic");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("zenith_mood_gemini_key") || "");
  const [tempKey, setTempKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => { push(quote); /* eslint-disable-next-line */ }, [quote]);

  // Handle quote generation (Classic Local or Real Gemini AI)
  const generateQuote = async () => {
    if (mode === "classic") {
      setSpin(true);
      setApiError(null);
      setTimeout(() => {
        setQuote(randomQuote(mood === "any" ? undefined : mood));
        setSpin(false);
      }, 250);
      return;
    }

    // AI Mode validation
    if (!apiKey) {
      setApiError("Please configure your Gemini API key below to start using real AI generation.");
      return;
    }

    setSpin(true);
    setIsGenerating(true);
    setApiError(null);

    try {
      const activeMood = mood === "any" ? "a deeply inspiring, aesthetic" : mood;
      const promptText = `Generate a deeply meaningful, aesthetic, and inspiring quote suited exactly for someone feeling: ${activeMood}.
The quote should be mature, comforting, original, and avoid generic clichés. Do not wrap the quote in double quotes in your text return.
Return the output strictly in valid JSON format.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  text: { type: "STRING" },
                  author: { type: "STRING" }
                },
                required: ["text", "author"]
              }
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}. Please check if your key is valid.`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) {
        throw new Error("Gemini returned an empty response. Please try again.");
      }

      const parsed = JSON.parse(textResponse);
      if (!parsed.text || !parsed.author) {
        throw new Error("Response JSON didn't contain text or author fields.");
      }

      setQuote({
        id: `ai-${Date.now()}`,
        text: parsed.text,
        author: parsed.author,
        mood: mood === "any" ? "AI Mind" : mood
      });
    } catch (err: any) {
      console.error("AI Generation error:", err);
      setApiError(err.message || "Failed to generate AI quote. Please check your network or API key.");
    } finally {
      setSpin(false);
      setIsGenerating(false);
    }
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = tempKey.trim();
    if (cleanKey) {
      localStorage.setItem("zenith_mood_gemini_key", cleanKey);
      setApiKey(cleanKey);
      setApiError(null);
      setShowSettings(false);
    }
  };

  const handleDeleteKey = () => {
    localStorage.removeItem("zenith_mood_gemini_key");
    setApiKey("");
    setTempKey("");
    setApiError(null);
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Studio</div>
          <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">Quote <span className="text-gradient">Generator</span></h1>
        </div>
        <button
          onClick={() => {
            setTempKey(apiKey);
            setShowSettings(!showSettings);
          }}
          className={`grid h-10 w-10 place-items-center rounded-full border transition ${
            showSettings ? "bg-primary/10 border-primary/30 text-primary" : "border-border glass text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
          title="AI Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </header>

      {/* Mode Switcher */}
      <div className="flex max-w-xs rounded-full border border-border bg-[#0d071a]/60 p-1">
        <button
          onClick={() => {
            setMode("classic");
            setApiError(null);
          }}
          className={`flex-1 rounded-full py-1.5 text-xs font-medium transition ${
            mode === "classic" ? "bg-secondary text-foreground ring-1 ring-glow" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Classic library
        </button>
        <button
          onClick={() => {
            setMode("ai");
            setTempKey(apiKey);
          }}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-medium transition ${
            mode === "ai" ? "bg-gradient-brand text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 fill-current" /> Real AI (Gemini)
        </button>
      </div>

      {/* API Key Panel (Collapsible Settings or prompt inside the container) */}
      <AnimatePresence>
        {(showSettings || (mode === "ai" && !apiKey)) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/20 text-primary">
                  <Key className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground">Configure Google Gemini API</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Zenith Mood uses Google's Gemini 2.5 Flash model directly from your browser. Get a 100% free API key in seconds from AI Studio.
                  </p>
                </div>
              </div>

              {apiKey ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-success/30 bg-success/5 px-4 py-3 text-xs text-success-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Gemini 2.5 Flash API Key is Active</span>
                  </div>
                  <button onClick={handleDeleteKey} className="text-xs font-semibold text-muted-foreground hover:text-destructive transition underline">
                    Remove Key
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveKey} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKey ? "text" : "password"}
                      value={tempKey}
                      onChange={e => setTempKey(e.target.value)}
                      placeholder="Paste your Gemini API key (AIzaSy...)"
                      className="w-full rounded-xl border border-border bg-black/40 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!tempKey.trim()}
                    className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/95 disabled:opacity-50"
                  >
                    Save Key
                  </button>
                </form>
              )}

              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
              >
                Get your free Gemini Key from Google AI Studio <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mood selections */}
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Select Mood / Vibe</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setMood("any")}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              mood === "any" ? "border-transparent bg-secondary text-foreground ring-1 ring-glow" : "border-border glass hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            Any Vibe
          </button>
          {MOODS.map(m => (
            <button
              key={m.id}
              onClick={() => setMood(m.id)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                mood === m.id ? "border-transparent bg-gradient-brand text-primary-foreground shadow-glow" : "border-border glass hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {apiError && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive-foreground">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Generation Error</p>
            <p className="text-muted-foreground">{apiError}</p>
          </div>
        </div>
      )}

      {/* Main Quote Screen */}
      <div className="relative overflow-hidden rounded-3xl glass-strong p-8 shadow-glow md:p-14 min-h-[16rem] flex flex-col justify-center">
        {/* Floating gradient glow behind quote */}
        <div 
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-brand blur-3xl transition-opacity duration-700" 
          style={{ opacity: isGenerating ? 0.35 : 0.15 }}
        />

        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-4"
            >
              <div className="relative flex h-12 w-12 items-center justify-center">
                <div className="absolute h-8 w-8 animate-ping rounded-full bg-primary/20" />
                <Brain className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <div className="text-center">
                <span className="font-display text-sm font-semibold tracking-wider uppercase text-gradient animate-pulse">
                  Gemini is thinking...
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">Synthesizing deep original reflection</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 0.45 }}
              className="flex-1 flex flex-col justify-between"
            >
              <p className="font-display text-3xl leading-tight md:text-5xl">
                <span className="text-gradient">“</span>{text}<span className="animate-pulse">▍</span>
              </p>
              <div className="mt-6 text-sm text-muted-foreground">
                — {quote.author} · <span className="capitalize">{quote.mood === "AI Mind" ? "AI Generated" : quote.mood}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interactive Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={generateQuote}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition hover:scale-[1.02] disabled:opacity-50"
        >
          {mode === "ai" ? (
            <Brain className={`h-4 w-4 ${spin ? "animate-spin" : ""}`} />
          ) : (
            <Shuffle className={`h-4 w-4 transition ${spin ? "rotate-180" : ""}`} />
          )}
          {mode === "ai" ? "Generate with AI" : "Roll classic dice"}
        </button>

        <button
          onClick={() => speak(quote.text)}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 rounded-full glass px-5 py-3 text-sm transition hover:bg-secondary disabled:opacity-50"
        >
          <Volume2 className="h-4 w-4" /> Listen
        </button>

        <button
          onClick={() => toggle(quote)}
          disabled={isGenerating}
          className={`inline-flex items-center gap-2 rounded-full glass px-5 py-3 text-sm transition hover:bg-secondary disabled:opacity-50 ${
            isFav(quote.id) ? "text-accent" : ""
          }`}
        >
          <Heart className={`h-4 w-4 ${isFav(quote.id) ? "fill-current" : ""}`} /> {isFav(quote.id) ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}
