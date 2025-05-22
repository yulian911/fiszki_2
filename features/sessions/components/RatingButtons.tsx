'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; // Assuming utils for classnames
import { SessionContextCardRating } from '../types'; // Use the new session-specific type

interface RatingButtonsProps {
  onRate: (rating: SessionContextCardRating) => void;
  disabled: boolean;
  isLoading?: boolean; // isLoading for the rating action itself
}

const ratingOptions: { label: string; value: SessionContextCardRating; className?: string; shortcut?: string }[] = [
  {
    label: 'Ponów',
    value: 'again',
    className: 'bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800',
    shortcut: '1',
  },
  {
    label: 'Trudne',
    value: 'hard',
    className: 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700',
    shortcut: '2',
  },
  {
    label: 'Dobre',
    value: 'good',
    className: 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700',
    shortcut: '3',
  },
  {
    label: 'Łatwe',
    value: 'easy',
    className: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600',
    shortcut: '4',
  },
];

export const RatingButtons: React.FC<RatingButtonsProps> = ({ onRate, disabled, isLoading }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4">
      {ratingOptions.map((option) => (
        <Button
          key={option.value}
          onClick={() => onRate(option.value)}
          disabled={disabled || isLoading} // Disable if overall component is disabled or if this button group is loading
          className={cn(
            'w-full text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-150 ease-in-out',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background',
            option.className,
            (disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
          )}
          variant="default" // Use default variant and override with specific bg colors
        >
          {option.label}
          {option.shortcut && <span className="ml-2 text-xs opacity-75">({option.shortcut})</span>}
        </Button>
      ))}
    </div>
  );
}; 