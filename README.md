# 🌌 MoodHub — AI-Powered Mood Quote Studio & Mindfulness Space

A premium, highly interactive motivation hub and quote design studio built with cutting-edge web technologies. Pick a vibe, discover curated lines, design aesthetic cards for social sharing, listen to text-to-speech narrations, and synchronize your heart rate with our mindfulness breathing space.

Developed with ❤️ by **[Bipin Yadav](https://linkedin.com/in/bipin-yadav-612b102bb)**.

---

## 📸 Screenshots Showcase

Here is a visual tour of the MoodHub experience. E.g., add your screenshot files inside the placeholders below:

### 💫 Landing Page & Scroll-Activated Storytelling Hero
> An immersive, Vercel-style interactive storytelling journey driven by the user's scroll.
![Landing Page / Storytelling Hero Screen Shot](https://github.com/user-attachments/assets/9a454826-44fc-4dcd-9771-07d1b4f75043)  
*Placeholder for your own image:* `[Landing Page / Storytelling Hero]`

### 📊 Dashboard Overview
> Your personal motivation control panel with daily streaks and quick actions.
https://github.com/user-attachments/assets/3bc79795-b6e2-4f44-89e9-78664793baba

### 🧭 Mood Explorer
> Pick a vibe (Coding Flow, Heartbreak, Energetic) and discover custom-curated quotes.
*Placeholder for your own image:* `[Mood Explorer]`

### 🎨 Aesthetic Card Studio
> Create Instagram-ready quote cards with custom gradients, premium typography, and instant export.
*Placeholder for your own image:* `[Aesthetic Card Studio]`

### 🌬️ Soothing Breathing Space (Breathing Bubble)
> Synchronize your breathing to clear stress using audio synthesis and premium visual feedback.
*Placeholder for your own image:* `[Mindfulness Breathing Space]`

---

## ✨ Core Features

### 1. 📜 Scroll-Activated Storytelling Hero
* **Elastic Scroll Damping:** Powered by a high-performance passive scroll tracker and a `requestAnimationFrame` linear-interpolation (`lerp`) loop (`factor: 0.08`) for Vercel/Apple-style momentum.
* **Typographic Timeline:** Text elements sequentially slide, scale, blur-remove, and fade based on scroll progress milestones.
* **SSR Hydration-Safe Quotes:** Quotes are handled safely via React state hydration models to avoid server/client rendering mismatches.

### 2. 🏙️ Live Cyberpunk Cityscape Canvas
* **Sequential preloading:** sequential frame preloading of `240` high-fidelity city images, coordinated with a launching progress overlay.
* **Modular Loop-Aware Physics:** Employs shortest-path circular interpolation to prevent background frame jumps when scrolling rapidly.
* **Velocity-Responsive Particles:** Spawns glowing floating neon particles (cyan, purple, magenta) that accelerate and expand their glowing volumetric halos in response to scroll velocity.
* **Organic Cyberspace VFX:** Built-in foggy mist overlays, volumetric camera drifts, and damp cyberpunk wet-floor puddle shaders powered by an SVG fractal-noise displacement filter.

### 3. 🌬️ Soothing Mindfulness Breathing Space
* **Breathing Cycles:** Select between *Box Breathing*, *Relax (4-7-8)*, or *Equal Breath* modes.
* **Volumetric Visual Bubble:** Outer glow halos and scaling bubbles synchronize dynamically with your inhales, holds, and exhales using Framer Motion (`motion`).
* **Sound-Therapy Synthesizer:** Real-time warm ambient drones generated dynamically using the HTML5 `AudioContext` API. Gain nodes apply linear and exponential fade ramps to prevent harsh clicks.

### 4. 🎨 Aesthetic Card Studio & TTS
* **Studio Designer:** Custom-build cards with high-contrast text overlaying curated brand gradients.
* **One-Click Export:** Instantly download quote cards as PNGs ready for social sharing.
* **Listen Aloud:** Premium Text-to-Speech (TTS) synthesizes natural narrations of any quote.

---

## 🛠️ Technology Stack
* **Core:** React 19.2 (Typescript)
* **Framework:** TanStack Start 1.167 (File-based routing & Server-Side Rendering)
* **Build Configuration:** Standard Vite 7.3 (Lovable-free, pure standard plugins)
* **Styling & Theme:** Tailwind CSS v4 & custom HSL dynamic glassmorphism sheets
* **Animation:** `@motion/react` (Framer Motion v12) & HTML5 Canvas

---

## 📂 File Architecture Key Components

```
MoodHub/
├── src/
│   ├── components/
│   │   ├── CinematicBackground.tsx    # Cyberpunk Cityscape Canvas & Particle Physics
│   │   ├── BreathingBubble.tsx        # Sound-Therapy Breathing Workspace
│   │   ├── AppShell.tsx               # Main Dashboard sidebar and layout shell
│   │   └── QuoteCard.tsx              # Aesthetic Quote Card templates
│   ├── routes/
│   │   ├── index.tsx                  # Home / Storytelling Hero & Footer
│   │   ├── app.index.tsx              # Dashboard Page (integrates Breathing Bubble)
│   │   └── ...                        # App explore, generator, favorites, card studios
│   ├── lib/
│   │   ├── store.ts                   # Theme, Streaks, Favorites, History (LocalState)
│   │   └── tts.ts                     # Natural voice text-to-speech synthesizer
│   └── styles.css                     # HSL theme systems, glassmorphism, and custom animations
├── vite.config.ts                     # Clean Standard Vite 7 TanStack Start config
└── package.json                       # Dependencies & build scripts
```

---

## 🚀 Quick Start Guide

Follow these simple steps to run MoodHub locally on your machine:

### 1. Clone the Repository
```bash
git clone https://github.com/Bipin-Yadav/zenith-mood.git
cd zenith-mood
```

### 2. Install Dependencies
Ensure you have Node.js installed, then run:
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser to experience the cyberpunk live-breathing Motivation Hub!

### 4. Production Build Verification
To compile client files and server SSR packages for hosting:
```bash
npm run build
```

---

## 🤝 Contributing & Developer Signature

Developed with passion by **Bipin Yadav**. If you have ideas, feedback, or would like to contribute:
* Connect on **[LinkedIn](https://linkedin.com/in/bipin-yadav-612b102bb)**.
* Check out other projects on **[GitHub](https://github.com/Bipin-Yadav)**.
