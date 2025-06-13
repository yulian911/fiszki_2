// src/types.ts
// Definicje typów DTO i modeli komend dla API aplikacji Inteligentne Fiszki

// Enums odpowiadające typom w bazie danych
export type FlashcardsSetStatus = "pending" | "accepted" | "rejected";
export type FlashcardSource = "ai-full" | "ai-edit" | "manual";
export type CardRating = "easy" | "medium" | "hard";

// -----------------------------------------------------------------------------
// 1. Autoryzacja
// -----------------------------------------------------------------------------

/**
 * Komenda rejestracji użytkownika (Sign-Up)
 * Mapuje do tabeli auth.users (kolumna email).
 */
export interface RegisterUserCommand {
  email: string;
  password: string;
  passwordConfirmation: string;
}

/**
 * Odpowiedź na rejestrację użytkownika
 * Bazuje na danych zwracanych z Supabase Auth (id, email, createdAt).
 */
export interface SignUpResponseDTO {
  id: string;
  email: string;
  createdAt: string;
}

/**
 * Komenda logowania użytkownika (Sign-In)
 */
export interface SignInCommand {
  email: string;
  password: string;
}

/**
 * DTO użytkownika używane w odpowiedziach auth
 */
export interface UserDTO {
  id: string;
  email: string;
}

/**
 * Odpowiedź na logowanie zawierająca token i dane użytkownika
 */
export interface SignInResponseDTO {
  token: string;
  user: UserDTO;
}

// -----------------------------------------------------------------------------
// 2. Paginacja (wspólne DTO)
// -----------------------------------------------------------------------------

/**
 * Metadane paginacji
 */
export interface MetaDTO {
  page: number;
  limit: number;
  total: number;
}

/**
 * Wspólny typ odpowiedzi paginowanej
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: MetaDTO;
}

// -----------------------------------------------------------------------------
// 3. Flashcards Sets
// -----------------------------------------------------------------------------

/**
 * DTO encji FlashcardsSet (mapowanie kolumn flashcards_set)
 */
export interface FlashcardsSetDTO {
  id: string;
  ownerId: string;
  name: string;
  status: FlashcardsSetStatus;
  createdAt: string;
  updatedAt: string;
  /**
   * Liczba fiszek w zestawie, wysyłana z API
   */
  flashcardCount?: number;
  /**
   * Opcjonalny opis zestawu fiszek
   */
  description?: string;
  /**
   * Poziom dostępu zalogowanego użytkownika do zestawu.
   */
  accessLevel: "owner" | "viewer";
  /**
   * Adres e-mail właściciela zestawu, jeśli jest on udostępniony.
   */
  ownerEmail: string | null;
}

/**
 * Komenda tworzenia nowego zestawu fiszek
 * Wymaga nazwy i opcjonalnie opisu.
 */
export interface CreateFlashcardsSetCommand {
  name: FlashcardsSetDTO["name"];
  description?: FlashcardsSetDTO["description"];
}

/**
 * Komenda aktualizacji zestawu fiszek
 * Pozwala na zmianę nazwy, statusu i opisu
 */
export type UpdateFlashcardsSetCommand = Partial<
  Pick<FlashcardsSetDTO, "name" | "status" | "description">
>;

/**
 * Komenda klonowania istniejącego zestawu fiszek
 * Umożliwia sklonowanie zestawu dla zalogowanego użytkownika lub innego, docelowego użytkownika
 */
export interface CloneFlashcardsSetCommand {
  targetUserId?: string;
}

/**
 * DTO zawierające zestaw fiszek wraz z listą fiszek
 */
export interface FlashcardsSetWithCardsDTO extends FlashcardsSetDTO {
  flashcards: FlashcardDTO[];
}

// -----------------------------------------------------------------------------
// 4. Flashcards
// -----------------------------------------------------------------------------

/**
 * DTO encji Flashcard (mapowanie kolumn flashcards)
 */
export interface FlashcardDTO {
  id: string;
  flashcardsSetId: string;
  question: string;
  answer: string;
  source: FlashcardSource;
  createdAt: string;
  updatedAt: string;
  /**
   * Lista tagów powiązanych z fiszką
   */
  tags: TagDTO[];
}

/**
 * Komenda tworzenia nowej fiszki (manual)
 * Bazuje na kolumnach flashcards (poza id, createdAt, updatedAt)
 */
