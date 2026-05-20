export type Mood =
  | "motivated" | "sad" | "heartbroken" | "happy" | "lonely"
  | "gym" | "success" | "study" | "coding" | "self-discipline";

export interface Quote {
  id: string;
  text: string;
  author: string;
  mood: Mood;
  tags?: string[];
}

export const MOODS: { id: Mood; label: string; emoji: string; gradient: string }[] = [
  { id: "motivated", label: "Motivated", emoji: "⚡", gradient: "from-amber-400 to-orange-500" },
  { id: "sad", label: "Sad", emoji: "🌧️", gradient: "from-slate-400 to-indigo-500" },
  { id: "heartbroken", label: "Heartbroken", emoji: "💔", gradient: "from-rose-400 to-red-500" },
  { id: "happy", label: "Happy", emoji: "🌞", gradient: "from-yellow-300 to-pink-400" },
  { id: "lonely", label: "Lonely", emoji: "🌙", gradient: "from-indigo-400 to-violet-600" },
  { id: "gym", label: "Gym", emoji: "🔥", gradient: "from-red-500 to-orange-600" },
  { id: "success", label: "Success", emoji: "🏆", gradient: "from-emerald-400 to-teal-500" },
  { id: "study", label: "Study", emoji: "📚", gradient: "from-sky-400 to-blue-600" },
  { id: "coding", label: "Coding", emoji: "💻", gradient: "from-cyan-400 to-emerald-500" },
  { id: "self-discipline", label: "Self-Discipline", emoji: "🧭", gradient: "from-fuchsia-500 to-violet-600" },
];

export const QUOTES: Quote[] = [
  { id: "1", mood: "motivated", author: "Steve Jobs", text: "Your time is limited, so don't waste it living someone else's life." },
  { id: "2", mood: "motivated", author: "Theodore Roosevelt", text: "Believe you can and you're halfway there." },
  { id: "3", mood: "motivated", author: "Vince Lombardi", text: "The only place where success comes before work is in the dictionary." },
  { id: "4", mood: "sad", author: "Haruki Murakami", text: "Pain is inevitable. Suffering is optional." },
  { id: "5", mood: "sad", author: "Carl Jung", text: "I am not what happened to me, I am what I choose to become." },
  { id: "6", mood: "heartbroken", author: "Rumi", text: "The wound is the place where the Light enters you." },
  { id: "7", mood: "heartbroken", author: "Anonymous", text: "Hearts break so they can open wider." },
  { id: "8", mood: "happy", author: "Audrey Hepburn", text: "The most important thing is to enjoy your life — to be happy. It's all that matters." },
  { id: "9", mood: "happy", author: "Dalai Lama", text: "Happiness is not something ready made. It comes from your own actions." },
  { id: "10", mood: "lonely", author: "Jean-Paul Sartre", text: "If you're lonely when you're alone, you're in bad company." },
  { id: "11", mood: "lonely", author: "Rainer Maria Rilke", text: "I hold this to be the highest task: that two solitudes protect and touch and greet each other." },
  { id: "12", mood: "gym", author: "Arnold Schwarzenegger", text: "The last three or four reps is what makes the muscle grow." },
  { id: "13", mood: "gym", author: "David Goggins", text: "The only way to gain strength is to suffer." },
  { id: "14", mood: "success", author: "Winston Churchill", text: "Success is not final, failure is not fatal: it is the courage to continue that counts." },
  { id: "15", mood: "success", author: "Maya Angelou", text: "Success is liking yourself, liking what you do, and liking how you do it." },
  { id: "16", mood: "study", author: "Malcolm X", text: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today." },
  { id: "17", mood: "study", author: "B.B. King", text: "The beautiful thing about learning is that no one can take it away from you." },
  { id: "18", mood: "coding", author: "Linus Torvalds", text: "Talk is cheap. Show me the code." },
  { id: "19", mood: "coding", author: "Martin Fowler", text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand." },
  { id: "20", mood: "coding", author: "Edsger Dijkstra", text: "Simplicity is prerequisite for reliability." },
  { id: "21", mood: "self-discipline", author: "Jim Rohn", text: "Discipline is the bridge between goals and accomplishment." },
  { id: "22", mood: "self-discipline", author: "Aristotle", text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit." },
  { id: "23", mood: "motivated", author: "Nelson Mandela", text: "It always seems impossible until it's done." },
  { id: "24", mood: "success", author: "Henry Ford", text: "Whether you think you can, or you think you can't — you're right." },
  { id: "25", mood: "coding", author: "John Carmack", text: "Focus is a matter of deciding what things you're not going to do." },
  { id: "26", mood: "study", author: "Albert Einstein", text: "Once you stop learning, you start dying." },
  { id: "27", mood: "happy", author: "Ralph Waldo Emerson", text: "For every minute you are angry you lose sixty seconds of happiness." },
  { id: "28", mood: "gym", author: "Ronnie Coleman", text: "Everybody wants to be a bodybuilder, but nobody wants to lift no heavy-ass weights." },
  { id: "29", mood: "self-discipline", author: "Marcus Aurelius", text: "You have power over your mind — not outside events. Realize this, and you will find strength." },
  { id: "30", mood: "lonely", author: "Henry Rollins", text: "Loneliness adds beauty to life. It puts a special burn on sunsets and makes night air smell better." },
];

export function quotesByMood(mood: Mood) {
  return QUOTES.filter(q => q.mood === mood);
}
export function randomQuote(mood?: Mood) {
  const pool = mood ? quotesByMood(mood) : QUOTES;
  return pool[Math.floor(Math.random() * pool.length)];
}
export function quoteOfTheDay(): Quote {
  const day = Math.floor(Date.now() / 86400000);
  return QUOTES[day % QUOTES.length];
}
