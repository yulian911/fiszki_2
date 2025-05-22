import { createClient } from '@/utils/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { 
  StartSessionInput, 
  EvaluateCardInput, 
  SessionCardDTO, 
  SessionSummaryDTO 
} from '@/features/schemas/session';

// Define card type interfaces
interface FlashcardWithTags {
  id: string;
  question: string;
  tags?: { name: string }[];
}

interface SessionCard {
  session_id: string;
  flashcard_id: string;
  status: string;
}

interface CardRating {
  rating: 'again' | 'hard' | 'good' | 'easy';
}

interface FlashcardMinimal {
  id: string;
  question: string;
}

// Define interface for the join result from Supabase
interface SessionCardWithFlashcard {
  flashcards: {
    id: string;
    question: string;
  };
}

export class SessionsService {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || createClient();
  }

  /**
   * Start a new SRS session
   * @param command Command with flashcardsSetId, tags, and limit
   * @returns Session ID and cards for the session
   */
  async start(command: StartSessionInput) {
    const { flashcardsSetId, tags, limit } = command;
    
    // Get user ID from auth context
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }
    
    // Fetch cards for the session based on tags and limit
    const { data: cards, error: fetchError } = await this.supabase
      .from('flashcards')
      .select('id, question, tags!inner(*)')
      .eq('flashcards_set_id', flashcardsSetId)
      .order('created_at')
      .limit(limit);
      
    if (fetchError) {
      throw new Error(`Failed to fetch cards: ${fetchError.message}`);
    }
    
    if (!cards.length) {
      throw new Error('No cards found for the given set and tags');
    }
    
    // Filter by tags if specified
    let filteredCards: FlashcardWithTags[] = cards;
    if (tags.length > 0) {
      filteredCards = cards.filter((card: FlashcardWithTags) => {
        const cardTags = card.tags?.map((tag: { name: string }) => tag.name) || [];
        return tags.some((tag: string) => cardTags.includes(tag));
      });
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
    const sessionCards: SessionCard[] = filteredCards.map((card: FlashcardWithTags) => ({
      session_id: session.id,
      flashcard_id: card.id,
      status: 'pending',
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
      cards: filteredCards.map((card: FlashcardWithTags) => ({
        id: card.id,
        question: card.question,
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
    
    // Update the card status
    const { error: updateError } = await this.supabase
      .from('session_cards')
      .update({
        status: 'completed',
        rating: rating,
        completed_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId)
      .eq('flashcard_id', cardId);
      
    if (updateError) {
      throw new Error(`Failed to update card status: ${updateError.message}`);
    }
    
    // Get next card by fetching the flashcard directly
    const { data: pendingSessionCards, error: pendingError } = await this.supabase
      .from('session_cards')
      .select('flashcard_id')
      .eq('session_id', sessionId)
      .eq('status', 'pending')
      .limit(1);
      
    if (pendingError) {
      throw new Error(`Failed to get next card: ${pendingError.message}`);
    }
    
    // If there's a next card, fetch its details
    if (pendingSessionCards && pendingSessionCards.length > 0) {
      const nextCardId = pendingSessionCards[0].flashcard_id;
      
      const { data: nextCard, error: cardError } = await this.supabase
        .from('flashcards')
        .select('id, question')
        .eq('id', nextCardId)
        .single();
        
      if (cardError) {
        throw new Error(`Failed to get flashcard details: ${cardError.message}`);
      }
      
      return {
        id: nextCard.id,
        question: nextCard.question,
      };
    }
    
    // If no more cards, calculate score and return summary
    const { data: completedCards, error: completedError } = await this.supabase
      .from('session_cards')
      .select('rating')
      .eq('session_id', sessionId)
      .eq('status', 'completed');
      
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
        completed_at: new Date().toISOString(),
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
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId);
      
    if (updateError) {
      throw new Error(`Failed to end session: ${updateError.message}`);
    }
  }
} 