import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";
import { z } from "zod";
import { FlashcardsSetService } from "../../../features/flashcard-sets/services/FlashcardsSetService";
import {
  flashcardsSetListQuerySchema,
  createFlashcardsSetSchema,
} from "../../../features/schemas/flashcardsSet";
import { rateLimit } from '../../../lib/rate-limit';

/**
 * Helper function to handle authentication
 * Gets user from session cookie or Authorization header
 */
async function authenticateRequest(request: NextRequest) {
  const supabase = await createClient();
  
  // Try to get user from session cookie
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // If no user found, check Authorization header
  if (!user && request.headers.has("Authorization")) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const { data, error } = await supabase.auth.getUser(token);
      
      if (!error && data.user) {
        return { user: data.user, supabase };
      }
    }
  }

  if (!user) {
    throw new Error("Unauthorized access");
  }

  return { user, supabase };
}

/**
 * Pobieranie listy zestawów fiszek
 * GET /api/flashcards-sets
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const limiter = await rateLimit(request);
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const { user, supabase } = await authenticateRequest(request);
    const flashcardsSetService = new FlashcardsSetService(supabase);

    // Pobranie i walidacja parametrów zapytania
    const url = new URL(request.url);
    const params = {
      page: url.searchParams.get("page") || "1",
      limit: url.searchParams.get("limit") || "20",
      sortBy: url.searchParams.get("sortBy") || "createdAt",
      sortOrder: url.searchParams.get("sortOrder") || "desc",
      status: url.searchParams.get("status") ?? undefined,
      name: url.searchParams.get("name") ?? undefined,
    };

    // Walidacja parametrów zapytania
    const validatedParams = flashcardsSetListQuerySchema.safeParse(params);

    if (!validatedParams.success) {
      return NextResponse.json(
        {
          error: "Nieprawidłowe parametry zapytania",
          details: validatedParams.error.format(),
        },
        { status: 400 }
      );
    }

    // Pobranie listy zestawów fiszek
    const { page, limit, sortBy, sortOrder, status, name } = validatedParams.data;
    const result = await flashcardsSetService.list(
      user.id,
      page,
      limit,
      sortBy,
      sortOrder,
      status,
      name
    );

    // Add cache headers
    const response = NextResponse.json(result);
    response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized access") {
      return NextResponse.json(
        {
          error: "Unauthorized access",
          details: "You must be logged in to perform this operation.",
        },
        { status: 401 }
      );
    }

    console.error("Error fetching flashcard sets:", error);
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Tworzenie nowego zestawu fiszek
 * POST /api/flashcards-sets
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const limiter = await rateLimit(request);
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const { user, supabase } = await authenticateRequest(request);
    const flashcardsSetService = new FlashcardsSetService(supabase);

    // Pobranie i walidacja danych z żądania
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Nieprawidłowy format JSON",
          details: "Przesłane dane nie są poprawnym JSON",
        },
        { status: 400 }
      );
    }

    const validatedData = createFlashcardsSetSchema.safeParse(requestData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane", details: validatedData.error.format() },
        { status: 400 }
      );
    }

    // Utworzenie nowego zestawu fiszek
    const result = await flashcardsSetService.create(
      user.id,
      validatedData.data
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized access") {
      return NextResponse.json(
        {
          error: "Unauthorized access",
          details: "You must be logged in to perform this operation.",
        },
        { status: 401 }
      );
    }

    console.error("Error creating flashcard set:", error);
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
