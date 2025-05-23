import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/tags
 * Get all available tags
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all tags from the database
    const { data: tags, error } = await supabase
      .from('tags')
      .select('id, name')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch tags: ${error.message}`);
    }

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 