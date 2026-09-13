// The 8 typing fingers, in a fixed order used by pickers and legends.
export const FINGERS = [
  "left pinky", "left ring", "left middle", "left index",
  "right index", "right middle", "right ring", "right pinky",
];

// The textbook finger-to-key map. This is the DEFAULT — a real user's
// actual habits (set on the Calibrate page) are layered on top of this
// and take priority wherever they exist.
//
// Covers the full physical keyboard, not just the 26 letters: number row,
// the punctuation/bracket keys coders hit constantly, and backslash. Each
// non-letter key is assigned to whichever finger sits above/below it on
// the same column in standard touch-typing technique.
export const FINGER_MAP = {
  "`": "left pinky", "1": "left pinky", q: "left pinky", a: "left pinky", z: "left pinky",
  "2": "left ring", w: "left ring", s: "left ring", x: "left ring",
  "3": "left middle", e: "left middle", d: "left middle", c: "left middle",
  "4": "left index", "5": "left index",
  r: "left index", f: "left index", v: "left index",
  t: "left index", g: "left index", b: "left index",
  "6": "right index", "7": "right index",
  y: "right index", h: "right index", n: "right index",
  u: "right index", j: "right index", m: "right index",
  "8": "right middle", i: "right middle", k: "right middle", ",": "right middle",
  "9": "right ring", o: "right ring", l: "right ring", ".": "right ring",
  "0": "right pinky", "-": "right pinky", "=": "right pinky",
  p: "right pinky", "[": "right pinky", "]": "right pinky",
  ";": "right pinky", "'": "right pinky", "/": "right pinky", "\\": "right pinky",
  " ": "either thumb",
};

// Looks up which finger types a given character, preferring a user's own
// calibrated map (if they've set one) and falling back to the standard map.
export function fingerFor(ch, userMap) {
  const key = ch.toLowerCase();
  if (userMap && userMap[key]) return userMap[key];
  return FINGER_MAP[key] || "closest resting finger";
}

// Which hand a finger label belongs to ("left" | "right" | "either").
export function handFor(fingerLabel) {
  if (!fingerLabel) return null;
  if (fingerLabel.startsWith("left")) return "left";
  if (fingerLabel.startsWith("right")) return "right";
  return "either";
}

// Background color for each finger, used on keyboard keys and legend swatches.
export const FINGER_COLORS = {
  "left pinky": "#D4537E",
  "left ring": "#7F77DD",
  "left middle": "#5DCAA5",
  "left index": "#EF9F27",
  "right index": "#EF9F27",
  "right middle": "#5DCAA5",
  "right ring": "#7F77DD",
  "right pinky": "#D4537E",
  "either thumb": "#B4B2A9",
};

// Matching dark text color for each finger's background, so labels stay readable.
export const FINGER_TEXT = {
  "left pinky": "#4B1528",
  "left ring": "#26215C",
  "left middle": "#04342C",
  "left index": "#412402",
  "right index": "#412402",
  "right middle": "#04342C",
  "right ring": "#26215C",
  "right pinky": "#4B1528",
  "either thumb": "#2C2C2A",
};

// Keys that sit on the home row (they get a little raised dot, like on a real keyboard).
export const HOME_ROW = ["a", "s", "d", "f", "j", "k", "l", ";"];

// A shorter list of representative keys used during calibration — enough to
// cover every finger without asking the user to tap through all 30 keys.
export const CALIBRATION_KEYS = [
  "q", "a", "z", "w", "s", "x", "e", "d", "c",
  "r", "f", "v", "t", "g", "b",
  "y", "h", "n", "u", "j", "m",
  "i", "k", ",", "o", "l", ".", "p", ";", "/",
];

// Groups of keys shown in the legend, one row per finger.
export const LEGEND_GROUPS = [
  { name: "Left pinky", finger: "left pinky", keys: ["`", "1", "q", "a", "z"] },
  { name: "Left ring", finger: "left ring", keys: ["2", "w", "s", "x"] },
  { name: "Left middle", finger: "left middle", keys: ["3", "e", "d", "c"] },
  { name: "Left index", finger: "left index", keys: ["4", "5", "r", "f", "v", "t", "g", "b"] },
  { name: "Right index", finger: "right index", keys: ["6", "7", "y", "h", "n", "u", "j", "m"] },
  { name: "Right middle", finger: "right middle", keys: ["8", "i", "k", ","] },
  { name: "Right ring", finger: "right ring", keys: ["9", "o", "l", "."] },
  { name: "Right pinky", finger: "right pinky", keys: ["0", "-", "=", "p", "[", "]", ";", "'", "/", "\\"] },
];
