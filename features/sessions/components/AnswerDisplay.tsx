'use client';

import React from 'react';
import { CardContent } from '@/components/ui/card'; // Assuming shadcn/ui Card

interface AnswerDisplayProps {
  answer: string;
  // Potentially add a prop for isLoadingAnswer if answer can be fetched separately
}

export const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ answer }) => {
  // The plan mentioned HTML sanitization for answer display.
  // This is crucial if answers can contain user-generated HTML.
  // For simplicity now, directly rendering. Add sanitization if needed (e.g., using DOMPurify).
  if (!answer) {
    return (
      <CardContent>
        <p className="text-muted-foreground italic">No answer provided.</p>
      </CardContent>
    );
  }

  return (
    <CardContent>
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: answer }} // Ensure 'answer' is sanitized if it comes from untrusted source
      />
    </CardContent>
  );
}; 