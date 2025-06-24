"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FlashcardViewProps } from "../types";
import { ShowAnswerButton } from "./ShowAnswerButton";

export function FlashcardView({
  card,
  answer,
  isAnswerVisible,
  isLoading,
  onShowAnswer,
}: FlashcardViewProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [showBackSide, setShowBackSide] = useState(false);

  // Handle flip animation when answer visibility changes
  useEffect(() => {
    if (isAnswerVisible && !showBackSide) {
      // Start flip to show answer
      setIsFlipping(true);
      setTimeout(() => {
        setShowBackSide(true);
        setTimeout(() => setIsFlipping(false), 100);
      }, 300);
    } else if (!isAnswerVisible && showBackSide) {
      // Reset to question side
      setIsFlipping(true);
      setTimeout(() => {
        setShowBackSide(false);
        setTimeout(() => setIsFlipping(false), 100);
      }, 300);
    }
  }, [isAnswerVisible, showBackSide]);

  return (
    <div className="perspective-1000 w-full flex justify-center">
      <div
        className={`
          relative w-80 sm:w-96 md:w-[28rem] lg:w-[32rem] h-64 sm:h-72 md:h-80 preserve-3d transition-transform duration-700 ease-in-out
          ${isAnswerVisible ? "rotate-y-180" : ""}
        `}
      >
        {/* Front Side - Question */}
        <Card className="absolute inset-0 w-full h-full shadow-lg backface-hidden">
          <CardContent className="p-6 h-full flex flex-col justify-between">
            {/* Header - stała wysokość */}
            <div className="h-12 flex items-center justify-center">
              <h3 className="text-lg font-semibold text-center"> Pytanie</h3>
            </div>

            {/* Content area - stała wysokość, wypełnia przestrzeń */}
            <div className="h-32 sm:h-40 md:h-48 flex items-center justify-center overflow-hidden">
              <div className="w-full max-h-full overflow-y-auto">
                <div
                  className="flashcard-content"
                  dangerouslySetInnerHTML={{ __html: card.question }}
                />
              </div>
            </div>

            {/* Footer - stała wysokość */}
            <div className="h-16 flex items-center justify-center">
              <ShowAnswerButton
                onShowAnswer={onShowAnswer}
                disabled={isLoading || isFlipping}
              />
            </div>
          </CardContent>
        </Card>

        {/* Back Side - Answer */}
        <Card className="absolute inset-0 w-full h-full shadow-lg backface-hidden rotate-y-180">
          <CardContent className="p-6 h-full flex flex-col justify-between">
            {/* Header - stała wysokość */}
            <div className="h-12 flex items-center justify-center">
              <h3 className="text-lg font-semibold text-center"> Odpowiedź</h3>
            </div>

            {/* Content area - stała wysokość, wypełnia przestrzeń */}
            <div className="h-32 sm:h-40 md:h-48 flex flex-col overflow-hidden">
              {/* Small question reminder */}
              <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="text-sm text-muted-foreground line-clamp-1">
                  {card.question}
                </div>
              </div>

              {/* Answer content - reszta przestrzeni */}
              <div className="flex-1 flex items-center justify-center overflow-y-auto">
                <div className="w-full max-h-full overflow-y-auto">
                  <div
                    className="flashcard-content"
                    dangerouslySetInnerHTML={{
                      __html: answer || "Brak odpowiedzi",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Footer - stała wysokość */}
            <div className="h-16 flex items-center justify-center">
              <div className="text-sm text-muted-foreground">Oceń fiszkę</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
