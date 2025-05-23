import { NextRequest, NextResponse } from 'next/server';
import { evaluateCardSchema } from '@/features/schemas/session';
import { SessionsService } from '@/services/SessionsService';
import { createClient } from '@/utils/supabase/server';

/**
 * PATCH /api/sessions/[sessionId]/cards/[cardId]/evaluate
 * Evaluate a card in a session
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; cardId: string }> }
) {
  try {
    // Extract path parameters
    const { sessionId, cardId } = await params;
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = evaluateCardSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    // Get validated data
    const command = validationResult.data;
    
    // Initialize service with Supabase client
    const supabase = await createClient();
    const sessionsService = new SessionsService(supabase);
    
    // Evaluate card
    const result = await sessionsService.evaluate(sessionId, cardId, command);
    
    // Return successful response
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error evaluating card:', error);
    
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