"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation"; // For navigation
import { useSession } from "../hooks"; // Now imports from hooks/index.ts
import {
  SessionProgress,
  SessionTimer,
  FlashcardView,
  RatingButtons,
  SessionSummary,
} from ".";
import { useKeyboardShortcuts, KeyboardShortcutHandlers } from "../hooks"; // Should be resolved by hooks/index.ts
import { validate as uuidValidate } from "uuid";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionContextCardRating } from "../types"; // Import the correct rating type

// Define constants for keyboard shortcuts
const SHORTCUT_SHOW_ANSWER = " "; // Spacebar
const SHORTCUT_RATE_AGAIN: SessionContextCardRating = "again";
const SHORTCUT_RATE_HARD: SessionContextCardRating = "hard";
const SHORTCUT_RATE_GOOD: SessionContextCardRating = "good";
const SHORTCUT_RATE_EASY: SessionContextCardRating = "easy";

interface SessionPageProps {
  sessionId: string;
}

export const SessionPage: React.FC<SessionPageProps> = ({ sessionId }) => {
  const router = useRouter();

  // Validate UUID format (defensive programming)
  if (!sessionId || !uuidValidate(sessionId)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Nieprawidłowy ID sesji</AlertTitle>
          <AlertDescription>
            ID sesji jest nieprawidłowy. Proszę sprawdzić link lub rozpocząć
            nową
            <Button
              onClick={() => router.push("/protected")}
              className="mt-4 w-full"
            >
              Strona główna
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const {
    currentCardData, // This is now SessionContextCardDTO | undefined
    totalCards,
    currentCardIndex,
    isAnswerVisible,
    isLoading,
    isCompleted,
    summary,
    endSessionResult,
    sessionDuration,
    startTime,
    isPaused, // from useSession, to control timer and shortcuts
    showAnswer,
    rateCard, // Expects SessionContextCardRating
    endCurrentSession, // Use this for explicit end, or summary navigation
    toggleTimer,
    error,
    currentAnswer, // Get currentAnswer from useSession to pass to FlashcardView
    flashcardsSetId,
    tags,
    sessionCreatedAt,
  } = useSession(sessionId);

  // Keyboard shortcuts setup
  const keyboardHandlers: KeyboardShortcutHandlers = {
    [SHORTCUT_SHOW_ANSWER]: () => {
      if (!isAnswerVisible && !isCompleted && currentCardData) showAnswer();
    },
    [SHORTCUT_RATE_AGAIN]: () => {
      if (isAnswerVisible && !isCompleted && currentCardData)
        rateCard(SHORTCUT_RATE_AGAIN);
    },
    [SHORTCUT_RATE_HARD]: () => {
      if (isAnswerVisible && !isCompleted && currentCardData)
        rateCard(SHORTCUT_RATE_HARD);
    },
    [SHORTCUT_RATE_GOOD]: () => {
      if (isAnswerVisible && !isCompleted && currentCardData)
        rateCard(SHORTCUT_RATE_GOOD);
    },
    [SHORTCUT_RATE_EASY]: () => {
      if (isAnswerVisible && !isCompleted && currentCardData)
        rateCard(SHORTCUT_RATE_EASY);
    },
    // Consider adding 'p' for pause/resume toggleTimer?
  };
  useKeyboardShortcuts(keyboardHandlers, !isCompleted && !isPaused); // Activate shortcuts only if session is active and not paused

  // Handle navigation for summary actions
  const handleGoHome = () => router.push("/");
  const handleRestartSession = () => {
    // Redirect to protected page where SessionStarterModal is available
    router.push("/protected");
  };

  // Initial loading state for the whole page before session data arrives
  if (isLoading && !currentCardData && !isCompleted && !error) {
    return (
      <div className="w-full max-w-3xl mx-auto p-4 flex flex-col space-y-6 min-w-0">
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/4 min-w-[100px]" />
          <Skeleton className="h-4 w-1/2 min-w-[150px]" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 sm:h-72 md:h-80 w-80 sm:w-96 md:w-[28rem] lg:w-[32rem] mx-auto" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Handle error state from useSession (e.g., session fetch failed)
  if (error && !isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Błąd podczas ładowania sesji</AlertTitle>
          <AlertDescription>
            {error.message ||
              "An unexpected error occurred while loading the session."}
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 w-full"
            >
              Spróbuj ponownie
            </Button>
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="mt-2 w-full"
            >
              Strona główna
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Session Summary View
  if (isCompleted) {
    // Create mock summary if not available from natural completion
    const mockSummary = summary || {
      sessionId,
      flashcardsSetId: flashcardsSetId,
      tags: tags,
      score: 0, // Default score for manually ended session
      createdAt: sessionCreatedAt || startTime.toISOString(),
    };

    return (
      <SessionSummary
        summary={mockSummary}
        endSessionResult={endSessionResult}
        sessionDuration={sessionDuration}
        onHome={handleGoHome}
        onRestart={handleRestartSession}
      />
    );
  }

  // Active Session View
  if (!currentCardData && !isLoading) {
    // No cards, but not loading - could be empty session or issue
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle> Brak fiszek w sesji</AlertTitle>
          <AlertDescription>
            Ta sesja nie ma fiszek do przeglądania. Możesz rozpocząć nową sesję.
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="mt-4 w-full"
            >
              Strona główna
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render active session if card data is available
  return (
    <div className="w-full max-w-3xl mx-auto p-4 flex flex-col ">
      <header className="mb-6">
        <SessionProgress
          currentIndex={currentCardIndex + 1}
          totalCards={totalCards}
        />
        <SessionTimer
          startTime={startTime}
          isRunning={!isPaused && !isCompleted}
        />
        {/* Add a pause button that calls toggleTimer? Plan doesn't specify but good UX */}
        <div className="flex gap-2 justify-between">
          <Button
            onClick={toggleTimer}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            {isPaused ? "Wznow" : "Pauza"}
          </Button>
          <Button
            onClick={() => endCurrentSession()}
            variant="destructive"
            size="sm"
            className="mt-2 ml-2"
          >
            Zakończ sesję
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        {currentCardData && (
          <FlashcardView
            card={currentCardData} // currentCardData is SessionContextCardDTO
            answer={currentAnswer} // Pass currentAnswer from useSession (which is card.answer or fetched)
            isAnswerVisible={isAnswerVisible}
            isLoading={isLoading} //isLoading from useSession, reflects mutation loading etc.
            onShowAnswer={showAnswer}
          />
        )}
      </main>

      <footer className=" py-4">
        {!isAnswerVisible && currentCardData && (
          <div className="flex justify-center">
            <Button
              onClick={showAnswer}
              disabled={isLoading}
              className="w-1/2 sm:w-1/3"
            >
              Odpowiedź (Space)
            </Button>
          </div>
        )}
        {isAnswerVisible && currentCardData && (
          <RatingButtons
            onRate={rateCard}
            disabled={isLoading}
            isLoading={isLoading} // isLoading of the rating action itself
          />
        )}
      </footer>
    </div>
  );
};
