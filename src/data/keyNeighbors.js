// Approximate physical layout of a standard ANSI QWERTY keyboard. This is
// what powers Compass Mode: instead of asserting "this key belongs to your
// right ring finger," we work out which keys physically surround a given
// key so the learner can see *where* it lives and reach it with whatever
// finger is comfortable.
//
// Each row is a list of [label, width] pairs, width in units of one normal
// key (1u). Rows are ordered top to bottom. Real keyboards stagger each row
// slightly differently — this layout approximates that stagger closely
// enough to compute sensible neighbors, but it's a simplification, not a
// pixel-accurate render.
const ROWS = [
  [
    ["`", 1], ["1", 1], ["2", 1], ["3", 1], ["4", 1], ["5", 1],
    ["6", 1], ["7", 1], ["8", 1], ["9", 1], ["0", 1], ["-", 1], ["=", 1], ["Backspace", 2],
  ],
  [
    ["Tab", 1.5], ["q", 1], ["w", 1], ["e", 1], ["r", 1], ["t", 1],
    ["y", 1], ["u", 1], ["i", 1], ["o", 1], ["p", 1], ["[", 1], ["]", 1], ["\\", 1.5],
  ],
  [
    ["Caps", 1.75], ["a", 1], ["s", 1], ["d", 1], ["f", 1], ["g", 1],
    ["h", 1], ["j", 1], ["k", 1], ["l", 1], [";", 1], ["'", 1], ["Enter", 2.25],
  ],
  [
    ["Shift", 2.25], ["z", 1], ["x", 1], ["c", 1], ["v", 1], ["b", 1],
    ["n", 1], ["m", 1], [",", 1], [".", 1], ["/", 1], ["Shift", 2.75],
  ],
];

// The bottom control row — not part of the typing/neighbor layout above
// (it's all modifier keys plus the space bar and arrow cluster), but a
// keyboard doesn't look "full size" without it, so it's exported
// separately for display-only use.
export const BOTTOM_ROW = [
  ["Ctrl", 1.25], ["Win", 1.25], ["Alt", 1.25], ["Space", 6.25], ["Alt", 1.25], ["Ctrl", 1.25],
  ["\u25c0", 1], ["\u25b2\u25bc", 1], ["\u25b6", 1],
];

// Non-typable keys — rendered as plain gray keycaps, never colored by
// finger and never clickable in Compass Mode's preview grid.
export const MODIFIER_LABELS = new Set([
  "Tab", "Caps", "Enter", "Shift", "Backspace", "Ctrl", "Win", "Alt",
  "\u25c0", "\u25b2\u25bc", "\u25b6",
]);

// What each number/punctuation key shows when Shift is held — drawn as the
// small upper-left glyph on real keycaps, alongside the unshifted base
// character.
export const SHIFT_SYMBOLS = {
  "`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%",
  "6": "^", "7": "&", "8": "*", "9": "(", "0": ")", "-": "_", "=": "+",
  "[": "{", "]": "}", "\\": "|", ";": ":", "'": "\"", ",": "<", ".": ">", "/": "?",
};

// The main typing rows, exported for reuse by the full-size keyboard
// renderer (Guide.jsx) so its key widths/stagger match this module's
// neighbor geometry exactly instead of drifting out of sync.
export const KEYBOARD_ROWS = ROWS;


// How generous the row-above/row-below overlap test is. Tuned by eye to
// roughly match what a person would point at on a keyboard picture, not
// derived from exact key geometry.
const OVERLAP_TOLERANCE = 0.3;

// How close in x two keys need to be, when one is directly above/below the
// other, before we call it a straight N/S neighbor instead of a diagonal
// NE/NW/SE/SW one.
const STRAIGHT_THRESHOLD = 0.35;

// Flatten ROWS into { label, row, center, halfWidth } entries, all rows
// starting flush at x = 0 (this is what creates the realistic stagger).
const LAYOUT = [];
ROWS.forEach((row, rowIndex) => {
  let x = 0;
  row.forEach(([label, width]) => {
    LAYOUT.push({ label, row: rowIndex, center: x + width / 2, halfWidth: width / 2 });
    x += width;
  });
});

function entriesFor(label) {
  return LAYOUT.filter((k) => k.label.toLowerCase() === label.toLowerCase());
}

function rowMates(rowIndex) {
  return LAYOUT.filter((k) => k.row === rowIndex).sort((a, b) => a.center - b.center);
}

function overlaps(a, b) {
  return Math.abs(a.center - b.center) < a.halfWidth + b.halfWidth + OVERLAP_TOLERANCE;
}

// Classifies where `other` sits relative to `entry` as a compass direction.
function classifyDirection(entry, other) {
  const dRow = other.row - entry.row;
  const dx = other.center - entry.center;
  if (dRow === 0) return dx < 0 ? "W" : "E";
  const vertical = dRow < 0 ? "N" : "S";
  if (Math.abs(dx) < STRAIGHT_THRESHOLD) return vertical;
  return dx < 0 ? vertical + "W" : vertical + "E";
}

