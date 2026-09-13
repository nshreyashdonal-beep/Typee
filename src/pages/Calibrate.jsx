import { useState } from "react";
import { CALIBRATION_KEYS, FINGERS, FINGER_MAP } from "../data/fingerMap";

const FINGER_SHORT_LABELS = {
  "left pinky": "L pinky",
  "left ring": "L ring",
  "left middle": "L middle",
  "left index": "L index",
  "right index": "R index",
  "right middle": "R middle",
  "right ring": "R ring",
  "right pinky": "R pinky",
};

export default function Calibrate({ userMap, setFingerForKey, resetToStandard, onDone }) {
  const [step, setStep] = useState(0);
  const finished = step >= CALIBRATION_KEYS.length;
  const currentKey = CALIBRATION_KEYS[step];
  const suggested = FINGER_MAP[currentKey];

  function choose(finger) {
    setFingerForKey(currentKey, finger);
    setStep((s) => s + 1);
  }

  function restart() {
    resetToStandard();
    setStep(0);
  }

  if (finished) {
    return (
      <div className="page">
        <div style={{ padding: "70px 0 20px" }}>
          <h1 className="mono" style={{ fontSize: 30, fontWeight: 500, margin: "0 0 14px" }}>
            You're calibrated
          </h1>
          <p className="muted" style={{ maxWidth: 520, lineHeight: 1.6, margin: "0 0 30px" }}>
            Your finger guide and reports now use the fingers you actually use —
            not the textbook mapping — so your weak-key and tough-pair insights
            will match your real habits.
          </p>
          <div className="calibrate-done">
            <div className="btn-row" style={{ justifyContent: "center", marginBottom: 0 }}>
              <button className="btn-primary" onClick={onDone}>
                See my finger guide
              </button>
              <button className="btn-secondary" onClick={restart}>
                Start over
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ padding: "70px 0 20px" }}>
        <h1 className="mono" style={{ fontSize: 30, fontWeight: 500, margin: "0 0 14px" }}>
          Which finger do you actually use?
        </h1>
        <p className="muted" style={{ maxWidth: 520, lineHeight: 1.6, margin: "0 0 30px" }}>
          Answer honestly, not textbook-correctly — this builds a guide and
          report around your real habits, not the standard one. Takes about a minute.
        </p>

        <div className="calibrate-progress">
          key {step + 1} of {CALIBRATION_KEYS.length}
        </div>

        <div className="calibrate-card">
          <div className="calibrate-key mono">
            {currentKey === " " ? "space" : currentKey.toUpperCase()}
          </div>
          <div className="finger-picker">
            {FINGERS.map((finger) => (
              <button
                key={finger}
                className={"finger-btn" + (finger === suggested ? " suggested" : "")}
                onClick={() => choose(finger)}
              >
                {FINGER_SHORT_LABELS[finger]}
              </button>
            ))}
          </div>
        </div>

        <p className="muted" style={{ fontSize: 12, textAlign: "center" }}>
          Highlighted button is the textbook suggestion — pick a different one if that's not what you do.
        </p>
      </div>
    </div>
  );
}
