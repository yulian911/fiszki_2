import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import {
  FlashcardsSetService,
  isCurrentUserAdmin,
} from "../../../../features/flashcard-sets/services/FlashcardsSetService";
import { updateFlashcardsSetCommandSchema } from "../../../../features/schemas/flashcardsSetSchemas";
import { z } from "zod";

const setIdSchema = z.string().uuid();

/**
 * Pobiera szczegóły pojedynczego zestawu fiszek
 * GET /api/flashcards-sets/[setId]
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ setId: string }> }
) {
  try {
    const params = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const validation = setIdSchema.safeParse(params.setId);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid setId format" },
        { status: 400 }
      );
    }

    const service = new FlashcardsSetService(supabase);
    const flashcardSet = await service.getById(user.id, validation.data);
    return NextResponse.json(flashcardSet);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Aktualizuje zestaw fiszek
 * PUT /api/flashcards-sets/[setId]
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ setId: string }> }
) {
  try {
    const params = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const setIdValidation = setIdSchema.safeParse(params.setId);
    if (!setIdValidation.success) {
      return NextResponse.json(
        { error: "Invalid setId format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const bodyValidation = updateFlashcardsSetCommandSchema.safeParse(body);
    if (!bodyValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: bodyValidation.error.format(),
        },
        { status: 400 }
      );
    }

    // Sprawdź, czy użytkownik jest adminem
    const isAdmin = await isCurrentUserAdmin(supabase);

    const service = new FlashcardsSetService(supabase);
    const updatedSet = await service.update(
      user.id,
      setIdValidation.data,
      bodyValidation.data,
      isAdmin
    );
    return NextResponse.json(updatedSet);
  } catch (error) {
    console.error(
      "Szczegółowy błąd w PUT /api/flashcards-sets/[setId]:",
      error
    );
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Usuwa zestaw fiszek
 * DELETE /api/flashcards-sets/[setId]
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ setId: string }> }
) {
  try {
    const params = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const setIdValidation = setIdSchema.safeParse(params.setId);
    if (!setIdValidation.success) {
      return NextResponse.json(
        { error: "Invalid setId format" },
        { status: 400 }
      );
    }

    const service = new FlashcardsSetService(supabase);
    await service.delete(user.id, setIdValidation.data);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}