// Full phrase fragments for each compass direction, used after "is just" /
// "is a little further" / "is well" — e.g. "is just above it".
const DIRECTION_PHRASES = {
  N: "above it", S: "below it", E: "to the right of it", W: "to the left of it",
  NE: "up and to the right of it", NW: "up and to the left of it",
  SE: "down and to the right of it", SW: "down and to the left of it",
};

const DISTANCE_QUALIFIERS = {
  adjacent: "just",
  nearby: "a little further",
  far: "well",
};

// Works out the compass direction and rough distance from `fromKey` to
// `toKey`, even when they aren't neighbors — this is what lets us describe
// a mistake in words ("well up and to the left") rather than only being
// able to show adjacent keys on the small grid.
export function relativeDirection(fromKey, toKey) {
  if (fromKey === " " || toKey === " ") {
    // Space is a wide key at the very bottom, not part of the staggered
    // grid above — handle it as a simple special case.
    return toKey === " "
      ? { dir: "S", distance: "far" }
      : { dir: "N", distance: "far" };
  }

  const a = entriesFor(fromKey)[0];
  const b = entriesFor(toKey)[0];
  if (!a || !b) return null;

  const dRow = b.row - a.row;
  const dx = b.center - a.center;
  const rowDist = Math.abs(dRow);
  const colDist = Math.abs(dx);

  let dir;
  if (dRow === 0) {
    dir = dx < 0 ? "W" : "E";
  } else {
    const vertical = dRow < 0 ? "N" : "S";
    dir = colDist < STRAIGHT_THRESHOLD ? vertical : dx < 0 ? vertical + "W" : vertical + "E";
  }

  const distance = rowDist <= 1 && colDist < 1.5 ? "adjacent" : rowDist <= 2 && colDist < 3 ? "nearby" : "far";
  return { dir, distance };
}

// Full sentence describing a miss: given the key the person meant to
// press and the key they actually pressed, describes where the right one
// is relative to the wrong one — so they can correct course without
// looking down at the keyboard.
export function describeMiss(correctKey, wrongKey) {
  if (!wrongKey || wrongKey.toLowerCase() === correctKey.toLowerCase()) return null;
  const rel = relativeDirection(wrongKey, correctKey);
  if (!rel) return null;

  const phrase = DIRECTION_PHRASES[rel.dir];
  const qualifier = DISTANCE_QUALIFIERS[rel.distance];
  const wrongDisplay = wrongKey === " " ? "space" : wrongKey.toUpperCase();

  return `You pressed ${wrongDisplay} — the key you want is ${qualifier} ${phrase}.`;
}

// Arrow glyph for each compass direction, used to give the mistake hint a
// clear "move this way" visual instead of only a word description.
export const DIRECTION_ARROWS = {
  N: "\u2191", S: "\u2193", E: "\u2192", W: "\u2190",
  NE: "\u2197", NW: "\u2196", SE: "\u2198", SW: "\u2199",
};

// Which staggered row (0 = number row, 3 = bottom letter row) a key lives
// on, or null if it isn't part of that grid (space bar, or an unknown key).
export function getKeyRow(label) {
  const entry = entriesFor(label)[0];
  return entry ? entry.row : null;
}

// Ordered, left-to-right, typable (non-modifier) key labels on a given
// row — used to draw a realistic "here's the whole row" strip in the
// mistake hint, rather than just the immediate 3x3 neighborhood.
export function getRowKeys(rowIndex) {
  return rowMates(rowIndex)
    .map((k) => k.label)
    .filter((label) => !MODIFIER_LABELS.has(label));
}


// Space bar isn't part of the staggered letter grid above it, but everyone
// learns its position the same way: down by thumb, below the bottom row.
const SPACE_NEIGHBORHOOD = [
  { label: "v", dir: "NW" },
  { label: "b", dir: "N" },
  { label: "n", dir: "NE" },
];

// Returns the keys that physically surround `key`, each tagged with a
// compass direction (N/NE/E/SE/S/SW/W/NW) relative to it. Used to render
// the Compass Mode "where is this key" snippet.
export function getNeighborhood(key) {
  if (key === " ") return { center: "space", neighbors: SPACE_NEIGHBORHOOD };

  const entries = entriesFor(key);
  if (entries.length === 0) return { center: key, neighbors: [] };

  const byDirection = new Map();

  entries.forEach((entry) => {
    const mates = rowMates(entry.row);
    const idx = mates.indexOf(entry);
    if (mates[idx - 1]) byDirection.set(classifyDirection(entry, mates[idx - 1]), mates[idx - 1].label);
    if (mates[idx + 1]) byDirection.set(classifyDirection(entry, mates[idx + 1]), mates[idx + 1].label);

    [entry.row - 1, entry.row + 1].forEach((r) => {
      LAYOUT.filter((k) => k.row === r && overlaps(entry, k)).forEach((k) => {
        byDirection.set(classifyDirection(entry, k), k.label);
      });
    });
  });

  const neighbors = [...byDirection.entries()]
    .filter(([, label]) => label.toLowerCase() !== key.toLowerCase())
    .map(([dir, label]) => ({ dir, label }));

  return { center: key, neighbors };
}
