import { NextResponse } from "next/server";
import { z } from "zod";

import { FlashcardsService } from "@/features/ai-generator/services/flashcardsService";
import { ListFlashcardsQuerySchema, CreateFlashcardCommandSchema } from "@/features/schemas/flashcard";

/**
 * GET /api/flashcards
 * Lists flashcards with optional filters, pagination, and sorting
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = {
      setId: url.searchParams.get("setId") ?? undefined,
      source: url.searchParams.get("source") ?? undefined,
      tags: url.searchParams.get("tags") ?? undefined,
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      sortBy: url.searchParams.get("sortBy") ?? undefined,
    };
    const validated = ListFlashcardsQuerySchema.parse(queryParams);
    const result = await FlashcardsService.list(validated);
    return NextResponse.json(
      { data: result.data, meta: { page: validated.page, limit: validated.limit, total: result.total } },
      { status: 200 },
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/flashcards
 * Creates a new flashcard
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const command = CreateFlashcardCommandSchema.parse(body);
    const flashcard = await FlashcardsService.create(command);
    return NextResponse.json(flashcard, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 