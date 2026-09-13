// The home page: intro text, the "sessions completed" stat, and the 4-step explainer.
export default function Landing({ sessionCount, onStartPractice, onSeeHowItWorks }) {
  return (
    <div className="page">
      <div className="hero">
        <h1>
          Train your fingers,
          <br />
          not your eyes.
        </h1>
        <p>
          A focused practice tool for learning real touch-typing — build the
          muscle memory to type without ever glancing at the keyboard.
        </p>
        <div className="btn-row">
          <button className="btn-primary" onClick={onStartPractice}>
            Start practicing
          </button>
          <button className="btn-secondary" onClick={onSeeHowItWorks}>
            See how it works
          </button>
        </div>

        <div className="stat-row">
          <div className="stat-cell">
            <div className="stat-label">wpm</div>
            <div className="stat-value">—</div>
          </div>
          <div className="stat-cell">
            <div className="stat-label">accuracy</div>
            <div className="stat-value">—</div>
          </div>
          <div className="stat-cell">
            <div className="stat-label">sessions</div>
            <div className="stat-value">{sessionCount}</div>
          </div>
        </div>

        <div className="steps">
          <div className="step">
            <div className="n">01</div>
            <h3>Read the line</h3>
            <p>A short line of text appears on screen.</p>
          </div>
          <div className="step">
            <div className="n">02</div>
            <h3>Type it</h3>
            <p>Type it out without looking down at your hands.</p>
          </div>
          <div className="step">
            <div className="n">03</div>
            <h3>Get your report</h3>
            <p>See your WPM, accuracy, rollover, and which pairs slowed you down.</p>
          </div>
          <div className="step">
            <div className="n">04</div>
            <h3>Practice again</h3>
            <p>Weak keys show up more often until they're not weak anymore.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
