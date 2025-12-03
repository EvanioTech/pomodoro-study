import { useState, useEffect, useRef } from "react";
import "./App.css";

type Mode = "study" | "break";

function App() {
  // Configuration state (in minutes)
  const [studyDuration, setStudyDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(30);

  // Timer state
  const [mode, setMode] = useState<Mode>("study");
  const [timeLeft, setTimeLeft] = useState(studyDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Ref to hold the interval id
  const intervalRef = useRef<number | null>(null);

  // Update timeLeft when duration settings change, but only if timer is not active
  useEffect(() => {
    if (!isActive) {
      if (mode === "study") {
        setTimeLeft(studyDuration * 60);
      } else {
        // If we are in break mode, we need to check if it's a long break or short break
        // But for simplicity, if the user changes settings while in break, we might just reset to the standard break
        // or the long break depending on session count.
        // Let's keep it simple: if in break, reset to breakDuration unless it was a long break.
        // Actually, determining if it WAS a long break is tricky without extra state.
        // Let's just update based on the current breakDuration for now to avoid complexity,
        // or better, just leave it be until reset.
        // For this implementation, we'll just update study time if in study mode.
      }
    }
  }, [studyDuration, breakDuration, longBreakDuration, mode]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const handleTimerComplete = () => {
    setIsActive(false);

    // Switch mode automatically
    if (mode === "study") {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);
      setMode("break");

      // Check for long break (every 4th session)
      if (newSessionsCompleted > 0 && newSessionsCompleted % 4 === 0) {
        setTimeLeft(longBreakDuration * 60);
      } else {
        setTimeLeft(breakDuration * 60);
      }
    } else {
      setMode("study");
      setTimeLeft(studyDuration * 60);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === "study") {
      setTimeLeft(studyDuration * 60);
    } else {
      // If resetting during a break, we need to know if it's a long break.
      // We can infer it from sessionsCompleted.
      if (sessionsCompleted > 0 && sessionsCompleted % 4 === 0) {
        setTimeLeft(longBreakDuration * 60);
      } else {
        setTimeLeft(breakDuration * 60);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <main className={`container ${mode === "study" ? "study-mode" : "break-mode"}`}>
      <div className="glass-panel">
        <h1>{mode === "study" ? "Focus Time" : "Relax Time"}</h1>

        <div className="session-info">
          Session #{sessionsCompleted + 1}
        </div>

        <div className="timer-display">
          {formatTime(timeLeft)}
        </div>

        <div className="controls">
          <button onClick={toggleTimer}>
            {isActive ? "Pause" : "Start"}
          </button>
          <button onClick={resetTimer}>Reset</button>
        </div>

        <div className="settings">
          <div className="setting-group">
            <label>Study</label>
            <input
              type="number"
              value={studyDuration}
              onChange={(e) => setStudyDuration(Number(e.target.value))}
              min="1"
            />
          </div>
          <div className="setting-group">
            <label>Break</label>
            <input
              type="number"
              value={breakDuration}
              onChange={(e) => setBreakDuration(Number(e.target.value))}
              min="1"
            />
          </div>
          <div className="setting-group">
            <label>Long Break</label>
            <input
              type="number"
              value={longBreakDuration}
              onChange={(e) => setLongBreakDuration(Number(e.target.value))}
              min="1"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
