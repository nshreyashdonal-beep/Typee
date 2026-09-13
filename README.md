# Typee

A touch-typing trainer that teaches two different ways: the traditional
"every key belongs to a finger" method, or a position-based **Compass
Mode** that just shows you where a key physically sits and lets you reach
it however feels natural. Full keyboard support (letters, numbers,
symbols, brackets) and code snippets, so it's just as useful for coders
as it is for prose typists.

## Features

- **Finger Mode** — the textbook finger-to-key map, or calibrate it to
  match how you actually type. Renders a full-size keyboard with each key
  colored by finger, plus hand diagrams.
- **Compass Mode** — no finger prescribed. Miss a key and you get a
  directional hint: an arrow, the actual keyboard row(s) the two keys sit
  on, and a plain-language "the key you want is just to the left of it."
- **Full physical keyboard** — number row, symbols, brackets, backslash —
  not just the 26 letters. Practice text includes real code snippets
  (JS, Python, SQL) alongside plain-language lines and paragraphs.
- **Live stats** — WPM, accuracy, and elapsed time while you type.
- **Post-session report** — keystroke rollover percentage, same-finger vs
  cross-hand timing (Finger Mode), slowest key pairs, and per-key mistake
  breakdown with neighborhood context.
- **Non-intrusive mistake hints** — the hint panel is always present
  above the typing box (not popping in/out and shifting your layout), and
  fills with a "don't look down" filler line whenever you're not
  currently mid-mistake.

## Getting started

\`\`\`bash
npm install
npm run dev
\`\`\`

Then open the printed local URL. \`npm run build\` produces a production
build in \`dist/\`.

## Tech

React + Vite. No backend — everything (calibration, mode preference,
session count) is stored in \`localStorage\`.

## Project structure

\`\`\`
src/
  components/   Reusable UI: full keyboard, key-neighborhood grid, mistake hint, hand diagrams
  data/         Finger map, keyboard geometry, sample/code text, typing-insight calculations
  hooks/        useUserFingerMap — per-user calibrated finger mapping
  pages/        Landing, Guide, Calibrate, Practice, Report
\`\`\`
