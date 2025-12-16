import { useState, useEffect, useRef } from "react";
import "./App.css";
type Mode = "study" | "break";
type Tab = "timer" | "tasks";

interface Task {
  id: string;
  name: string;
  timeSpent: number; // in minutes
  timeGoal: number; // in minutes
}

function App() {
  // Load initial state from localStorage
  const getInitialState = <T,>(key: string, defaultValue: T): T => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    return defaultValue;
  };

  // Configuration state (in minutes)
  const [studyDuration, setStudyDuration] = useState(() => getInitialState("pomodoro-studyDuration", 25));
  const [breakDuration, setBreakDuration] = useState(() => getInitialState("pomodoro-breakDuration", 5));
  const [longBreakDuration, setLongBreakDuration] = useState(() => getInitialState("pomodoro-longBreakDuration", 30));

  // Timer state
  const [mode, setMode] = useState<Mode>("study");
  const [timeLeft, setTimeLeft] = useState(() => {
    // We can also persist timeLeft if desired, but let's default to studyDuration if not saved or if we want a fresh start on reload
    // For now, let's just reset to studyDuration to avoid confusion if the user comes back days later
    return getInitialState("pomodoro-studyDuration", 25) * 60;
  });
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(() => getInitialState("pomodoro-sessionsCompleted", 0));

  // Task state
  const [currentTab, setCurrentTab] = useState<Tab>("timer");
  const [tasks, setTasks] = useState<Task[]>(() => getInitialState("pomodoro-tasks", []));
  const [selectedTaskId, setSelectedTaskId] = useState<string>(() => getInitialState("pomodoro-selectedTaskId", ""));

  // New Task Input State
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskHours, setNewTaskHours] = useState(0);
  const [newTaskMinutes, setNewTaskMinutes] = useState(30);

  // Editing Task State
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskName, setEditTaskName] = useState("");
  const [editTaskHours, setEditTaskHours] = useState(0);
  const [editTaskMinutes, setEditTaskMinutes] = useState(0);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem("pomodoro-studyDuration", JSON.stringify(studyDuration));
    localStorage.setItem("pomodoro-breakDuration", JSON.stringify(breakDuration));
    localStorage.setItem("pomodoro-longBreakDuration", JSON.stringify(longBreakDuration));
    localStorage.setItem("pomodoro-sessionsCompleted", JSON.stringify(sessionsCompleted));
    localStorage.setItem("pomodoro-tasks", JSON.stringify(tasks));
    localStorage.setItem("pomodoro-selectedTaskId", JSON.stringify(selectedTaskId));
  }, [studyDuration, breakDuration, longBreakDuration, sessionsCompleted, tasks, selectedTaskId]);

  // Ref to hold the interval id
  const intervalRef = useRef<number | null>(null);

  // Audio Context for beep
  const playSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const now = ctx.currentTime;

      // Create two oscillators to simulate two bells
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const modOsc = ctx.createOscillator();
      const modGain = ctx.createGain();

      // Bell frequencies (dissonant to sound like a mechanical alarm)
      osc1.type = "square";
      osc1.frequency.value = 800;

      osc2.type = "square";
      osc2.frequency.value = 840;

      // Modulation (the "hammer" striking speed)
      modOsc.type = "square";
      modOsc.frequency.value = 20; // 20Hz ringing speed

      // Connect modulation
      modOsc.connect(modGain);
      modGain.connect(gain.gain);

      // Connect oscillators to main gain
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      // Set base gain (modulation will vary it)
      // We need the gain to go from 0 to 1 rapidly
      modGain.gain.value = 0.1; // Reduced depth of modulation

      // Envelope
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.1); // Reduced peak gain from 0.3 to 0.05
      gain.gain.setValueAtTime(0.05, now + 1.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      // Start everything
      osc1.start(now);
      osc2.start(now);
      modOsc.start(now);

      // Stop everything
      osc1.stop(now + 2.0);
      osc2.stop(now + 2.0);
      modOsc.stop(now + 2.0);

    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  // Update timeLeft when duration settings change, but only if timer is not active
  useEffect(() => {
    if (!isActive) {
      if (mode === "study") {
        setTimeLeft(studyDuration * 60);
      } else {
        // Only update break time if not active
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
    playSound();

    // Switch mode automatically
    if (mode === "study") {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);

      // Update task progress if a task is selected
      if (selectedTaskId) {
        setTasks(prevTasks => prevTasks.map(task => {
          if (task.id === selectedTaskId) {
            return { ...task, timeSpent: task.timeSpent + studyDuration };
          }
          return task;
        }));
      }

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
      if (sessionsCompleted > 0 && sessionsCompleted % 4 === 0) {
        setTimeLeft(longBreakDuration * 60);
      } else {
        setTimeLeft(breakDuration * 60);
      }
    }
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    const totalMinutes = (newTaskHours * 60) + newTaskMinutes;
    if (totalMinutes <= 0) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      name: newTaskName,
      timeSpent: 0,
      timeGoal: totalMinutes,
    };

    setTasks([...tasks, newTask]);
    setNewTaskName("");
    setNewTaskHours(0);
    setNewTaskMinutes(30);

    // Auto-select if it's the first task
    if (tasks.length === 0) {
      setSelectedTaskId(newTask.id);
    }
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (selectedTaskId === id) {
      setSelectedTaskId("");
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTaskName(task.name);
    setEditTaskHours(Math.floor(task.timeGoal / 60));
    setEditTaskMinutes(task.timeGoal % 60);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
  };

  const saveEditing = (id: string) => {
    const totalMinutes = (editTaskHours * 60) + editTaskMinutes;
    if (totalMinutes <= 0) return;

    setTasks(tasks.map(t => {
      if (t.id === id) {
        return { ...t, name: editTaskName, timeGoal: totalMinutes };
      }
      return t;
    }));
    setEditingTaskId(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatGoalTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) {
      return `${h}h ${m}m`;
    }
    return `${m}m`;
  };

  return (
    <main className={`container ${mode === "study" ? "study-mode" : "break-mode"}`}>
      <div className="glass-panel">
        <div className="tabs">
          <button
            className={`tab-btn ${currentTab === "timer" ? "active" : ""}`}
            onClick={() => setCurrentTab("timer")}
          >
            Timer
          </button>
          <button
            className={`tab-btn ${currentTab === "tasks" ? "active" : ""}`}
            onClick={() => setCurrentTab("tasks")}
          >
            Tasks
          </button>
        </div>

        {currentTab === "timer" ? (
          <>
            <h1>{mode === "study" ? "Focus Time" : "Relax Time"}</h1>

            <div className="session-info">
              Session #{sessionsCompleted + 1}
            </div>

            <div className="task-selector">
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                disabled={isActive}
              >
                <option value="">-- Select a task to focus --</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.name} ({formatGoalTime(task.timeSpent)} / {formatGoalTime(task.timeGoal)})
                  </option>
                ))}
              </select>
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
          </>
        ) : (
          <div className="tasks-view">
            <h2>My Tasks</h2>
            <form onSubmit={addTask} className="add-task-form">
              <input
                type="text"
                placeholder="Task name"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
              />
              <div className="time-input-group">
                <div className="time-field">
                  <label>Hrs</label>
                  <input
                    type="number"
                    value={newTaskHours}
                    onChange={(e) => setNewTaskHours(Number(e.target.value))}
                    min="0"
                  />
                </div>
                <div className="time-field">
                  <label>Min</label>
                  <input
                    type="number"
                    value={newTaskMinutes}
                    onChange={(e) => setNewTaskMinutes(Number(e.target.value))}
                    min="0"
                    max="59"
                  />
                </div>
              </div>
              <button type="submit">Add</button>
            </form>

            <div className="tasks-list">
              {tasks.length === 0 && <p className="empty-msg">No tasks created.</p>}
              {tasks.map(task => {
                const isEditing = editingTaskId === task.id;
                const progress = Math.min((task.timeSpent / task.timeGoal) * 100, 100);

                if (isEditing) {
                  return (
                    <div key={task.id} className="task-item editing">
                      <input
                        type="text"
                        value={editTaskName}
                        onChange={(e) => setEditTaskName(e.target.value)}
                        className="edit-name-input"
                      />
                      <div className="edit-time-inputs">
                        <input
                          type="number"
                          value={editTaskHours}
                          onChange={(e) => setEditTaskHours(Number(e.target.value))}
                          min="0"
                        /> h
                        <input
                          type="number"
                          value={editTaskMinutes}
                          onChange={(e) => setEditTaskMinutes(Number(e.target.value))}
                          min="0"
                          max="59"
                        /> m
                      </div>
                      <div className="edit-actions">
                        <button onClick={() => saveEditing(task.id)} className="save-btn">Save</button>
                        <button onClick={cancelEditing} className="cancel-btn">Cancel</button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={task.id} className="task-item">
                    <div className="task-header">
                      <span className="task-name">{task.name}</span>
                      <div className="task-meta">
                        <span>{formatGoalTime(task.timeSpent)} / {formatGoalTime(task.timeGoal)}</span>
                        <div className="task-actions">
                          <button onClick={() => startEditing(task)} className="icon-btn" title="Edit">✏️</button>
                          <button onClick={() => deleteTask(task.id)} className="icon-btn delete" title="Delete">🗑️</button>
                        </div>
                      </div>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
