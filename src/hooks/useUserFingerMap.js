import { useEffect, useState } from "react";

const STORAGE_KEY = "tt_user_finger_map";

// Manages the user's own finger-to-key overrides. Starts empty (meaning
// "use the standard map for everything") until the user calibrates,
// at which point their choices are saved and reused across sessions.
export function useUserFingerMap() {
  const [userMap, setUserMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userMap));
  }, [userMap]);

  function setFingerForKey(key, finger) {
    setUserMap((prev) => ({ ...prev, [key.toLowerCase()]: finger }));
  }

  function resetToStandard() {
    setUserMap({});
  }

  const hasCalibrated = Object.keys(userMap).length > 0;

  return { userMap, setFingerForKey, resetToStandard, hasCalibrated };
}
