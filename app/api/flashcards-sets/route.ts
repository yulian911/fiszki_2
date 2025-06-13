import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";
import { FlashcardsSetService } from "../../../features/flashcard-sets/services/FlashcardsSetService";
import {
  listFlashcardsSetsQuerySchema,
  createFlashcardsSetCommandSchema,
} from "../../../features/schemas/flashcardsSetSchemas";
import { rateLimit } from "../../../lib/rate-limit";

/**
 * Pobieranie listy zestawów fiszek
 * GET /api/flashcards-sets
 */
export async function GET(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const flashcardsSetService = new FlashcardsSetService(supabase);

    const searchParams = request.nextUrl.searchParams;
    const queryValidation = listFlashcardsSetsQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    );

    if (!queryValidation.success) {
      return NextResponse.json(
        {
          error: "Nieprawidłowe parametry zapytania",
          details: queryValidation.error.format(),
        },
        { status: 400 }
      );
    }

    const { page, limit, sortBy, sortOrder, status, name, view } =
      queryValidation.data;
    const result = await flashcardsSetService.list(
      user.id,
      page,
      limit,
      sortBy,
      sortOrder,
      status,
      name,
      view
    );

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Błąd serwera", details: e.message },
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
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const flashcardsSetService = new FlashcardsSetService(supabase);

    const body = await request.json();
    const validatedData = createFlashcardsSetCommandSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane", details: validatedData.error.format() },
        { status: 400 }
      );
    }

    const result = await flashcardsSetService.create(
      user.id,
      validatedData.data
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error.code === "23505") {
      return NextResponse.json(
        {
          error: "Konflikt",
          details: "Zestaw o takiej nazwie już istnieje.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Błąd serwera", details: error.message },
      { status: 500 }
    );
  }
}
