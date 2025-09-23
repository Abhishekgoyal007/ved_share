import React, { useState, useEffect, useRef } from "react";
import TimerDisplay from "./TimerDisplay";
import ControlButtons from "./ControlButtons";
import AddSessionForm from "./AddSessionForm";
import SessionList from "./SessionList";

export default function PomodoroTab() {
  const [sessions, setSessions] = useState([]); // 🧼 Start empty
  const [currentIndex, setCurrentIndex] = useState(null); // No session selected
  const [showAddForm, setShowAddForm] = useState(false);

  const timerRef = useRef(null);

  const currentSession = sessions[currentIndex] || {};
  const isRunning = currentSession?.isRunning;

  // 🔁 Timer tick effect
useEffect(() => {
  if (currentIndex === null || !isRunning) {
    clearInterval(timerRef.current);
    return;
  }

  timerRef.current = setInterval(() => {
    setSessions((prev) => {
      return prev.map((session, idx) => {
        if (idx === currentIndex) {
          if (session.timeLeft > 0) {
            return { ...session, timeLeft: session.timeLeft - 1 };
          } else {
            clearInterval(timerRef.current);
            return { ...session, isRunning: false };
          }
        }
        return session;
      });
    });
  }, 1000);

  return () => clearInterval(timerRef.current);
}, [currentIndex, isRunning]);

  const toggleSessionRunning = (index) => {
    setSessions((prev) =>
      prev.map((s, i) =>
        i === index
          ? { ...s, isRunning: !s.isRunning }
          : { ...s, isRunning: false }
      )
    );
    setCurrentIndex(index);
  };

  const handleReset = () => {
    clearInterval(timerRef.current);
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        timeLeft: s.duration * 60,
        isRunning: false,
      }))
    );
    setCurrentIndex(null);
  };

  const handleDeleteSession = (indexToDelete) => {
  setSessions((prev) => {
    const updated = prev.filter((_, idx) => idx !== indexToDelete);
    
    // Adjust currentIndex
    if (currentIndex === indexToDelete) {
      return updated.length ? (setCurrentIndex(0), updated) : (setCurrentIndex(null), updated);
    } else if (indexToDelete < currentIndex) {
      setCurrentIndex((prev) => prev - 1);
    }

    return updated;
  });
};

  const handleStop = () => {
    clearInterval(timerRef.current);
    setSessions((prev) => prev.map((s) => ({ ...s, isRunning: false })));
  };

  const handleAddSession = (label, duration) => {
    setSessions((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        label,
        duration,
        timeLeft: duration * 60,
        isRunning: false,
      },
    ]);
    setShowAddForm(false);
    if (currentIndex === null) setCurrentIndex(0); // auto select first
  };

  const theme = {
    PRIMARY: "#06b6d4", // cyan-400
    BG: "#111827", // gray-900
    CARD: "#1f2937", // gray-800
    TEXT: "#d1d5db", // gray-300
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen"
      style={{ background: theme.BG }}
    >
      <div
        className="w-96 rounded-2xl p-6 flex flex-col items-center space-y-6"
        style={{ background: theme.CARD }}
      >
        <h2 className="text-lg font-semibold" style={{ color: theme.PRIMARY }}>
          {currentSession?.label || "No Session"}
        </h2>

        <TimerDisplay session={currentSession} theme={theme} />

        <ControlButtons
          session={currentSession}
          isRunning={isRunning}
          onPlayPause={() => toggleSessionRunning(currentIndex)}
          onReset={handleReset}
          onStop={handleStop}
          onToggleForm={() => setShowAddForm(!showAddForm)}
        />

        {showAddForm && (
          <AddSessionForm
            onAdd={handleAddSession}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        <SessionList
          sessions={sessions}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          toggleSessionRunning={toggleSessionRunning}
           onDelete={handleDeleteSession}
        />
      </div>
    </div>
  );
}
