import { NextResponse } from "next/server";
import { z } from "zod";
import { FlashcardsService } from "@/features/ai-generator/services/flashcardsService";
import { CreateBulkFlashcardsCommandSchema } from "@/features/schemas/flashcard";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const command = CreateBulkFlashcardsCommandSchema.parse(body);
    const flashcards = await FlashcardsService.createBulk(command);
    return NextResponse.json(flashcards, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
