"use client";

import { Progress } from "@/components/ui/progress";
import { SessionProgressProps } from "../types";

export function SessionProgress({
  currentIndex,
  totalCards,
}: SessionProgressProps) {
  // Calculate progress percentage
  const progressPercentage = Math.round((currentIndex / totalCards) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1 text-sm">
        <span>Progress</span>
        <span>
          Card {currentIndex} of {totalCards}
        </span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
}
