import { KEYBOARD_ROWS, BOTTOM_ROW, SHIFT_SYMBOLS, MODIFIER_LABELS } from "../data/keyNeighbors";
import { HOME_ROW } from "../data/fingerMap";

// Renders a real full-size keyboard: proportional key widths (wide
// Backspace/Tab/Caps/Enter/Shift, a long space bar), the number row with
// its shifted symbols shown the way a real keycap prints them, and the
// bottom control row (Ctrl/Alt/arrows) — instead of a flat row of equal
// squares. Used by both Finger Mode and Compass Mode on the Guide page so
// they share one accurate layout.
//
// `typableKeyProps(char)` is called for every typable key (a single
// character, or " " for the space bar) and should return
// { style, onClick, extraClassName } — this is how the caller supplies
// finger coloring (Finger Mode) or click-to-preview + selection highlight
// (Compass Mode) without this component needing to know which mode it's in.
// Modifier keys (Tab, Shift, arrows, etc.) always render as plain,
// non-interactive gray keycaps.
export default function FullKeyboard({ typableKeyProps, showBottomRow = true }) {
  return (
    <div className="fullkeyboard">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div className="fullkey-row" key={rowIndex}>
          {row.map(([label, width], i) => (
            <Key
              key={label + i}
              label={label}
              width={width}
              typableKeyProps={typableKeyProps}
            />
          ))}
        </div>
      ))}
      {showBottomRow && (
        <div className="fullkey-row">
          {BOTTOM_ROW.map(([label, width], i) => (
            <Key key={label + i} label={label} width={width} typableKeyProps={typableKeyProps} />
          ))}
        </div>
      )}
    </div>
  );
}

function Key({ label, width, typableKeyProps }) {
  const isSpace = label === "Space";
  const isTypable = !MODIFIER_LABELS.has(label) && (isSpace || label.length === 1);
  const char = isSpace ? " " : label;
  const shiftSym = isTypable ? SHIFT_SYMBOLS[label] : null;
  const showDot = isTypable && !isSpace && HOME_ROW.includes(label);

  const extra = isTypable && typableKeyProps ? typableKeyProps(char) : null;

  const style = {
    flexGrow: width,
    flexBasis: 0,
    ...(extra?.style || {}),
  };

  return (
    <div
      className={
        "fullkey" +
        (isTypable ? " fullkey-typable" : " fullkey-mod") +
        (isSpace ? " fullkey-space" : "") +
        (shiftSym ? " fullkey-dual" : "") +
        (extra?.extraClassName ? " " + extra.extraClassName : "")
      }
      style={style}
      onClick={extra?.onClick}
    >
      {isSpace ? (
        "space"
      ) : shiftSym ? (
        <>
          <span className="fullkey-shift">{shiftSym}</span>
          <span className="fullkey-base">{label}</span>
        </>
      ) : (
        <span className="fullkey-base">
          {label.length === 1 ? label.toUpperCase() : label}
        </span>
      )}
      {showDot && <div className="dot" />}
    </div>
  );
}
