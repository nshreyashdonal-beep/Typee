import { useEffect, useRef, useState } from "react";
import { pickText } from "../data/sampleText";
import { computeTypingInsights } from "../data/typingInsights";
import { pickIdleMessage } from "../data/idleMessages";
import MistakeHint from "../components/MistakeHint";

// Works out live wpm / accuracy / elapsed time from the current session state.
function computeStats({ target, startTime, endTime, totalKeystrokes, totalErrors }) {
  const elapsed = startTime ? ((endTime || Date.now()) - startTime) / 1000 : 0;
  const wordsTyped = target.length / 5;
  const wpm = elapsed > 0 ? Math.round((wordsTyped / elapsed) * 60) : 0;
  const accuracy =
    totalKeystrokes > 0
      ? Math.round(((totalKeystrokes - totalErrors) / totalKeystrokes) * 100)
      : 100;
  return { wpm, accuracy, elapsed };
}

// textMode values: "line" | "paragraph" | "code-line" | "code-paragraph".
// The UI splits this into two independent toggles (content + length) but
// it's stored as one combined value everywhere else, since that's what
// pickText already expects.
function isCode(textMode) {
  return textMode.startsWith("code");
}
function lengthOf(textMode) {
  return textMode.endsWith("paragraph") ? "paragraph" : "line";
}
function combine(content, length) {
  return content === "code" ? `code-${length}` : length;
}

