import React from "react";
import { Play, Pause, Trash } from "lucide-react";

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export default function SessionList({
  sessions,
  currentIndex,
  setCurrentIndex,
  toggleSessionRunning,
  onDelete,
}) {
  if (sessions.length === 0) {
    return (
      <div className="text-gray-400 text-sm w-full text-center pt-4">
        No sessions yet. Add one to begin.
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      {sessions.map((s, idx) => (
        <div
          key={s.id}
          onClick={() => setCurrentIndex(idx)}
          className={`p-3 rounded-lg flex justify-between items-center cursor-pointer transition-colors ${
            idx === currentIndex
              ? "bg-cyan-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <span className="font-medium">{s.label}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm">{formatTime(s.timeLeft)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSessionRunning(idx);
              }}
              className="text-white hover:text-gray-300"
            >
              {s.isRunning ? <Pause size={16} /> : <Play size={16} />}
            </button>

            <button
    onClick={(e) => {
      e.stopPropagation();
      onDelete(idx);
    }}
    className="text-white hover:text-red-600"
  >
    <Trash size={16} />
  </button>
          </div>
        </div>
      ))}
    </div>
  );
}
