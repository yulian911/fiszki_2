'use client';

import { Card, CardContent } from '@/components/ui/card';
import { FlashcardViewProps } from '../types';
import { QuestionDisplay } from './QuestionDisplay';
import { ShowAnswerButton } from './ShowAnswerButton';
import { AnswerDisplay } from './AnswerDisplay';

export function FlashcardView({
  card,
  answer,
  isAnswerVisible,
  isLoading,
  onShowAnswer,
}: FlashcardViewProps) {
  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <div className="space-y-6">
          <QuestionDisplay question={card.question} />

          {!isAnswerVisible ? (
            <div className="flex justify-center mt-6">
              <ShowAnswerButton onShowAnswer={onShowAnswer} disabled={isLoading} />
            </div>
          ) : (
            <div className="mt-6 pt-6 border-t">
              <AnswerDisplay answer={answer || 'Loading answer...'} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 