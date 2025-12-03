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
  // Configuration state (in minutes)
  const [studyDuration, setStudyDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(30);

  // Timer state
  const [mode, setMode] = useState<Mode>("study");
  const [timeLeft, setTimeLeft] = useState(studyDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Task state
  const [currentTab, setCurrentTab] = useState<Tab>("timer");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskGoal, setNewTaskGoal] = useState(30);

  // Ref to hold the interval id
  const intervalRef = useRef<number | null>(null);

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

    const newTask: Task = {
      id: crypto.randomUUID(),
      name: newTaskName,
      timeSpent: 0,
      timeGoal: newTaskGoal,
    };

    setTasks([...tasks, newTask]);
    setNewTaskName("");

    // Auto-select if it's the first task
    if (tasks.length === 0) {
      setSelectedTaskId(newTask.id);
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
            Tarefas
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
                <option value="">-- Selecione uma tarefa para focar --</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.name} ({task.timeSpent}/{task.timeGoal} min)
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
            <h2>Minhas Tarefas</h2>
            <form onSubmit={addTask} className="add-task-form">
              <input
                type="text"
                placeholder="Nome da tarefa"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
              />
              <div className="goal-input">
                <label>Meta (min):</label>
                <input
                  type="number"
                  value={newTaskGoal}
                  onChange={(e) => setNewTaskGoal(Number(e.target.value))}
                  min="1"
                />
              </div>
              <button type="submit">Adicionar</button>
            </form>

            <div className="tasks-list">
              {tasks.length === 0 && <p className="empty-msg">Nenhuma tarefa criada.</p>}
              {tasks.map(task => {
                const progress = Math.min((task.timeSpent / task.timeGoal) * 100, 100);
                return (
                  <div key={task.id} className="task-item">
                    <div className="task-header">
                      <span>{task.name}</span>
                      <span>{task.timeSpent} / {task.timeGoal} min</span>
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
