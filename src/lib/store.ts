import { useEffect, useState, useCallback } from "react";
import type { Quote, Mood } from "@/data/quotes";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch { return fallback; }
}
function write<T>(key: string, v: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(v));
}

export function useLocalState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);
  useEffect(() => { setState(read<T>(key, initial)); /* eslint-disable-next-line */ }, [key]);
  const setter = useCallback((v: T | ((p: T) => T)) => {
    setState(prev => {
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      write(key, next); return next;
    });
  }, [key]);
  return [state, setter] as const;
}

export function useFavorites() {
  const [favs, setFavs] = useLocalState<Quote[]>("mqh:favorites", []);
  const isFav = (id: string) => favs.some(q => q.id === id);
  const toggle = (q: Quote) =>
    setFavs(prev => prev.some(p => p.id === q.id) ? prev.filter(p => p.id !== q.id) : [q, ...prev]);
  return { favs, isFav, toggle };
}

export function useHistory() {
  const [hist, setHist] = useLocalState<{ q: Quote; at: number }[]>("mqh:history", []);
  const push = (q: Quote) => setHist(prev => [{ q, at: Date.now() }, ...prev.filter(p => p.q.id !== q.id)].slice(0, 50));
  return { hist, push };
}

export function useMoodHistory() {
  const [moods, setMoods] = useLocalState<{ mood: Mood; at: number }[]>("mqh:moods", []);
  const push = (mood: Mood) => setMoods(prev => [{ mood, at: Date.now() }, ...prev].slice(0, 100));
  return { moods, push };
}

export function useStreak() {
  const [s, setS] = useLocalState<{ count: number; last: string }>("mqh:streak", { count: 0, last: "" });
  useEffect(() => {
    const today = new Date().toDateString();
    const y = new Date(Date.now() - 86400000).toDateString();
    if (s.last === today) return;
    if (s.last === y) setS({ count: s.count + 1, last: today });
    else setS({ count: 1, last: today });
    // eslint-disable-next-line
  }, []);
  return s.count;
}

export function useTheme() {
  const [theme, setTheme] = useLocalState<"dark" | "light">("mqh:theme", "dark");
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return { theme, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") };
}
