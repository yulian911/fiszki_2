'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { SessionTimerProps } from '../types';

export function SessionTimer({ startTime, isRunning }: SessionTimerProps) {
  const [duration, setDuration] = useState(0);
  
  useEffect(() => {
    if (!isRunning) return;
    
    const intervalId = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [startTime, isRunning]);
  
  // Format time in seconds to MM:SS
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <Clock className="h-4 w-4" />
      <span>{formatTime(duration)}</span>
    </div>
  );
} 