export default function Practice({ userMap, helpMode = "finger", onSessionFinished }) {
  const [textMode, setTextMode] = useState("line"); // see textMode values above
  const [strictMode, setStrictMode] = useState("learning"); // "learning" | "test"
  const [helpEnabled, setHelpEnabled] = useState(true);

  const [target, setTarget] = useState(() => pickText("line"));
  const [typed, setTyped] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [mistakesByKey, setMistakesByKey] = useState({});
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [finished, setFinished] = useState(false);
  const [shake, setShake] = useState(false);
  const [hintChar, setHintChar] = useState(null); // character to show a finger-hint for
  const [hintWrongChar, setHintWrongChar] = useState(null); // what they actually pressed instead
  const [idleMessage, setIdleMessage] = useState(() => pickIdleMessage());

  // Re-render every 250ms while typing so the live wpm/time keep ticking.
  const [, forceTick] = useState(0);
  const typeBoxRef = useRef(null);

  // Keystroke timing log, used to measure rollover and bigram timing.
  // completedRef holds finished {char, downTime, upTime} entries.
  // pendingRef holds keys that are down but haven't come back up yet —
  // this is what lets us detect real overlap between two different keys.
  const completedRef = useRef([]);
  const pendingRef = useRef([]);

  useEffect(() => {
    if (!startTime || finished) return;
    const id = setInterval(() => forceTick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [startTime, finished]);

  useEffect(() => {
    typeBoxRef.current?.focus();
  }, []);

  function resetSession(nextTextMode = textMode) {
    setTarget(pickText(nextTextMode));
    setTyped("");
    setStartTime(null);
    setEndTime(null);
    setMistakesByKey({});
    setTotalKeystrokes(0);
    setTotalErrors(0);
    setFinished(false);
    setHintChar(null);
    setHintWrongChar(null);
    setIdleMessage(pickIdleMessage());
    completedRef.current = [];
    pendingRef.current = [];
    typeBoxRef.current?.focus();
  }

  function handleTextMode(mode) {
    setTextMode(mode);
    resetSession(mode);
  }

  function handleStrictMode(mode) {
    setStrictMode(mode);
    resetSession();
  }

  function finishSession(finalKeystrokes, finalErrors, finalMistakes) {
    const end = Date.now();
    setEndTime(end);
    setFinished(true);
    const { wpm, accuracy, elapsed } = computeStats({
      target,
      startTime,
      endTime: end,
      totalKeystrokes: finalKeystrokes,
      totalErrors: finalErrors,
    });

    // Any key still "pending" (pressed but not yet released) at the end of
    // the session is assumed to release instantly — this only ever affects
    // the very last character typed, so the effect on the stats is negligible.
    const stragglers = pendingRef.current.map((p) => ({ ...p, upTime: p.downTime }));
    const fullLog = [...completedRef.current, ...stragglers].sort((a, b) => a.downTime - b.downTime);

    const insights = computeTypingInsights(fullLog, userMap, accuracy, helpMode);

    onSessionFinished({ wpm, accuracy, elapsed, mistakesByKey: finalMistakes, strictMode, ...insights });
  }

  function handleKeyDown(e) {
    if (finished) return;
    if (e.key.length > 1 && e.key !== "Backspace" && e.key !== " ") return;
    e.preventDefault();

    const downTime = Date.now();

    let currentStart = startTime;
    if (!currentStart) {
      currentStart = Date.now();
      setStartTime(currentStart);
    }

    if (e.key === "Backspace") {
      setTyped((t) => t.slice(0, -1));
      return;
    }

    const index = typed.length;
    if (index >= target.length) return;

    const char = e.key === " " ? " " : e.key;
    const expected = target[index];

    // Record that this key went down (and is still "pending" — not yet
    // released). handleKeyUp will close it out and, if another key's
    // keydown lands before this key's keyup, that's rollover.
    pendingRef.current.push({ char, downTime });

    if (char !== expected) {
      const nextKeystrokes = totalKeystrokes + 1;
      const nextErrors = totalErrors + 1;
      const nextMistakes = { ...mistakesByKey, [expected]: (mistakesByKey[expected] || 0) + 1 };
      setTotalKeystrokes(nextKeystrokes);
      setTotalErrors(nextErrors);
      setMistakesByKey(nextMistakes);

      if (helpEnabled) {
        setHintChar(expected);
        setHintWrongChar(char);
      }

      if (strictMode === "learning") {
        // Block advancement: flash the current character red, don't append it.
        setShake(true);
        setTimeout(() => setShake(false), 150);
        return;
      }
      // In test mode we still move on, just recording the mistake above.
      const nextTyped = typed + char;
      setTyped(nextTyped);
      if (nextTyped.length === target.length) {
        finishSession(nextKeystrokes, nextErrors, nextMistakes);
      }
      return;
    }

    const nextKeystrokes = totalKeystrokes + 1;
    setTotalKeystrokes(nextKeystrokes);
    setHintChar(null);
    setHintWrongChar(null);
    const nextTyped = typed + char;
    setTyped(nextTyped);

    if (nextTyped.length === target.length) {
      finishSession(nextKeystrokes, totalErrors, mistakesByKey);
    }
  }

  function handleKeyUp(e) {
    const char = e.key === " " ? " " : e.key;
    const upTime = Date.now();
    // Find the most recent pending entry for this exact character and close it out.
    const idx = pendingRef.current.map((p) => p.char).lastIndexOf(char);
    if (idx === -1) return;
    const [entry] = pendingRef.current.splice(idx, 1);
    completedRef.current.push({ ...entry, upTime });
  }

  const stats = computeStats({ target, startTime, endTime, totalKeystrokes, totalErrors });

  return (
    <div className="page">
      <div className="practice-header">
        <div className="practice-label">
          practice · {isCode(textMode) ? "code" : "text"} · {lengthOf(textMode)} ·{" "}
          {strictMode === "learning" ? "learning mode" : "test mode"}
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div className="mode-toggle">
            <button
              className={"mode-btn" + (!isCode(textMode) ? " active" : "")}
              onClick={() => handleTextMode(combine("text", lengthOf(textMode)))}
            >
              Text
            </button>
            <button
              className={"mode-btn" + (isCode(textMode) ? " active" : "")}
              onClick={() => handleTextMode(combine("code", lengthOf(textMode)))}
            >
              Code
            </button>
          </div>
          <div className="mode-toggle">
            <button
              className={"mode-btn" + (lengthOf(textMode) === "line" ? " active" : "")}
              onClick={() => handleTextMode(combine(isCode(textMode) ? "code" : "text", "line"))}
            >
              Line
            </button>
            <button
              className={"mode-btn" + (lengthOf(textMode) === "paragraph" ? " active" : "")}
              onClick={() => handleTextMode(combine(isCode(textMode) ? "code" : "text", "paragraph"))}
            >
              Paragraph
            </button>
          </div>
          <div className="mode-toggle">
            <button
              className={"mode-btn" + (strictMode === "learning" ? " active" : "")}
              onClick={() => handleStrictMode("learning")}
            >
              Learning
            </button>
            <button
              className={"mode-btn" + (strictMode === "test" ? " active" : "")}
              onClick={() => handleStrictMode("test")}
            >
              Test
            </button>
          </div>
          <div className="mode-toggle">
            <button
              className={"mode-btn" + (helpEnabled ? " active" : "")}
              onClick={() => setHelpEnabled(true)}
            >
              Help on
            </button>
            <button
              className={"mode-btn" + (!helpEnabled ? " active" : "")}
              onClick={() => {
                setHelpEnabled(false);
                setHintChar(null);
                setHintWrongChar(null);
              }}
            >
              Help off
            </button>
          </div>
          <button className="new-line-btn" onClick={() => resetSession()}>
            New text
          </button>
        </div>
      </div>

      {helpEnabled && (
        <MistakeHint
          mode={helpMode}
          expectedChar={hintChar}
          wrongChar={hintWrongChar}
          userMap={userMap}
          idleMessage={idleMessage}
        />
      )}

      <div
        className="type-box"
        tabIndex={0}
        ref={typeBoxRef}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      >
        <div className={"target-text" + (shake ? " shake" : "")}>
          {target.split("").map((ch, i) => {
            let cls = "char-pending";
            if (i < typed.length) {
              cls = typed[i] === ch ? "char-correct" : "char-wrong";
            }
            const isCursor = i === typed.length;
            return (
              <span
                key={i}
                className={cls + (isCursor ? " char-cursor" : "")}
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            );
          })}
        </div>

        <div className="live-stats">
          {strictMode === "learning" ? (
            <>
              <div>
                mistakes <b>{totalErrors}</b>
              </div>
              <div>
                time <b>{stats.elapsed.toFixed(0)}s</b>
              </div>
            </>
          ) : (
            <>
              <div>
                wpm <b>{stats.wpm}</b>
              </div>
              <div>
                accuracy <b className="acc">{stats.accuracy}%</b>
              </div>
              <div>
                time <b>{stats.elapsed.toFixed(0)}s</b>
              </div>
            </>
          )}
        </div>

        {!startTime && (
          <div className="hint">
            click here and start typing — the timer starts on your first key
          </div>
        )}
      </div>
    </div>
  );
}
