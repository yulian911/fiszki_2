import { NextRequest, NextResponse } from 'next/server';
import { SessionsService } from '@/services/SessionsService';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/sessions/[sessionId]
 * Get session data with cards
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Extract path parameter
    const { sessionId } = await params;
    
    // Initialize service with Supabase client  
    const supabase = await createClient();
    const sessionsService = new SessionsService(supabase);
    
    // Get session data - return the cards from the session
    // For now, we'll create a simple endpoint that returns session cards
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
      
    if (sessionError || !sessionData) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Get session cards in order
    const { data: sessionCards, error: cardsError } = await supabase
      .from('session_cards')
      .select(`
        flashcard_id,
        sequence_no,
        rating,
        flashcards (
          id,
          question,
          answer
        )
      `)
      .eq('session_id', sessionId)
      .order('sequence_no');
      
    if (cardsError) {
      throw new Error(`Failed to get session cards: ${cardsError.message}`);
    }
    
    // Format response similar to StartSessionResponseDTO
    const cards = sessionCards?.map((sc: any) => ({
      id: sc.flashcards.id,
      question: sc.flashcards.question,
      answer: sc.flashcards.answer,
    })) || [];
    
    return NextResponse.json({
      sessionId,
      cards
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sessions/[sessionId]
 * End a session prematurely
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Extract path parameter
    const { sessionId } = await params;
    
    // Initialize service with Supabase client
    const supabase = await createClient();
    const sessionsService = new SessionsService(supabase);
    
    // End session
    await sessionsService.end(sessionId);
    
    // Return successful response with no content
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error ending session:', error);
    
    // Handle different error types
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      if (error.message === 'Session not found or unauthorized') {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
    }
    
    // Default server error response
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 