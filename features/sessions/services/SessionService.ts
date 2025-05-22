import {
  EvaluateCardCommand,
  StartSessionResponseDTO,
  SessionSummaryDTO,
  EvaluateCardResponseDTO,
} from '@/types'; // Assuming @/types is the path to the global types.ts
import { EndSessionResponseDTO } from '../types'; // For session-specific types like EndSessionResponseDTO

// Helper to get base API URL from environment variables
const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined');
  }
  return baseUrl;
};

/**
 * Fetches initial session data.
 * This corresponds to an internal or protected API endpoint that prepares and returns session details.
 * The plan mentions this is not from a specified public API spec, but rather an internal one for the app.
 * For now, we'll assume it's a GET request to /api/sessions/:sessionId
 */
export async function fetchSession(
  sessionId: string
): Promise<StartSessionResponseDTO> {
  const response = await fetch(`${getApiBaseUrl()}/sessions/${sessionId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to fetch session: ${response.status} ${
        response.statusText
      } - ${errorData.message || 'No additional error info'}`
    );
  }
  return response.json();
}

/**
 * Submits an evaluation for a flashcard.
 */
export async function evaluateCard(
  sessionId: string,
  cardId: string,
  command: EvaluateCardCommand
): Promise<EvaluateCardResponseDTO> {
  const response = await fetch(
    `${getApiBaseUrl()}/sessions/${sessionId}/cards/${cardId}/evaluate`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // Authorization header might be needed, depending on auth setup
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(command),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to evaluate card: ${response.status} ${
        response.statusText
      } - ${errorData.message || 'No additional error info'}`
    );
  }

  return response.json();
}

/**
 * Ends the current learning session.
 * Can optionally send the session duration calculated on the client.
 */
export async function endSession(
  sessionId: string,
  durationSeconds?: number
): Promise<EndSessionResponseDTO | undefined> {
  let url = `${getApiBaseUrl()}/sessions/${sessionId}`;
  if (durationSeconds !== undefined) {
    url += `?durationSeconds=${durationSeconds}`;
  }

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      // Authorization header might be needed
      // 'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to end session: ${response.status} ${
        response.statusText
      } - ${errorData.message || 'No additional error info'}`
    );
  }

  if (response.status === 204) {
    // No Content, common for DELETE operations indicating success without a body
    return undefined;
  }

  return response.json();
}

// Placeholder for an API call that might be needed to get the answer for a card
// if it's not provided upfront with the session data.
// The plan's FlashcardViewProps has `answer?: string` and `onShowAnswer`,
// implying the answer might be fetched or revealed separately.
// If SessionCardDTO for `StartSessionResponseDTO` includes the answer, this might not be needed.
// The plan shows `SessionCardDTO { id: string, question: string }`
// and `FlashcardViewProps { card: SessionCardDTO, answer?: string ... }`
// This implies answer is not part of the initial card data.
// However, the `useSession` hook implementation has `currentAnswer?: string` in its state,
// and `evaluateCard` in the plan seems to reveal the *next* card or summary, not the answer.
// Let's assume for now that revealing an answer is a client-side state change if the answer data
// is fetched with the card or, if not, a separate API call is needed.
// The plan's `useSession`'s `showAnswer` function just sets `isAnswerVisible: true`.
// This suggests the answer is already available in `SessionCardDTO` or fetched somehow.
// The `types.ts` `FlashcardDTO` includes `answer: string`.
// The plan's `SessionCardDTO` *does not* include `answer`. This is a discrepancy.
// For now, I will assume `SessionCardDTO` should include an answer, or it's fetched separately.
// Given the plan has `evaluateCard` returning the *next* `SessionCardDTO` or a `SessionSummaryDTO`,
// and no explicit "get answer" API call, I'll assume the answer for the *current* card
// is either pre-loaded (requiring a change in `SessionCardDTO` definition in the plan/types)
// or revealed client-side if present.

// For now, `SessionService.ts` only contains the three main functions.
// If an "get answer" API call is needed, it would be added here. 