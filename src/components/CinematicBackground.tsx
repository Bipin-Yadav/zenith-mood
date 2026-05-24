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

export interface CinematicBackgroundProps {
  scrollProgress?: number;
}

export function CinematicBackground({ scrollProgress = 0 }: CinematicBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastScrollProgressRef = useRef<number>(0);
  const [readyToPlay, setReadyToPlay] = useState(false);

  const scrollProgressRef = useRef(scrollProgress);
  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  // Video canplaythrough loader
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setReadyToPlay(true);
    };

    if (video.readyState >= 3) {
      handleCanPlay();
    }

    video.addEventListener("canplaythrough", handleCanPlay);
    return () => {
      video.removeEventListener("canplaythrough", handleCanPlay);
    };
  }, []);

  // Hardware-accelerated Scroll Easing & Particle Loop
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
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

    // Cyberpunk floating particle colors
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

    particlesRef.current = Array.from({ length: 35 }, () => createParticle(true));

    const draw = () => {
      const parent = canvas.parentElement;
      if (!parent) {
        animationFrameIdRef.current = requestAnimationFrame(draw);
        return;
      }
      const rect = parent.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // 1. Synchronize Video playback dynamically to scroll progress with buttery momentum
      if (video.duration) {
        // Limit the maximum scrubbed duration to 4.0s (out of the 8s total)
        // This cuts the scroll-scrub rate in half so it doesn't pass too many frames too quickly
        const maxDurationToScrub = Math.min(4.0, video.duration);
        const targetTime = scrollProgressRef.current * maxDurationToScrub;
        const diff = targetTime - video.currentTime;
        
        // Easing factor (0.08 provides luxurious organic inertia)
        if (Math.abs(diff) > 0.001) {
          video.currentTime = video.currentTime + diff * 0.08;
        }
      }

      // 2. Clear transparent canvas for drawing overlays
      ctx.clearRect(0, 0, w, h);

      // Calculate scroll velocity (change in scroll progress)
      const currentScroll = scrollProgressRef.current;
      const scrollDelta = Math.abs(currentScroll - lastScrollProgressRef.current);
      lastScrollProgressRef.current = currentScroll;

      // Scale velocities & glowing halos according to active scrolling
      const speedFactor = 1.0 + Math.min(scrollDelta * 60, 2.8);
      const glowBoost = Math.min(scrollDelta * 1.5, 0.35);

      // 3. Render neon floating particles over video
      ctx.shadowBlur = 0;
      particlesRef.current.forEach((p, idx) => {
        p.y += p.speedY * speedFactor;
        p.x += p.speedX * speedFactor;

        if (p.y < h - 100) {
          p.alpha = Math.max(0, p.alpha - 0.003);
        } else if (p.alpha < p.maxAlpha) {
          p.alpha = Math.min(p.maxAlpha, p.alpha + 0.01);
        }

        if (p.y < -10 || p.x < -10 || p.x > w + 10 || p.alpha <= 0) {
          particlesRef.current[idx] = createParticle(false);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        const activeAlpha = Math.min(0.9, p.alpha + glowBoost);
        ctx.fillStyle = `${p.color}${activeAlpha.toFixed(3)})`;
        
        ctx.shadowColor = `${p.color}0.8)`;
        ctx.shadowBlur = p.size * 3 * (1.0 + glowBoost * 2);
        ctx.fill();
      });

      ctx.shadowBlur = 0;
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

  return (
    <>
      {/* Displacement mapping for wet floor water reflection shaders */}
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
        {/* Hardware-accelerated High-Definition Video Player */}
        <video
          ref={videoRef}
          src="/FrameVidevo.mp4"
          preload="auto"
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none origin-center transform scale-[1.03]"
          style={{ willChange: "transform" }}
        />

        {/* Canvas displaying transparent overlays & reactive neon glowing particles */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />

        {/* Volumetric lighting mask */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,color-mix(in_oklab,var(--color-background)_80%,transparent)_100%)] pointer-events-none" />

        {/* Volumetric foggy mist clouds */}
        <div className="absolute inset-0 opacity-[0.06] bg-gradient-to-t from-transparent via-cyan-500/30 to-purple-500/20 mix-blend-screen pointer-events-none blur-3xl anim-fog-slow" />

        {/* Damp cyberpunk wet floor puddle reflections (Uses SVG displacement filter) */}
        <div 
          className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-[#0c0514]/90 via-[#0d071a]/40 to-transparent pointer-events-none opacity-85"
          style={{ filter: "url(#water-displacement)" }}
        />

        {/* Tech Grid */}
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(var(--color-foreground)_1px,transparent_1px),linear-gradient(90deg,var(--color-foreground)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none" />

        {/* Subtle holographic vignette screen overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0514]/15 via-transparent to-[#0c0514]/75 pointer-events-none" />
      </div>

      {/* Launch Loading overlay matching Apple keynote aesthetics */}
      <AnimatePresence>
        {!readyToPlay && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
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
                <p className="text-xs text-muted-foreground mt-1 animate-pulse">
                  Synchronizing atmosphere...
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
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
