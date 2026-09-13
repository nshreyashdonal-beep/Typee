import KeyNeighborhood from "../components/KeyNeighborhood";

// Shows the results of the last session: wpm/accuracy/time, the technique
// insight panel (rollover, consistency, tough pairs, and why), and weak keys.
export default function Report({ result, helpMode = "finger", onPracticeAgain, onBackHome }) {
  const { wpm, accuracy, elapsed, mistakesByKey, strictMode, rolloverPct, consistencyScore, notes } = result;

  const weakKeys = Object.entries(mistakesByKey)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxCount = weakKeys.length > 0 ? weakKeys[0][1] : 0;

  return (
    <div className="page report">
      <h2>Session complete</h2>

      <div className="stat-row">
        {strictMode === "learning" ? (
          <>
            <div className="stat-cell">
              <div className="stat-label">total mistakes</div>
              <div className="stat-value">{Object.values(mistakesByKey).reduce((a, b) => a + b, 0)}</div>
            </div>
            <div className="stat-cell">
              <div className="stat-label">time</div>
              <div className="stat-value">{elapsed.toFixed(1)}s</div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-cell">
              <div className="stat-label">wpm</div>
              <div className="stat-value">{wpm}</div>
            </div>
            <div className="stat-cell">
              <div className="stat-label">accuracy</div>
              <div className="stat-value" style={{ color: "var(--sage)" }}>
                {accuracy}%
              </div>
            </div>
            <div className="stat-cell">
              <div className="stat-label">time</div>
              <div className="stat-value">{elapsed.toFixed(1)}s</div>
            </div>
          </>
        )}
      </div>

      <div className="section-label">why your speed landed here</div>
      <div className="insight-panel">
        <div className="insight-metrics">
          <div className="insight-metric">
            <div className="val mono">{rolloverPct}%</div>
            <div className="lbl">rollover</div>
          </div>
          {helpMode === "finger" && (
            <div className="insight-metric">
              <div className="val mono">{consistencyScore != null ? consistencyScore : "—"}</div>
              <div className="lbl">finger-map consistency</div>
            </div>
          )}
        </div>
        <div className="insight-notes">
          {notes.length === 0 ? (
            <div className="insight-note">
              <div className="dot" />
              <div>Not enough data yet to explain this session — try a longer line or paragraph.</div>
            </div>
          ) : (
            notes.map((note, i) => (
              <div className="insight-note" key={i}>
                <div className="dot" />
                <div>{note}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="section-label">weak keys</div>
      <div style={{ marginBottom: 32 }}>
        {weakKeys.length === 0 ? (
          <div style={{ fontSize: 14, color: "var(--sage)" }}>No mistakes — clean run.</div>
        ) : (
          weakKeys.map(([key, count]) => {
            const pct = Math.round((count / maxCount) * 100);
            const display = key === " " ? "␣" : key;
            return (
              <div className="weak-row" key={key}>
                <div className="weak-key">{display}</div>
                <div className="weak-bar-track">
                  <div className="weak-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="weak-count">
                  {count} miss{count > 1 ? "es" : ""}
                </div>
                {helpMode === "compass" && <KeyNeighborhood keyChar={key} size="sm" />}
              </div>
            );
          })
        )}
      </div>

      <button className="btn-primary" onClick={onPracticeAgain}>
        Practice again
      </button>
      <button className="btn-secondary" style={{ marginLeft: 8 }} onClick={onBackHome}>
        Back home
      </button>
    </div>
  );
}
