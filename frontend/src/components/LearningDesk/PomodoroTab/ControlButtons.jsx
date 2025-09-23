import React from "react";
import { Play, Pause, RotateCcw, Square, Plus } from "lucide-react";

export default function ControlButtons({
  session,
  isRunning,
  onPlayPause,
  onReset,
  onStop,
  onToggleForm,
}) {
  return (
    <div className="flex gap-4">
      <button
        onClick={onPlayPause}
        className="bg-cyan-600 hover:bg-cyan-700 text-white p-3 rounded-full"
      >
        {isRunning ? <Pause size={20} /> : <Play size={20} />}
      </button>
      <button
        onClick={onStop}
        className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full"
      >
        <Square size={20} />
      </button>
      <button
        onClick={onReset}
        className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full"
      >
        <RotateCcw size={20} />
      </button>
      <button
        onClick={onToggleForm}
        className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full"
      >
        <Plus size={20} />
      </button>
    </div>
  );
}
