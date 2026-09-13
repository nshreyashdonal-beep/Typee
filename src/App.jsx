import { useState } from "react";
import Landing from "./pages/Landing";
import Practice from "./pages/Practice";
import Report from "./pages/Report";
import Guide from "./pages/Guide";
import Calibrate from "./pages/Calibrate";
import { useUserFingerMap } from "./hooks/useUserFingerMap";

const SESSIONS_STORAGE_KEY = "tt_sessions";
const HELP_MODE_STORAGE_KEY = "tt_help_mode";

function App() {
  // Which page is currently visible: "landing" | "practice" | "guide" | "calibrate"
  const [page, setPage] = useState("landing");

  // Whether we're showing the typing box or the results report on the practice page.
  const [showReport, setShowReport] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  // How many sessions the user has completed, saved so it survives a page refresh.
  const [sessionCount, setSessionCount] = useState(() => {
    const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  // "finger" = assign each key a specific finger (calibratable) and give
  // finger-based feedback. "compass" = never assert a finger — mistakes are
  // explained by showing where the key sits among its physical neighbors,
  // so the learner can use whichever finger is comfortable for them.
  const [helpMode, setHelpMode] = useState(() => {
    return localStorage.getItem(HELP_MODE_STORAGE_KEY) || "finger";
  });

  function updateHelpMode(mode) {
    setHelpMode(mode);
    localStorage.setItem(HELP_MODE_STORAGE_KEY, mode);
  }

  // The user's own finger-to-key habits, set on the Calibrate page and
  // saved to localStorage. Falls back to the standard map until they set it.
  const { userMap, setFingerForKey, resetToStandard, hasCalibrated } = useUserFingerMap();

  function goTo(nextPage) {
    setPage(nextPage);
    if (nextPage === "practice") {
      setShowReport(false);
    }
  }

  function handleSessionFinished(result) {
    setLastResult(result);
    setShowReport(true);

    const nextCount = sessionCount + 1;
    setSessionCount(nextCount);
    localStorage.setItem(SESSIONS_STORAGE_KEY, String(nextCount));
  }

  function handlePracticeAgain() {
    setShowReport(false);
  }

  return (
    <>
      <nav>
        <button className="logo" onClick={() => goTo("landing")}>
          Typee
        </button>
        <div className="nav-links">
          <button className={page === "landing" ? "active" : ""} onClick={() => goTo("landing")}>
            Home
          </button>
          <button className={page === "practice" ? "active" : ""} onClick={() => goTo("practice")}>
            Practice
          </button>
          <button className={page === "guide" || page === "calibrate" ? "active" : ""} onClick={() => goTo("guide")}>
            Finger guide
          </button>
        </div>
      </nav>

      {page === "landing" && (
        <Landing
          sessionCount={sessionCount}
          onStartPractice={() => goTo("practice")}
          onSeeHowItWorks={() => goTo("practice")}
        />
      )}

      {page === "practice" && !showReport && (
        <Practice
          key={sessionCount}
          userMap={userMap}
          helpMode={helpMode}
          onSessionFinished={handleSessionFinished}
        />
      )}

      {page === "practice" && showReport && lastResult && (
        <Report
          result={lastResult}
          helpMode={helpMode}
          onPracticeAgain={handlePracticeAgain}
          onBackHome={() => goTo("landing")}
        />
      )}

      {page === "guide" && (
        <Guide
          userMap={userMap}
          hasCalibrated={hasCalibrated}
          helpMode={helpMode}
          onHelpModeChange={updateHelpMode}
          onCalibrate={() => goTo("calibrate")}
          onResetToStandard={resetToStandard}
        />
      )}

      {page === "calibrate" && (
        <Calibrate
          userMap={userMap}
          setFingerForKey={setFingerForKey}
          resetToStandard={resetToStandard}
          onDone={() => goTo("guide")}
        />
      )}

      <footer>Typee — an MVP practice build</footer>
    </>
  );
}

export default App;
