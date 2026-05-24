import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Loader2 } from "lucide-react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  alpha: number;
  maxAlpha: number;
  color: string;
}

const TOTAL_FRAMES = 240;
const INITIAL_THRESHOLD = 25; // Number of frames to load before starting playback
const FRAME_RATE = 24; // FPS
const FRAME_INTERVAL = 1000 / FRAME_RATE;

export interface CinematicBackgroundProps {
  scrollProgress?: number;
}

export function CinematicBackground({ scrollProgress = 0 }: CinematicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const currentFrameIdxRef = useRef<number>(0);
  const idleFrameRef = useRef<number>(0);
  const lastScrollProgressRef = useRef<number>(0);

  const scrollProgressRef = useRef(scrollProgress);
  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  const [loadedCount, setLoadedCount] = useState(0);
  const [readyToPlay, setReadyToPlay] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  // Progressive frame preloading
  useEffect(() => {
    let active = true;
    const images: HTMLImageElement[] = [];

    const loadFrame = (idx: number) => {
      if (idx > TOTAL_FRAMES || !active) return;

      const img = new Image();
      // Path matches the public folder structure: /public/ezgif-frame/ezgif-frame-001.jpg
      const paddedNum = String(idx).padStart(3, "0");
      img.src = `/ezgif-frame/ezgif-frame-${paddedNum}.jpg`;

      img.onload = () => {
        if (!active) return;
        imagesRef.current[idx - 1] = img;
        setLoadedCount(prev => {
          const next = prev + 1;
          if (next >= INITIAL_THRESHOLD && !readyToPlay) {
            setReadyToPlay(true);
          }
          return next;
        });
        // Load next frame sequentially to avoid browser thread clogging
        loadFrame(idx + 1);
      };

      img.onerror = () => {
        console.warn(`Failed to load frame ${idx}`);
        // Attempt to skip and load next
        if (active) loadFrame(idx + 1);
      };
    };

    // Kickstart sequential preloading
    loadFrame(1);

    return () => {
      active = false;
    };
  }, []);

  // Canvas drawing & particle loop
  useEffect(() => {
    if (!readyToPlay) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize particles matching the cyberpunk neon color scheme
    const colors = [
      "rgba(6, 182, 212,",   // Cyan / Neon Blue
      "rgba(168, 85, 247,",  // Purple
      "rgba(236, 72, 153,",  // Magenta
    ];

    const createParticle = (isInitial = false): Particle => {
      const parent = canvas.parentElement;
      const w = parent ? parent.getBoundingClientRect().width : window.innerWidth;
      const h = parent ? parent.getBoundingClientRect().height : window.innerHeight;
      const maxAlpha = Math.random() * 0.4 + 0.15;
      return {
        x: Math.random() * w,
        y: isInitial ? Math.random() * h : h + 20,
        size: Math.random() * 2.5 + 0.8,
        speedY: -(Math.random() * 0.4 + 0.15),
        speedX: (Math.random() - 0.5) * 0.25,
        alpha: isInitial ? Math.random() * maxAlpha : 0,
        maxAlpha,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    };

    // Populate initial particles
    particlesRef.current = Array.from({ length: 35 }, () => createParticle(true));

    const draw = (timestamp: number) => {
      const parent = canvas.parentElement;
      if (!parent) {
        animationFrameIdRef.current = requestAnimationFrame(draw);
        return;
      }
      const rect = parent.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // Handle framerate capping for ultra-smooth rendering & CPU friendliness
      if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
      const elapsed = timestamp - lastFrameTimeRef.current;

      if (elapsed >= FRAME_INTERVAL) {
        const currentScroll = scrollProgressRef.current;
        
        // Calculate scroll velocity (the absolute change in scroll progress)
        const scrollDelta = Math.abs(currentScroll - lastScrollProgressRef.current);
        lastScrollProgressRef.current = currentScroll;

        // Base slow idle movement (adds a tiny bit of frames so it breathes when stationary)
        // During active scrolling, the idle movement accelerates slightly
        const idleSpeed = 0.08 + Math.min(scrollDelta * 5, 0.4);
        idleFrameRef.current = (idleFrameRef.current + idleSpeed) % TOTAL_FRAMES;

        // Map scroll progress to sequence frames (we animate through 85% of the frames dynamically)
        const scrollFrameOffset = currentScroll * (TOTAL_FRAMES * 0.85);

        // Target frame is the combination of idle breathing + scroll progression
        const targetFrame = (idleFrameRef.current + scrollFrameOffset) % TOTAL_FRAMES;

        // Shortest-path looping frame interpolation
        let diff = targetFrame - currentFrameIdxRef.current;
        if (diff > TOTAL_FRAMES / 2) diff -= TOTAL_FRAMES;
        if (diff < -TOTAL_FRAMES / 2) diff += TOTAL_FRAMES;

        // Elastic follow damping (0.12 factor makes the background catch up with buttery momentum)
        currentFrameIdxRef.current = (currentFrameIdxRef.current + diff * 0.12 + TOTAL_FRAMES) % TOTAL_FRAMES;

        // Get the rounded frame index
        const currentIdx = Math.floor(currentFrameIdxRef.current);
        let img = imagesRef.current[currentIdx];

        // Fallback: search backwards if frame is still downloading
        if (!img) {
          for (let i = currentIdx; i >= 0; i--) {
            if (imagesRef.current[i]) {
              img = imagesRef.current[i];
              break;
            }
          }
        }

        // Draw image frame covering full canvas (cover fit logic)
        if (img) {
          const imgRatio = img.width / img.height;
          const canvasRatio = w / h;
          let drawWidth = w;
          let drawHeight = h;
          let drawX = 0;
          let drawY = 0;

          if (canvasRatio > imgRatio) {
            drawHeight = w / imgRatio;
            drawY = (h - drawHeight) / 2;
          } else {
            drawWidth = h * imgRatio;
            drawX = (w - drawWidth) / 2;
          }

          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        } else {
          // Absolute blank background safety fallback
          ctx.fillStyle = "#0c0514";
          ctx.fillRect(0, 0, w, h);
        }

        // Scroll Velocity Responsive VFX:
        // Particles speed up and glow brighter when scrolling, then settle back
        const speedFactor = 1.0 + Math.min(scrollDelta * 60, 2.8);
        const glowBoost = Math.min(scrollDelta * 1.5, 0.35);

        // Update & Render neon floating particles over video frames
        ctx.shadowBlur = 0; // Clear shadow settings for basic fills
        particlesRef.current.forEach((p, idx) => {
          // Update physics scaled by scroll speed
          p.y += p.speedY * speedFactor;
          p.x += p.speedX * speedFactor;

          // Gentle fade in / out
          if (p.y < h - 100) {
            p.alpha = Math.max(0, p.alpha - 0.003); // fade out near top
          } else if (p.alpha < p.maxAlpha) {
            p.alpha = Math.min(p.maxAlpha, p.alpha + 0.01); // fade in at bottom
          }

          // Emit new particle if dead or out of bounds
          if (p.y < -10 || p.x < -10 || p.x > w + 10 || p.alpha <= 0) {
            particlesRef.current[idx] = createParticle(false);
          }

          // Draw neon glowing particle (boosted by scroll velocity)
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          
          const activeAlpha = Math.min(0.9, p.alpha + glowBoost);
          ctx.fillStyle = `${p.color}${activeAlpha.toFixed(3)})`;
          
          // Volumetric glowing particle halo
          ctx.shadowColor = `${p.color}0.8)`;
          ctx.shadowBlur = p.size * 3 * (1.0 + glowBoost * 2);
          ctx.fill();
        });

        // Clear canvas shadow configuration
        ctx.shadowBlur = 0;

        lastFrameTimeRef.current = timestamp - (elapsed % FRAME_INTERVAL);
      }

      animationFrameIdRef.current = requestAnimationFrame(draw);
    };

    animationFrameIdRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [readyToPlay]);

  const percentLoaded = Math.min(100, Math.floor((loadedCount / TOTAL_FRAMES) * 100));

  return (
    <>
      {/* Hideous displacement mapping for water reflection shader effect */}
      <svg className="hidden">
        <defs>
          <filter id="water-displacement">
            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.05" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Main outer live wallpaper wrapper with parallax camera push-in and drift */}
      <div 
        aria-hidden 
        className="absolute inset-0 -z-10 overflow-hidden bg-[#0c0514]"
        style={{ transform: `translateY(${scrollProgress * 55}px) translateZ(0)` }}
      >
        
        {/* Canvas displaying active sequence frames and glowing particles */}
        <motion.canvas
          ref={canvasRef}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={readyToPlay ? { opacity: 1, scale: 1.03 } : {}}
          transition={{ duration: 1.8, ease: "easeOut" }}
          className="absolute inset-0 pointer-events-none origin-center transform anim-camera-drift"
        />

        {/* Volumetric premium lighting mask & holographic color pass-throughs */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,color-mix(in_oklab,var(--color-background)_80%,transparent)_100%)] pointer-events-none" />

        {/* Moving realistic foggy mist clouds */}
        <div className="absolute inset-0 opacity-[0.06] bg-gradient-to-t from-transparent via-cyan-500/30 to-purple-500/20 mix-blend-screen pointer-events-none blur-3xl anim-fog-slow" />

        {/* Damp cyberpunk wet reflections (Uses SVG displacement filter) */}
        <div 
          className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-[#0c0514]/90 via-[#0d071a]/40 to-transparent pointer-events-none opacity-85"
          style={{ filter: "url(#water-displacement)" }}
        />

        {/* Minimal grid lines matching cyberpunk look */}
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(var(--color-foreground)_1px,transparent_1px),linear-gradient(90deg,var(--color-foreground)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none" />

        {/* Global subtle holographic vignette screen overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0514]/15 via-transparent to-[#0c0514]/75 pointer-events-none" />
      </div>

      {/* Premium elegant loading overlay matching Apple launching aesthetics */}
      <AnimatePresence>
        {!readyToPlay && (
          <motion.div
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09040f] text-foreground"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center gap-6"
            >
              {/* Spinning geometric visual ring */}
              <div className="relative flex h-16 w-16 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
                <Sparkles className="absolute h-4 w-4 text-purple-400 animate-pulse" />
              </div>

              {/* Text indicator */}
              <div className="text-center">
                <h2 className="font-display text-lg font-semibold tracking-wide text-gradient">
                  Entering the Cyberverse
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Synchronizing atmosphere... {percentLoaded}%
                </p>
              </div>

              {/* Progress Bar */}
              <div className="h-1 w-44 rounded-full bg-secondary overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-brand" 
                  style={{ width: `${percentLoaded}%` }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        /* Slow camera drift keyframe to add organic push-in / panning feel */
        @keyframes drift {
          0% { transform: scale(1.03) translate(0, 0); }
          50% { transform: scale(1.08) translate(-1.5%, 1%); }
          100% { transform: scale(1.03) translate(0, 0); }
        }
        .anim-camera-drift {
          animation: drift 25s ease-in-out infinite;
        }

        /* Slowly floating volumetric fog animation */
        @keyframes fog-move {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-3%, -2%) scale(1.1); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .anim-fog-slow {
          animation: fog-move 20s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
