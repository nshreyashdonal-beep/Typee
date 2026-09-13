import { fingerFor, handFor } from "./fingerMap";

/**
 * A single typed keystroke, as recorded during a practice session.
 * @typedef {Object} Keystroke
 * @property {string} char       - the character that was typed
 * @property {number} downTime   - ms timestamp when the key went down
 * @property {number} upTime     - ms timestamp when the key came back up
 */

// Classifies a pair of consecutive characters as "same finger",
// "same hand" (different finger), or "different hand" — the three
// tiers described in the touch-typing research this feature is based on.
function classifyBigram(charA, charB, userMap) {
  const fingerA = fingerFor(charA, userMap);
  const fingerB = fingerFor(charB, userMap);
  if (fingerA === fingerB) return "same-finger";
  const handA = handFor(fingerA);
  const handB = handFor(fingerB);
  if (handA === handB) return "same-hand";
  return "different-hand";
}

// Rollover: the next key going down before the previous key comes back up.
// This is measured straight from keydown/keyup timestamps, no finger
// mapping needed. Strongest single predictor of speed in the research.
function computeRollover(keystrokes) {
  if (keystrokes.length < 2) return { rolloverPct: 0, pairCount: 0 };
  let overlapCount = 0;
  for (let i = 1; i < keystrokes.length; i++) {
    const prev = keystrokes[i - 1];
    const curr = keystrokes[i];
    if (curr.downTime < prev.upTime) overlapCount++;
  }
  const pairCount = keystrokes.length - 1;
  return { rolloverPct: Math.round((overlapCount / pairCount) * 100), pairCount };
}

// Groups the inter-keystroke intervals by bigram category and averages
// each group. A healthy, consistent mapping should show same-finger
// pairs taking noticeably longer than different-hand pairs, since a
// single finger physically can't move to two places at once.
function computeBigramTimings(keystrokes, userMap) {
  const groups = { "same-finger": [], "same-hand": [], "different-hand": [] };

  for (let i = 1; i < keystrokes.length; i++) {
    const prev = keystrokes[i - 1];
    const curr = keystrokes[i];
    const interval = curr.downTime - prev.downTime;
    if (interval <= 0) continue;
    const category = classifyBigram(prev.char, curr.char, userMap);
    groups[category].push({ pair: prev.char + curr.char, interval });
  }

  function average(list) {
    if (list.length === 0) return null;
    return list.reduce((sum, x) => sum + x.interval, 0) / list.length;
  }

  return {
    sameFingerAvg: average(groups["same-finger"]),
    sameHandAvg: average(groups["same-hand"]),
    differentHandAvg: average(groups["different-hand"]),
    sameFingerPairs: groups["same-finger"],
  };
}

// Turns the same-finger vs different-hand timing gap into a 0-100
// "consistency" score. This is a heuristic, not a scientific measure:
// a bigger gap means the user's timing lines up with how the mapping
// predicts they should type, which suggests a stable, repeatable
// finger habit rather than a wandering one.
function computeConsistencyScore({ sameFingerAvg, differentHandAvg }) {
  if (sameFingerAvg == null || differentHandAvg == null || differentHandAvg === 0) {
    return null; // not enough data this session (e.g. a very short line)
  }
  const gapRatio = (sameFingerAvg - differentHandAvg) / differentHandAvg;
  // A gap ratio of 0 (no difference at all) -> score 30ish (low but not zero).
  // A gap ratio of 0.6+ (same-finger pairs take 60%+ longer) -> score ~100.
  const score = Math.round(Math.min(100, Math.max(0, 30 + gapRatio * 120)));
  return score;
}

// Finds the slowest same-finger pairs this session — these are
// "physically tough" pairs, not mistakes, so they're reported separately
// from the mistake-based weak-keys list. Used in Finger Mode only, since it
// needs a finger map to know which pairs share a finger.
function findToughPairs(sameFingerPairs, limit = 3) {
  return [...sameFingerPairs]
    .sort((a, b) => b.interval - a.interval)
    .slice(0, limit)
    .map((p) => p.pair);
}

// Compass Mode equivalent of findToughPairs: no finger map, so we can't
// single out "same-finger" pairs — instead we just surface the slowest
// consecutive key pairs typed this session, whatever the cause.
function findSlowPairs(keystrokes, limit = 3) {
  const pairs = [];
  for (let i = 1; i < keystrokes.length; i++) {
    const prev = keystrokes[i - 1];
    const curr = keystrokes[i];
    const interval = curr.downTime - prev.downTime;
    if (interval <= 0) continue;
    pairs.push({ pair: prev.char + curr.char, interval });
  }
  return pairs
    .sort((a, b) => b.interval - a.interval)
    .slice(0, limit)
    .map((p) => p.pair);
}

// Generates short, plain-language notes explaining likely reasons the
// session's WPM landed where it did. Each note is a diagnosis, not a
// verdict — several can apply at once. Shared logic for both modes; the
// finger-specific notes are only added when a consistency score exists.
function generateNotes({ rolloverPct, consistencyScore, toughPairs, accuracy, mode }) {
  const notes = [];

  if (accuracy != null && accuracy < 90) {
    notes.push(
      `Accuracy was ${accuracy}% this session — corrections and mistakes are likely costing more speed than technique right now.`
    );
  }

  if (rolloverPct < 10) {
    notes.push(
      "Very little keystroke overlap (low rollover) — you're mostly finishing one key fully before starting the next, which caps top speed."
    );
  } else if (rolloverPct >= 20) {
    notes.push(
      `Solid rollover (${rolloverPct}%) — your fingers are overlapping keystrokes, which is a strong sign of efficient technique.`
    );
  }

  if (mode === "finger" && consistencyScore != null) {
    if (consistencyScore < 45) {
      notes.push(
        "Same-finger pairs weren't much slower than cross-hand pairs — worth double-checking your finger map on the Calibrate page, since this usually means the mapping doesn't quite match how you actually type."
      );
    } else if (consistencyScore >= 70) {
      notes.push("Your timing matches your finger map well — that's a stable, repeatable habit.");
    }
  }

  if (toughPairs.length > 0) {
    if (mode === "finger") {
      notes.push(
        `${toughPairs.join(", ")} came up as your slowest pairs this session — these use the same finger twice in a row, so some of that slowdown is physical, not a mistake to drill away.`
      );
    } else {
      notes.push(
        `${toughPairs.join(", ")} came up as your slowest pairs this session — check where those keys sit on the keyboard below, since a slow pair is often just two keys that are awkward to reach back-to-back.`
      );
    }
  }

  return notes;
}

// Main entry point: given the session's keystroke log, returns everything
// the report needs to explain (not just show) the session's performance.
// mode is "finger" (default) or "compass" — compass mode has no finger map,
// so it skips finger-consistency scoring and reports raw slow pairs instead.
export function computeTypingInsights(keystrokes, userMap, accuracy, mode = "finger") {
  const { rolloverPct } = computeRollover(keystrokes);

  if (mode === "compass") {
    const toughPairs = findSlowPairs(keystrokes);
    const notes = generateNotes({ rolloverPct, consistencyScore: null, toughPairs, accuracy, mode });
    return { rolloverPct, consistencyScore: null, toughPairs, notes };
  }

  const bigramTimings = computeBigramTimings(keystrokes, userMap);
  const consistencyScore = computeConsistencyScore(bigramTimings);
  const toughPairs = findToughPairs(bigramTimings.sameFingerPairs);
  const notes = generateNotes({ rolloverPct, consistencyScore, toughPairs, accuracy, mode });

  return { rolloverPct, consistencyScore, toughPairs, notes };
}
