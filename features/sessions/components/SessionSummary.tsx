'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SessionSummaryProps } from '../types'; // Uses SessionSummaryProps from types.ts

// Local helper function to format duration from seconds to MM:SS
const formatSessionDuration = (totalSeconds: number): string => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  summary,
  endSessionResult,
  sessionDuration,
  onRestart, // Placeholder for now, actual restart logic might involve router or specific API call
  onHome,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Session Completed!</CardTitle>
          <CardDescription className="text-lg">
            Congratulations on finishing your learning session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-center">Session Stats</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-4 bg-muted rounded-lg">
              <p className="font-medium">Set ID:</p>
              <p className="truncate">{summary.flashcardsSetId}</p>
              
              <p className="font-medium">Tags:</p>
              <p>{summary.tags.length > 0 ? summary.tags.join(', ') : 'N/A'}</p>
              
              <p className="font-medium">Score:</p>
              <p>{summary.score ?? endSessionResult?.score ?? 'N/A'}</p>
              
              <p className="font-medium">Cards Reviewed:</p>
              <p>{endSessionResult?.cardsReviewed ?? 'N/A'}</p>
              
              <p className="font-medium">Duration:</p>
              <p>{formatSessionDuration(sessionDuration)}</p>

              {endSessionResult?.startedAt && (
                <>
                  <p className="font-medium">Started:</p>
                  <p>{new Date(endSessionResult.startedAt).toLocaleString()}</p>
                </>
              )}
              {endSessionResult?.endedAt && (
                <>
                  <p className="font-medium">Ended:</p>
                  <p>{new Date(endSessionResult.endedAt).toLocaleString()}</p>
                </>
              )}
            </div>
          </div>
          
          {/* Placeholder for potential future additions like performance charts or detailed card review */}

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-around gap-3 pt-6">
          <Button onClick={onHome} variant="outline" className="w-full sm:w-auto">
            Go to Home
          </Button>
          <Button onClick={onRestart} className="w-full sm:w-auto">
            Start New Session
          </Button>
          {/* <Button onClick={() => alert('Review incorrect cards - TBD')} variant="secondary" className="w-full sm:w-auto">
            Review Mistakes (Soon)
          </Button> */}
        </CardFooter>
      </Card>
    </div>
  );
}; 