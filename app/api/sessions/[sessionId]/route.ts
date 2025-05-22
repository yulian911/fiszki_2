import { NextRequest, NextResponse } from 'next/server';
import { SessionsService } from '@/services/SessionsService';
import { createClient } from '@/utils/supabase/server';

/**
 * DELETE /api/sessions/[sessionId]
 * End a session prematurely
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Extract path parameter
    const { sessionId } = params;
    
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