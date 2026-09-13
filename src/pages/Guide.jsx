import { useState } from "react";
import GuideHand from "../components/GuideHand";
import KeyNeighborhood from "../components/KeyNeighborhood";
import FullKeyboard from "../components/FullKeyboard";
import {
  FINGER_COLORS,
  FINGER_TEXT,
  LEGEND_GROUPS,
  fingerFor,
} from "../data/fingerMap";

function HelpModeSwitch({ helpMode, onHelpModeChange }) {
  return (
    <div className="helpmode-switch">
      <button
        className={"helpmode-card" + (helpMode === "finger" ? " active" : "")}
        onClick={() => onHelpModeChange("finger")}
      >
        <div className="helpmode-title">Finger Mode</div>
        <div className="helpmode-desc">
          Every key is assigned to a specific finger. Calibrate it to match your
          own habits, or use the textbook mapping.
        </div>
      </button>
      <button
        className={"helpmode-card" + (helpMode === "compass" ? " active" : "")}
        onClick={() => onHelpModeChange("compass")}
      >
        <div className="helpmode-title">Compass Mode</div>
        <div className="helpmode-desc">
          No finger is prescribed. Mistakes show the key's position among its
          neighbors instead — use whatever finger is comfortable.
        </div>
      </button>
    </div>
  );
}

function FingerGuideBody({ userMap, hasCalibrated, onCalibrate, onResetToStandard }) {
  return (
    <>
      <p className="muted" style={{ maxWidth: 520, lineHeight: 1.6, margin: "0 0 20px" }}>
        Rest your fingers on the home row first — left hand on A S D F, right
        hand on J K L ; . Every other key on the keyboard belongs to one of
        these eight fingers.
      </p>

      <div className="btn-row" style={{ marginBottom: 30 }}>
        <button className="btn-secondary" onClick={onCalibrate}>
          {hasCalibrated ? "Re-calibrate my fingers" : "Use my actual fingers instead"}
        </button>
        {hasCalibrated && (
          <button className="new-line-btn" onClick={onResetToStandard}>
            Reset to standard
          </button>
        )}
      </div>

      {hasCalibrated && (
        <p className="muted" style={{ fontSize: 12, margin: "-16px 0 24px" }}>
          Showing your calibrated map, not the textbook one.
        </p>
      )}

      <div className="guide-hands">
        <GuideHand side="left" />
        <GuideHand side="right" />
      </div>

      <div className="guide-panel">
        <div className="guide-keyboard">
          <FullKeyboard
            typableKeyProps={(char) => {
              const finger = fingerFor(char, userMap);
              return {
                style: { background: FINGER_COLORS[finger], color: FINGER_TEXT[finger] },
              };
            }}
          />
        </div>
      </div>

      <div className="guide-panel">
        <div className="guide-legend">
          {LEGEND_GROUPS.map((g) => (
            <div className="legend-item" key={g.name}>
              <div className="legend-swatch" style={{ background: FINGER_COLORS[g.finger] }} />
              <div>
                <div className="legend-name">{g.name}</div>
                <div className="legend-keys">{g.keys.join("  ").toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function CompassGuideBody() {
  const [previewKey, setPreviewKey] = useState("q");

  return (
    <>
      <p className="muted" style={{ maxWidth: 520, lineHeight: 1.6, margin: "0 0 20px" }}>
        No key is assigned to a specific finger here. Miss a key and you'll see
        a small map of that key and whatever sits around it — left, right,
        above, below — so you learn where it lives. Reach it however feels
        natural.
      </p>

      <div className="guide-panel">
        <div className="guide-panel-header">
          <div className="section-label" style={{ margin: 0 }}>
            tap a key to preview its neighborhood
          </div>
        </div>
        <div className="guide-keyboard" style={{ marginTop: 16 }}>
          <FullKeyboard
            typableKeyProps={(char) => ({
              extraClassName: "editable" + (char === previewKey ? " compass-selected" : ""),
              style:
                char === previewKey
                  ? { background: "var(--accent)", color: "var(--bg)" }
                  : { background: "#26261F", color: "var(--muted)" },
              onClick: () => setPreviewKey(char),
            })}
          />
        </div>
      </div>

      <div className="guide-panel" style={{ display: "flex", justifyContent: "center" }}>
        <KeyNeighborhood keyChar={previewKey} size="lg" />
      </div>
    </>
  );
}

export default function Guide({
  userMap,
  hasCalibrated,
  helpMode = "finger",
  onHelpModeChange,
  onCalibrate,
  onResetToStandard,
}) {
  return (
    <div className="page">
      <div style={{ padding: "70px 0 20px" }}>
        <h1 className="mono" style={{ fontSize: 30, fontWeight: 500, margin: "0 0 14px" }}>
          {helpMode === "compass" ? "Where each key lives" : "Which finger goes where"}
        </h1>

        <HelpModeSwitch helpMode={helpMode} onHelpModeChange={onHelpModeChange} />

        {helpMode === "finger" ? (
          <FingerGuideBody
            userMap={userMap}
            hasCalibrated={hasCalibrated}
            onCalibrate={onCalibrate}
            onResetToStandard={onResetToStandard}
          />
        ) : (
          <CompassGuideBody />
        )}
      </div>
    </div>
  );
}
