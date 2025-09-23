import React, { useState } from "react";

export default function AddSessionForm({ onAdd, onCancel }) {
  const [label, setLabel] = useState("");
  const [duration, setDuration] = useState("");

  const handleSubmit = () => {
    if (!label || isNaN(duration) || duration <= 0) return;
    onAdd(label, parseInt(duration));
    setLabel("");
    setDuration("");
  };

  return (
    <div className="w-full bg-gray-700 p-4 rounded-lg space-y-3">
      <input
        type="text"
        placeholder="Session label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 text-gray-100 placeholder-gray-400 outline-none"
      />
      <input
        type="number"
        placeholder="Duration (minutes)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 text-gray-100 placeholder-gray-400 outline-none"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded"
        >
          Add
        </button>
        <button
          onClick={onCancel}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
