// Short lines used in "Line" practice mode.
export const SAMPLE_LINES = [
  "the quick brown fox jumps over the lazy dog",
  "ask dad if the glass fell off the shelf",
  "she sells seashells down by the seashore",
  "pack my box with five dozen liquor jugs",
  "a sad lad had a glass of milk after school",
];

// Longer paragraphs used in "Paragraph" practice mode.
export const SAMPLE_PARAGRAPHS = [
  "typing without looking at the keyboard feels strange at first, like reading in the dark. your fingers already know the way, but your eyes keep pulling you back down to check. the trick is to trust the shape of the keyboard under your hands instead of the letters printed on top of it. give it a few honest sessions and the doubt fades faster than you expect.",
  "the best way to build a habit is to make the first step so small it feels silly to skip. that applies to typing just as much as anything else. five minutes a day of deliberate, unhurried practice will do more for your muscle memory than one long frustrated session on a sunday night. slow is temporary. sloppy is not.",
  "every keyboard has two small bumps, one under the f and one under the j. they exist so your fingers can find home row without any help from your eyes. rest your index fingers there before you start typing anything, and let every other finger fall naturally into place around them. that one habit alone will fix most of your positioning problems.",
  "mistakes are not failures in this exercise, they are data. every wrong key you press tells the practice tool exactly which finger needs more work. it is far more useful to type slowly and correctly than quickly and wrong, because speed without accuracy just means you are practicing your mistakes until they become permanent.",
];

// Short code lines used in "Code" practice mode. These lean hard on the
// keys the letter-only pools never touch — brackets, symbols, numbers,
// operators — since that's what coders actually type all day. Kept to a
// single line each (no real newlines) so they work with the existing
// typing box, which measures one flat string of characters.
export const SAMPLE_CODE_LINES = [
  "const total = (price * qty) + tax;",
  "if (user != null && user.age >= 18) { grant(); }",
  "function add(a, b) { return a + b; }",
  "for (let i = 0; i < items.length; i++) { sum += items[i]; }",
  "export const API_KEY = process.env.API_KEY || \"\";",
  "let result = data.map(x => x * 2).filter(x => x > 10);",
  "def greet(name): return f\"Hello, {name}!\"",
  "SELECT * FROM users WHERE age > 21 AND active = 1;",
];

// Longer code snippets used in "Code" practice mode's paragraph-style
// setting — a few statements chained together with semicolons and
// newlines-as-spaces, still symbol- and number-heavy throughout.
export const SAMPLE_CODE_SNIPPETS = [
  "const config = { retries: 3, timeout: 5000, baseUrl: \"https://api.example.com/v1\" }; if (!config.baseUrl) throw new Error(\"missing base url\");",
  "class Vector2 { constructor(x = 0, y = 0) { this.x = x; this.y = y; } add(v) { return new Vector2(this.x + v.x, this.y + v.y); } }",
  "try { const res = await fetch(url); if (!res.ok) throw new Error(`HTTP ${res.status}`); const data = await res.json(); } catch (err) { console.error(err); }",
  "def fibonacci(n): a, b = 0, 1; for _ in range(n): a, b = b, a + b; return a",
];

// Picks a random line or paragraph depending on the current text mode.
export function pickText(textMode) {
  const pool =
    textMode === "paragraph"
      ? SAMPLE_PARAGRAPHS
      : textMode === "code-line"
      ? SAMPLE_CODE_LINES
      : textMode === "code-paragraph"
      ? SAMPLE_CODE_SNIPPETS
      : SAMPLE_LINES;
  return pool[Math.floor(Math.random() * pool.length)];
}
