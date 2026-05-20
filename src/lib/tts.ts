let current: SpeechSynthesisUtterance | null = null;
export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95; u.pitch = 1; u.lang = "en-US";
  current = u;
  window.speechSynthesis.speak(u);
}
export function stopSpeech() {
  if (typeof window === "undefined") return;
  window.speechSynthesis.cancel();
  current = null;
}
