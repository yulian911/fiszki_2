'use client';

import { useState, useEffect, useMemo } from 'react';

interface UseSessionTimerProps {
  startTime?: Date | null; // Can be null or undefined initially
  isRunning: boolean;
}

const formatTime = (totalSeconds: number): string => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const useSessionTimer = ({ startTime, isRunning }: UseSessionTimerProps) => {
  const [duration, setDuration] = useState(0); // Duration in seconds

  useEffect(() => {
    if (!isRunning || !startTime) {
      // If not running or no start time, clear any existing interval and don't start a new one.
      // If it was running and paused, duration will hold the last calculated value.
      return;
    }

    // Recalculate initial duration based on startTime when it changes or when isRunning becomes true
    setDuration(Math.floor((Date.now() - startTime.getTime()) / 1000));

    const intervalId = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [startTime, isRunning]);

  const formattedTime = useMemo(() => formatTime(duration), [duration]);

  return {
    duration,       // Duration in seconds
    formattedTime,  // Duration as MM:SS string
  };
}; 