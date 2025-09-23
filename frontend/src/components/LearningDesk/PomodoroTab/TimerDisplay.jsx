import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export default function TimerDisplay({ session, theme }) {
  const percentage =
    session?.duration > 0
      ? ((session.duration * 60 - session.timeLeft) /
          (session.duration * 60)) *
        100
      : 0;

  return (
    <div className="w-44 h-44">
      <CircularProgressbar
        value={percentage}
        text={session?.timeLeft ? formatTime(session.timeLeft) : "--:--"}
        styles={buildStyles({
          textColor: theme.TEXT,
          pathColor: theme.PRIMARY,
          trailColor: "#374151",
        })}
      />
    </div>
  );
}
