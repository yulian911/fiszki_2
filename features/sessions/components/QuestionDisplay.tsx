'use client';

import { QuestionDisplayProps } from '../types';

export function QuestionDisplay({ question }: QuestionDisplayProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Question</h3>
      <div 
        className="text-xl"
        dangerouslySetInnerHTML={{ __html: question }}
      />
    </div>
  );
} 