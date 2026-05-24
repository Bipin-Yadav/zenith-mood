import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Wind, Info } from "lucide-react";

type BreathingPhase = "idle" | "inhale" | "holdIn" | "exhale" | "holdOut";

type BreathingMode = {
  name: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  description: string;
};

const MODES: BreathingMode[] = [
  { name: "Box Breathing", inhale: 4, holdIn: 4, exhale: 4, holdOut: 4, description: "Resets the nervous system, clears stress, and boosts mental focus." },
  { name: "Relax (4-7-8)", inhale: 4, holdIn: 7, exhale: 8, holdOut: 0, description: "A natural tranquilizer that helps calm racing thoughts and anxiety." },
  { name: "Equal Breath", inhale: 4, holdIn: 0, exhale: 4, holdOut: 0, description: "Balances energy levels, relaxes the mind, and centers your awareness." },
];

export function BreathingBubble() {
  const [activeModeIdx, setActiveModeIdx] = useState(0);
  const [phase, setPhase] = useState<BreathingPhase>("idle");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);

  const activeMode = MODES[activeModeIdx];
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize Audio Context safely on user interaction
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const gainNode = audioCtxRef.current.createGain();
      gainNode.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      gainNode.connect(audioCtxRef.current.destination);
      gainNodeRef.current = gainNode;
    }
  };

  const playTone = (frequency: number, duration: number, type: "sine" | "triangle" = "triangle") => {
    if (!soundEnabled || !audioCtxRef.current || !gainNodeRef.current) return;
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }

      // Resume context if suspended (browser security)
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      const osc = audioCtxRef.current.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, audioCtxRef.current.currentTime);
      
      const gain = gainNodeRef.current;
      gain.gain.cancelScheduledValues(audioCtxRef.current.currentTime);
      
      // Gentle fade-in and fade-out to sound extremely premium
      gain.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, audioCtxRef.current.currentTime + 0.15);
      gain.gain.setValueAtTime(0.04, audioCtxRef.current.currentTime + duration - 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + duration);

      osc.connect(gain);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + duration);
      oscillatorRef.current = osc;
    } catch (e) {
      console.warn("Audio error:", e);
    }
  };

  const stopTone = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.cancelScheduledValues(audioCtxRef.current.currentTime);
      gainNodeRef.current.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.1);
    }
  };

  // Main breathing engine loop
  useEffect(() => {
    if (!isPlaying) {
      setPhase("idle");
      stopTone();
      return;
    }

    let timer: NodeJS.Timeout;
    
    const runPhase = () => {
      // 1. Determine next phase
      let nextPhase: BreathingPhase = "inhale";
      let nextDuration = activeMode.inhale;

      if (phase === "idle" || phase === "holdOut") {
        nextPhase = "inhale";
        nextDuration = activeMode.inhale;
        // Low warm ambient frequency rising up
        playTone(220, nextDuration, "triangle");
      } else if (phase === "inhale") {
        if (activeMode.holdIn > 0) {
          nextPhase = "holdIn";
          nextDuration = activeMode.holdIn;
          // Constant soothing background drone
          playTone(277.18, nextDuration, "sine");
        } else {
          nextPhase = "exhale";
          nextDuration = activeMode.exhale;
          // Declining relaxing pitch
          playTone(196, nextDuration, "triangle");
        }
      } else if (phase === "holdIn") {
        nextPhase = "exhale";
        nextDuration = activeMode.exhale;
        playTone(196, nextDuration, "triangle");
      } else if (phase === "exhale") {
        if (activeMode.holdOut > 0) {
          nextPhase = "holdOut";
          nextDuration = activeMode.holdOut;
          playTone(164.81, nextDuration, "sine");
        } else {
          nextPhase = "inhale";
          nextDuration = activeMode.inhale;
          setCompletedCycles(c => c + 1);
          playTone(220, nextDuration, "triangle");
        }
      }

      setPhase(nextPhase);
      setTimeLeft(nextDuration);
    };

    if (phase === "idle") {
      runPhase();
    } else {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Wait slightly for audio scheduling before advancing phase
            setTimeout(runPhase, 50);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timer);
      stopTone();
    };
  }, [isPlaying, phase, activeModeIdx]);

  // Handle phase changes sound cues
  useEffect(() => {
    if (!isPlaying) return;
    // Just a safety check to shut off oscillators if phase goes idle
    if (phase === "idle") {
      stopTone();
    }
  }, [phase, isPlaying]);

  const toggleSound = () => {
    initAudio();
    setSoundEnabled(prev => !prev);
  };

  const startSession = () => {
    initAudio();
    setIsPlaying(true);
    setPhase("idle");
  };

  const pauseSession = () => {
    setIsPlaying(false);
    setPhase("idle");
    stopTone();
  };

  const resetSession = () => {
    setIsPlaying(false);
    setPhase("idle");
    setTimeLeft(0);
    setCompletedCycles(0);
    stopTone();
  };

  // Visual text helper for the breathing state
  const getPhaseText = () => {
    switch (phase) {
      case "inhale":
        return "Breathe In";
      case "holdIn":
        return "Hold";
      case "exhale":
        return "Breathe Out";
      case "holdOut":
        return "Hold";
      default:
        return "Ready?";
    }
  };

  // Animation values based on current phase
  const getBubbleScale = () => {
    switch (phase) {
      case "inhale":
        return 1.45;
      case "holdIn":
        return 1.45;
      case "exhale":
        return 0.85;
      case "holdOut":
        return 0.85;
      default:
        return 1.0;
    }
  };

  const getBubbleTransition = () => {
    if (phase === "inhale") return { duration: activeMode.inhale, ease: "easeInOut" };
    if (phase === "exhale") return { duration: activeMode.exhale, ease: "easeInOut" };
    return { duration: 0.8 }; // Steady state or idle transitions
  };

  return (
    <div className="relative overflow-hidden rounded-3xl glass-strong p-6 shadow-glow md:p-8">
      {/* Background radial glow matching phase */}
      <div 
        className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-gradient-brand opacity-15 blur-3xl transition-all duration-1000"
        style={{
          transform: phase === "inhale" || phase === "holdIn" ? "scale(1.5)" : "scale(0.8)"
        }}
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Left column: Setup controls */}
        <div className="flex flex-1 flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">
                <Wind className="h-3 w-3" /> Mindfulness
              </span>
              {completedCycles > 0 && (
                <span className="text-xs text-muted-foreground">
                  Cycles: {completedCycles}
                </span>
              )}
            </div>
            <h3 className="mt-2 font-display text-2xl font-semibold">Breathing Space</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              Sync your breathing to slow your heart rate, reset your nervous system, and find instant calm.
            </p>
          </div>

          {/* Mode selections */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Select Method</label>
            <div className="flex flex-wrap gap-1.5">
              {MODES.map((m, idx) => (
                <button
                  key={m.name}
                  disabled={isPlaying}
                  onClick={() => {
                    setActiveModeIdx(idx);
                    resetSession();
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                    activeModeIdx === idx
                      ? "bg-secondary text-foreground ring-1 ring-glow"
                      : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground disabled:opacity-50"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground/80 italic flex items-start gap-1 max-w-xs mt-1">
              <Info className="h-3 w-3 mt-0.5 shrink-0" />
              {activeMode.description}
            </p>
          </div>

          {/* Buttons & Sound controls */}
          <div className="flex items-center gap-3 pt-2">
            {!isPlaying ? (
              <button
                onClick={startSession}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition hover:scale-[1.02]"
              >
                <Play className="h-4 w-4 fill-primary-foreground" /> Start Breathing
              </button>
            ) : (
              <button
                onClick={pauseSession}
                className="inline-flex items-center gap-2 rounded-full border border-border glass px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary"
              >
                <Pause className="h-4 w-4" /> Pause
              </button>
            )}

            <button
              onClick={resetSession}
              className="grid h-10 w-10 place-items-center rounded-full border border-border glass text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              title="Reset session"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={toggleSound}
              className={`grid h-10 w-10 place-items-center rounded-full border transition ${
                soundEnabled 
                  ? "bg-primary/10 border-primary/30 text-primary" 
                  : "border-border glass text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              title={soundEnabled ? "Mute audio cues" : "Enable sound therapy"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Right column: Interactive Visual Bubble */}
        <div className="flex flex-1 items-center justify-center py-6 lg:py-0">
          <div className="relative flex h-56 w-56 items-center justify-center">
            
            {/* Pulsing visual outer rings */}
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0.1, scale: 0.9 }}
                  animate={{ 
                    opacity: phase === "inhale" || phase === "holdIn" ? 0.3 : 0.08,
                    scale: getBubbleScale() * 1.25,
                  }}
                  transition={getBubbleTransition()}
                  className="absolute inset-0 rounded-full bg-gradient-brand blur-xl"
                />
              )}
            </AnimatePresence>

            {/* Main breathing bubble */}
            <motion.div
              animate={{
                scale: getBubbleScale(),
              }}
              transition={getBubbleTransition()}
              className="relative z-10 flex h-36 w-36 flex-col items-center justify-center rounded-full bg-gradient-brand shadow-glow text-primary-foreground"
            >
              {/* Inner bubble wave motion */}
              <div className="absolute inset-2 rounded-full border border-white/20 bg-black/10 backdrop-blur-sm" />
              
              <div className="relative z-10 text-center">
                <span className="font-display text-[15px] font-bold tracking-wide uppercase drop-shadow-sm">
                  {getPhaseText()}
                </span>
                
                {isPlaying && timeLeft > 0 && (
                  <motion.div
                    key={timeLeft}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-semibold mt-0.5 opacity-90"
                  >
                    {timeLeft}s
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Circular step indicators */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg className="h-48 w-48 -rotate-90" viewBox="0 0 100 100">
                {/* Track circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-muted/20"
                  strokeWidth="2.5"
                  fill="transparent"
                />
                
                {/* Active progress circle */}
                {isPlaying && timeLeft > 0 && (
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="stroke-primary"
                    strokeWidth="2.5"
                    fill="transparent"
                    strokeDasharray="282.7"
                    initial={{ strokeDashoffset: 282.7 }}
                    animate={{
                      strokeDashoffset: 282.7 - (282.7 * (timeLeft - 1)) / (
                        phase === "inhale" ? activeMode.inhale :
                        phase === "holdIn" ? activeMode.holdIn :
                        phase === "exhale" ? activeMode.exhale :
                        activeMode.holdOut
                      )
                    }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                )}
              </svg>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