export interface CreateFlashcardCommand {
  flashcardsSetId: FlashcardDTO["flashcardsSetId"];
  question: FlashcardDTO["question"];
  answer: FlashcardDTO["answer"];
  source: "manual";
  tags: string[];
  hint?: string;
}

/**
 * Komenda aktualizacji fiszki
 * Pozwala na zmianę treści fiszki i/lub tagów
 */
export type UpdateFlashcardCommand = Partial<
  Pick<CreateFlashcardCommand, "question" | "answer" | "tags" | "hint">
>;

// -----------------------------------------------------------------------------
// 5. AI Flashcard Generation
// -----------------------------------------------------------------------------

/**
 * Komenda generowania sugestii fiszek przez AI
 */
export interface GenerateSuggestionsCommand {
  text: string;
}

/**
 * DTO pojedynczej sugestii generowanej przez AI
 * Tymczasowa struktura sugestii (nie trwałe dane w DB)
 */
export interface AISuggestionDTO {
  id: string;
  question: string;
  answer: string;
}

/**
 * Odpowiedź z listą sugestii AI
 */
export interface AISuggestionsResponseDTO {
  suggestions: AISuggestionDTO[];
}

/**
 * Komenda zaakceptowania sugestii AI
 * Tworzy faktyczną fiszkę w zestawie (kolumna flashcards_set_id)
 */
export interface AcceptSuggestionCommand {
  flashcardsSetId: string;
}

/**
 * Komenda odrzucenia sugestii AI (brak body)
 */
export interface RejectSuggestionCommand {}

/**
 * Komenda edycji istniejącej sugestii AI
 */
export interface EditSuggestionCommand {
  question: string;
  answer: string;
}

// -----------------------------------------------------------------------------
// 6. Tags
// -----------------------------------------------------------------------------

/**
 * DTO encji Tag (mapowanie kolumn tags)
 */
export interface TagDTO {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Komenda tworzenia nowego taga
 */
export interface CreateTagCommand {
  name: TagDTO["name"];
}

/**
 * Komenda aktualizacji taga
 */
export interface UpdateTagCommand {
  name: TagDTO["name"];
}

// -----------------------------------------------------------------------------
// 7. Sessions (SRS)
// -----------------------------------------------------------------------------

/**
 * Komenda rozpoczęcia sesji SRS
 */
export interface StartSessionCommand {
  flashcardsSetId: string;
  tags: string[];
  limit: number;
}

/**
 * DTO pojedynczej karty w sesji (id, pytanie i odpowiedź)
 */
export interface SessionCardDTO {
  id: string;
  question: string;
  answer: string;
}

/**
 * Odpowiedź na rozpoczęcie sesji SRS
 */
export interface StartSessionResponseDTO {
  sessionId: string;
  cards: SessionCardDTO[];
  // Session metadata for summary
  flashcardsSetId: string;
  tags: string[];
  createdAt: string;
}

/**
 * Komenda oceny fiszki w sesji
 */
export interface EvaluateCardCommand {
  rating: CardRating;
}

/**
 * DTO podsumowania sesji (na zakończenie lub gdy brak kolejnych kart)
 * Bazuje na tabeli sessions
 */
export interface SessionSummaryDTO {
  sessionId: string;
  flashcardsSetId: string;
  tags: string[];
  score: number;
  createdAt: string;
}

/**
 * Odpowiedź na ocenę karty: kolejna karta lub podsumowanie
 */
export type EvaluateCardResponseDTO = SessionCardDTO | SessionSummaryDTO;

// -----------------------------------------------------------------------------
// 8. Statistics
// -----------------------------------------------------------------------------

/**
 * DTO historii sesji do statystyk
 */
export interface SessionHistoryDTO {
  date: string;
  count: number;
}

/**
 * DTO podstawowych statystyk użytkownika
 */
export interface StatsDTO {
  dueToday: number;
  totalCards: number;
  sessionsHistory: SessionHistoryDTO[];
}

// -----------------------------------------------------------------------------
// 9. Sharing
// -----------------------------------------------------------------------------

/**
 * DTO reprezentujące udostępnienie zestawu fiszek
 */
export interface ShareDTO {
  id: string;
  setId: string;
  userId: string;
  role: "learning";
  createdAt: string;
  expiresAt?: string;
}

/**
 * Komenda udostępnienia zestawu fiszek innemu użytkownikowi
 */
export interface CreateShareCommand {
  userId: ShareDTO["userId"];
  role: ShareDTO["role"];
  expiresAt?: ShareDTO["expiresAt"];
}
