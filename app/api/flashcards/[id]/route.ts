import { NextResponse } from "next/server";
import { z } from "zod";

import { FlashcardsService } from "@/features/services/flashcardsService";
import { FlashcardDTOSchema, UpdateFlashcardCommandSchema } from "@/features/schemas/flashcard";

/**
 * GET /api/flashcards/:id
 * Retrieves a single flashcard by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    // Validate ID format
    const validatedId = z.string().uuid().parse(id);

    const flashcard = await FlashcardsService.getById(validatedId);
    const validated = FlashcardDTOSchema.parse(flashcard);
    return NextResponse.json(validated, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues },
        { status: 400 },
      );
    }
    if (error.message === "Flashcard not found") {
      return NextResponse.json(
        { error: "Flashcard not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/flashcards/:id
 * Updates a flashcard by ID
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const validatedId = z.string().uuid().parse(params.id);
    const body = await request.json();
    const command = UpdateFlashcardCommandSchema.parse(body);
    const updated = await FlashcardsService.update(validatedId, command);
    const validated = FlashcardDTOSchema.parse(updated);
    return NextResponse.json(validated, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (error.message === "Flashcard not found") {
      return NextResponse.json({ error: "Flashcard not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/flashcards/:id
 * Deletes a flashcard by ID
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = z.string().uuid().parse(params.id);
    await FlashcardsService.delete(id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (error.message === "Flashcard not found") {
      return NextResponse.json({ error: "Flashcard not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 