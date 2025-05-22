import { NextRequest, NextResponse } from 'next/server';
import { startSessionSchema } from '@/features/schemas/session';
import { SessionsService } from '@/services/SessionsService';
import { createClient } from '@/utils/supabase/server';

/**
 * POST /api/sessions
 * Start a new SRS session
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const bodyText = await request.text();
    const body = bodyText ? JSON.parse(bodyText) : {};
    const validationResult = startSessionSchema.safeParse(body);
    
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
    
    // Start session
    const result = await sessionsService.start(command);
    
    // Return successful response
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error starting session:', error);
    
    // Handle different error types
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      if (error.message.includes('No cards found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
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