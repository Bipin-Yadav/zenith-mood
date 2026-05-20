import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Home, Compass, Sparkles, Heart, ImageIcon, Search, User, Sun, Moon, Quote } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "@/lib/store";
import { BackgroundFX } from "./BackgroundFX";

const NAV = [
  { to: "/app", label: "Dashboard", icon: Home, exact: true },
  { to: "/app/explore", label: "Mood Explorer", icon: Compass },
  { to: "/app/generator", label: "Generator", icon: Sparkles },
  { to: "/app/search", label: "Search", icon: Search },
  { to: "/app/favorites", label: "Favorites", icon: Heart },
  { to: "/app/card", label: "Card Studio", icon: ImageIcon },
  { to: "/app/profile", label: "Profile", icon: User },
] as const;

export function AppShell() {
  const { theme, toggle } = useTheme();
  const loc = useLocation();

  return (
    <div className="relative min-h-screen">
      <BackgroundFX />
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 lg:px-8">
        {/* Sidebar */}
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col rounded-3xl glass p-5 lg:flex">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand shadow-glow">
              <Quote className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="font-display text-lg font-semibold tracking-tight">Mood<span className="text-gradient">Hub</span></div>
          </Link>
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map(item => {
              const active = item.exact ? loc.pathname === item.to : loc.pathname.startsWith(item.to);
              return (
                <Link key={item.to} to={item.to}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"}`}>
                  {active && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-xl ring-glow" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                  )}
                  <item.icon className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <button onClick={toggle} className="mt-4 flex items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm text-muted-foreground transition hover:text-foreground">
            <span>Theme</span>
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {/* Mobile topbar */}
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand shadow-glow">
                <Quote className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="font-display text-lg font-semibold">Mood<span className="text-gradient">Hub</span></div>
            </Link>
            <button onClick={toggle} className="grid h-10 w-10 place-items-center rounded-xl glass">
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
          </div>
          <Outlet />
          {/* Mobile bottom nav */}
          <nav className="fixed inset-x-3 bottom-3 z-40 flex justify-around rounded-2xl glass-strong p-2 lg:hidden">
            {NAV.slice(0, 6).map(item => {
              const active = item.exact ? loc.pathname === item.to : loc.pathname.startsWith(item.to);
              return (
                <Link key={item.to} to={item.to} className={`grid h-11 w-11 place-items-center rounded-xl transition ${active ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>
                  <item.icon className="h-4 w-4" />
                </Link>
              );
            })}
          </nav>
          <div className="h-20 lg:hidden" />
        </main>
      </div>
    </div>
  );
}
