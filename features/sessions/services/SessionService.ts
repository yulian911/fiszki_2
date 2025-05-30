import {
  EvaluateCardCommand,
  StartSessionResponseDTO,
  SessionSummaryDTO,
  EvaluateCardResponseDTO,
} from '@/types'; // Assuming @/types is the path to the global types.ts
import { EndSessionResponseDTO } from '../types'; // For session-specific types like EndSessionResponseDTO
import { EvaluateCardInput, StartSessionInput } from '@/features/schemas/session';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SessionCardDTO } from '@/types';

interface CardRating {
  rating: 'again' | 'hard' | 'good' | 'easy';
}
/**
 * Fetches initial session data.
 * This corresponds to an internal or protected API endpoint that prepares and returns session details.
 * The plan mentions this is not from a specified public API spec, but rather an internal one for the app.
 * For now, we'll assume it's a GET request to /api/sessions/:sessionId
 */


export class SessionsService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Start a new SRS session
   * @param command Command with flashcardsSetId, tags, limit, and shuffle
   * @returns Session ID and cards for the session
   */
  async start(command: StartSessionInput) {
    const { flashcardsSetId, tags, limit, shuffle = false } = command;
    
    // Get user ID from auth context
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }
    
    // Fetch cards for the session based on tags and limit
    const { data: cards, error: fetchError } = await this.supabase
      .from('flashcards')
      .select('id, question, answer')
      .eq('flashcards_set_id', flashcardsSetId)
      .order('created_at');
      
    if (fetchError) {
      throw new Error(`Failed to fetch cards: ${fetchError.message}`);
    }
    
    if (!cards.length) {
      throw new Error('No cards found for the given set and tags');
    }
    
    // Filter by tags if specified
    let filteredCards: any[] = cards;
    if (tags.length > 0) {
      // TODO: Tags filtering is not implemented yet
      throw new Error('Tag filtering is not implemented yet. Please start session without tags.');
    }

    if (filteredCards.length === 0) {
      throw new Error('No cards found matching the specified tags');
    }
    
    // Limit the number of cards to the requested limit or available cards, whichever is smaller
    const actualLimit = Math.min(limit, filteredCards.length);
    filteredCards = filteredCards.slice(0, actualLimit);
    
    // Shuffle cards if requested using Fisher-Yates algorithm
    if (shuffle) {
      for (let i = filteredCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredCards[i], filteredCards[j]] = [filteredCards[j], filteredCards[i]];
      }
    }
    
    // Create session record
    const { data: session, error: sessionError } = await this.supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        flashcards_set_id: flashcardsSetId,
        tags: tags,
        status: 'in_progress',
      })
      .select('id')
      .single();
      
    if (sessionError) {
      throw new Error(`Failed to create session: ${sessionError.message}`);
    }
    
    // Link cards to session
    const sessionCards = filteredCards.map((card: any, index: number) => ({
      session_id: session.id,
      flashcard_id: card.id,
      sequence_no: index + 1, // kolejność wylosowania/tasowania
    }));
    
    const { error: linkError } = await this.supabase
      .from('session_cards')
      .insert(sessionCards);
      
    if (linkError) {
      throw new Error(`Failed to link cards to session: ${linkError.message}`);
    }
    
    // Format response
    return {
      sessionId: session.id,
      cards: filteredCards.map((card: any) => ({
        id: card.id,
        question: card.question,
        answer: card.answer,
      })),
    };
  }
  
  /**
   * Evaluate a card in a session
   * @param sessionId Session ID
   * @param cardId Card ID being evaluated
   * @param command Evaluation rating
   * @returns Next card or session summary
   */
  async evaluate(sessionId: string, cardId: string, command: EvaluateCardInput): Promise<SessionCardDTO | SessionSummaryDTO> {
    const { rating } = command;
    
    // Get user ID from auth context
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }
    
    // Verify session belongs to user
    const { data: session, error: sessionError } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();
      
    if (sessionError || !session) {
      throw new Error('Session not found or unauthorized');
    }
    
    // Update the card rating
    const { error: updateError } = await this.supabase
      .from('session_cards')
      .update({
        rating: rating,
        reviewed_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId)
      .eq('flashcard_id', cardId);
      
    if (updateError) {
      throw new Error(`Failed to update card rating: ${updateError.message}`);
    }
    
    // Get next card by checking for cards without rating
    const { data: pendingSessionCards, error: pendingError } = await this.supabase
      .from('session_cards')
      .select('flashcard_id')
      .eq('session_id', sessionId)
      .is('rating', null)
      .order('sequence_no')
      .limit(1);
      
    if (pendingError) {
      throw new Error(`Failed to get next card: ${pendingError.message}`);
    }
    
    // If there's a next card, fetch its details
    if (pendingSessionCards && pendingSessionCards.length > 0) {
      const nextCardId = pendingSessionCards[0].flashcard_id;
      
      const { data: nextCard, error: cardError } = await this.supabase
        .from('flashcards')
        .select('id, question, answer')
        .eq('id', nextCardId)
        .single();
        
      if (cardError) {
        throw new Error(`Failed to get flashcard details: ${cardError.message}`);
      }
      
      return {
        id: nextCard.id,
        question: nextCard.question,
        answer: nextCard.answer,
      };
    }
    
    // If no more cards, calculate score and return summary
    const { data: completedCards, error: completedError } = await this.supabase
      .from('session_cards')
      .select('rating')
      .eq('session_id', sessionId)
      .not('rating', 'is', null);
      
    if (completedError) {
      throw new Error(`Failed to get completed cards: ${completedError.message}`);
    }
    
    // Calculate score based on ratings
    const totalCards = completedCards.length;
    const score = completedCards.reduce((acc: number, card: CardRating) => {
      switch (card.rating) {
        case 'easy': return acc + 4;
        case 'good': return acc + 3;
        case 'hard': return acc + 2;
        case 'again': return acc + 1;
        default: return acc;
      }
    }, 0) / (totalCards * 4) * 100;
    
    // Update session as completed
    await this.supabase
      .from('sessions')
      .update({
        status: 'completed',
        score: Math.round(score),
        ended_at: new Date().toISOString(),
      })
      .eq('id', sessionId);
    
    // Return session summary
    return {
      sessionId,
      flashcardsSetId: session.flashcards_set_id,
      tags: session.tags,
      score: Math.round(score),
      createdAt: session.created_at,
    };
  }
  
  /**
   * End a session prematurely
   * @param sessionId Session ID to end
   */
  async end(sessionId: string): Promise<void> {
    // Get user ID from auth context
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }
    
    // Verify session belongs to user
    const { data: session, error: sessionError } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();
      
    if (sessionError || !session) {
      throw new Error('Session not found or unauthorized');
    }
    
    // Update session as abandoned
    const { error: updateError } = await this.supabase
      .from('sessions')
      .update({
        status: 'abandoned',
        ended_at: new Date().toISOString(),
      })
      .eq('id', sessionId);
      
    if (updateError) {
      throw new Error(`Failed to end session: ${updateError.message}`);
    }
  }
} 
export async function fetchSession(
  sessionId: string
): Promise<StartSessionResponseDTO> {
  const response = await fetch(`/api/sessions/${sessionId}`);
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
    `/api/sessions/${sessionId}/cards/${cardId}/evaluate`,
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
  let url = `/api/sessions/${sessionId}`;
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