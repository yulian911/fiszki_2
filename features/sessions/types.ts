import { CardRating as GlobalCardRating, SessionCardDTO as GlobalSessionCardDTO, SessionSummaryDTO } from "../../types";

// Re-export SessionSummaryDTO as it matches the plan and global definition
export type { SessionSummaryDTO };

// Define a session-specific CardRating based on the plan: again, hard, good, easy
export type SessionContextCardRating = "again" | "hard" | "good" | "easy";

// SessionContextCardDTO is now the same as GlobalSessionCardDTO since it includes answer
export type SessionContextCardDTO = GlobalSessionCardDTO;

// Re-export GlobalCardRating if it's needed elsewhere with its original definition from this module
// For session context, SessionContextCardRating should be used primarily.
export type { GlobalCardRating }; 
// We don't re-export GlobalSessionCardDTO directly if we want SessionContextCardDTO to be the default for sessions

// Define EndSessionResponseDTO since it's not exported from the main types file
export interface EndSessionResponseDTO {
  sessionId: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  cardsReviewed: number;
  score?: number;
}

// ViewModel (custom types for the view)
export interface SessionViewModel {
  sessionId: string;
  cards: SessionContextCardDTO[]; // Use extended DTO with answer
  currentCardIndex: number;
  isAnswerVisible: boolean;
  isLoading: boolean;
  isCompleted: boolean;
  currentAnswer?: string; // This could store the fetched/revealed answer
  summary?: SessionSummaryDTO;
  endSessionResult?: EndSessionResponseDTO;
  startTime: Date;
  sessionDuration: number; // time in seconds
  isPaused: boolean;
}

export interface FlashcardViewModel {
  card: SessionContextCardDTO; // Use extended DTO
  answer?: string;
  isAnswerVisible: boolean;
  onShowAnswer: () => void;
}

export interface RatingButtonsViewModel {
  onRate: (rating: SessionContextCardRating) => void; // Use session-specific rating
  disabled: boolean;
  isLoading: boolean;
}

export interface SessionTimerViewModel {
  startTime: Date;
  currentDuration: number; // in seconds
  isRunning: boolean;
}

// Props interfaces for components
export interface SessionProgressProps {
  currentIndex: number;
  totalCards: number;
}

export interface SessionTimerProps {
  startTime: Date;
  pauseTime?: Date;
  isRunning: boolean;
}

export interface FlashcardViewProps {
  card: SessionContextCardDTO; // Use extended DTO
  answer?: string; // This will come from SessionViewModel.currentAnswer or directly if card has it
  isAnswerVisible: boolean;
  isLoading: boolean;
  onShowAnswer: () => void;
}

export interface QuestionDisplayProps {
  question: string;
}

export interface ShowAnswerButtonProps {
  onShowAnswer: () => void;
  disabled: boolean;
}

export interface AnswerDisplayProps {
  answer: string;
}

export interface RatingButtonsProps {
  onRate: (rating: SessionContextCardRating) => void; // Use session-specific rating
  disabled: boolean;
  isLoading?: boolean;
}

export interface SessionSummaryProps {
  summary: SessionSummaryDTO;
  endSessionResult?: EndSessionResponseDTO;
  sessionDuration: number; // in seconds
  onRestart: () => void;
  onHome: () => void;
} 