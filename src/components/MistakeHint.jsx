import {
  describeMiss,
  relativeDirection,
  getKeyRow,
  getRowKeys,
  resolveBaseKey,
  DIRECTION_ARROWS,
} from "../data/keyNeighbors";
import { fingerFor } from "../data/fingerMap";
import KeyNeighborhood from "./KeyNeighborhood";

// Shown above the typing box (not inside it) at all times while Help is
// on — this is deliberate: if it only mounted when a mistake happened,
// the box popping in and out would push the type-box down and back up on
// every single keystroke. So instead it's always present, and just swaps
// its content between an idle filler line and the actual mistake hint.
//
// Finger Mode keeps the simple "that's your right pinky" line. Compass
// Mode shows the whole row(s) the two keys live on with an arrow pointing
// which way to move — more to go on than the small 3x3 neighborhood
// alone, especially when the miss is a few keys away.
export default function MistakeHint({ mode, expectedChar, wrongChar, userMap, idleMessage }) {
  if (!expectedChar) {
    return (
      <div className="mistake-hint mistake-hint-idle">
        <div className="mistake-hint-idle-text">{idleMessage}</div>
      </div>
    );
  }

  const expectedDisplay = expectedChar === " " ? "space" : expectedChar.toUpperCase();

  if (mode === "finger") {
    return (
      <div className="mistake-hint">
        <div className="mistake-hint-line">
          that key is <b>{expectedChar === " " ? "space" : expectedChar}</b>
        </div>
        <div className="mistake-hint-sub">{fingerFor(expectedChar, userMap)}</div>
      </div>
    );
  }

  // Compass Mode, but nothing pressed yet to compare against, or the miss
  // involves the space bar (which isn't part of the staggered row grid) —
  // fall back to the small 3x3 neighborhood instead of a row strip.
  const involvesSpace = expectedChar === " " || wrongChar === " ";
  if (!wrongChar || involvesSpace) {
    return (
      <div className="mistake-hint">
        <div className="mistake-hint-row-top">
          <div>
            <div className="mistake-hint-line">
              that key is <b>{expectedDisplay}</b>
            </div>
            <div className="mistake-hint-sub">
              {wrongChar ? describeMiss(expectedChar, wrongChar) : "use whichever finger's already nearby"}
            </div>
          </div>
          <KeyNeighborhood keyChar={expectedChar} wrongChar={wrongChar} size="sm" />
        </div>
      </div>
    );
  }

  const rel = relativeDirection(wrongChar, expectedChar);
  const rowWrong = getKeyRow(wrongChar);
  const rowCorrect = getKeyRow(expectedChar);
  const rows = rowWrong == null || rowCorrect == null
    ? []
    : [...new Set([rowWrong, rowCorrect])].sort((a, b) => a - b);

  return (
    <div className="mistake-hint mistake-hint-directional">
      <div className="mistake-hint-row-top">
        {rel && <div className="mistake-hint-arrow">{DIRECTION_ARROWS[rel.dir]}</div>}
        <div>
          <div className="mistake-hint-line">
            You pressed <b className="wrong-char">{wrongChar.toUpperCase()}</b> — you want{" "}
            <b className="correct-char">{expectedDisplay}</b>
          </div>
          <div className="mistake-hint-sub">{describeMiss(expectedChar, wrongChar)}</div>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="mistake-hint-rows">
          {rows.map((rowIndex) => (
            <div className="mistake-hint-strip" key={rowIndex}>
              {getRowKeys(rowIndex).map((label) => {
                const lower = label.toLowerCase();
                // wrongChar/expectedChar might be a shifted symbol (e.g. "@")
                // that isn't a key of its own — it's what "2" shows when
                // shifted — so resolve back to the physical base label
                // before comparing against the row's key labels.
                const isWrong = lower === resolveBaseKey(wrongChar).toLowerCase();
                const isCorrect = lower === resolveBaseKey(expectedChar).toLowerCase();
                return (
                  <div
                    key={label}
                    className={
                      "mistake-hint-key" +
                      (isWrong ? " is-wrong" : "") +
                      (isCorrect ? " is-correct" : "")
                    }
                  >
                    {label.length === 1 ? label.toUpperCase() : label}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
