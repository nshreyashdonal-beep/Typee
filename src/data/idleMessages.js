// Playful "don't look down" filler shown in the mistake-hint box whenever
// there hasn't been a mistake yet. The box stays mounted at all times
// (see MistakeHint.jsx) so it never pops in/out and shifts the layout —
// this is just what fills it while things are going well.
export const IDLE_MESSAGES = [
  "Don't you dare look down.",
  "Eyes up. Trust the fingers.",
  "No peeking — you've got this.",
  "Keep your eyes on the screen, not the keys.",
  "Still not looking, right? Good.",
  "Your fingers know the way. Let them.",
  "Looking is cheating. You know this.",
];

export function pickIdleMessage() {
  return IDLE_MESSAGES[Math.floor(Math.random() * IDLE_MESSAGES.length)];
}
