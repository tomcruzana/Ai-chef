import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause, faPlay, faRotateLeft } from "@fortawesome/free-solid-svg-icons";

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function getStepDurationSeconds(step) {
  const text = step.toLowerCase();
  const minuteMatch = text.match(/(\d+)\s*(minutes?|mins?|min)\b/);
  const secondMatch = text.match(/(\d+)\s*(seconds?|secs?|sec)\b/);

  if (minuteMatch) return Number(minuteMatch[1]) * 60;
  if (secondMatch) return Number(secondMatch[1]);
  return 0;
}

export default function InstructionTimer({ seconds, onComplete }) {
  const [remainingSeconds, setRemainingSeconds] = React.useState(seconds);
  const [isRunning, setIsRunning] = React.useState(false);
  const hasCompletedRef = React.useRef(false);

  React.useEffect(() => {
    setRemainingSeconds(seconds);
    setIsRunning(false);
    hasCompletedRef.current = false;
  }, [seconds]);

  React.useEffect(() => {
    if (!isRunning || remainingSeconds <= 0) return undefined;

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning, remainingSeconds]);

  React.useEffect(() => {
    if (remainingSeconds !== 0 || hasCompletedRef.current) return;

    hasCompletedRef.current = true;
    setIsRunning(false);
    onComplete?.();
  }, [onComplete, remainingSeconds]);

  return (
    <div className="instruction-timer">
      <strong className="timer-count">{formatTime(remainingSeconds)}</strong>
      <button className="icon-button" type="button" onClick={() => setIsRunning((current) => !current)} aria-label={isRunning ? "Pause timer" : "Start timer"}>
        <FontAwesomeIcon icon={isRunning ? faPause : faPlay} />
      </button>
      <button className="icon-button" type="button" onClick={() => { setRemainingSeconds(seconds); setIsRunning(false); hasCompletedRef.current = false; }} aria-label="Reset timer">
        <FontAwesomeIcon icon={faRotateLeft} />
      </button>
    </div>
  );
}
