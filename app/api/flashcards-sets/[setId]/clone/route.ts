import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../utils/supabase/server";
import { FlashcardsSetService } from "../../../../../features/flashcard-sets/services/FlashcardsSetService";
import { cloneFlashcardsSetCommandSchema } from "../../../../../features/schemas/flashcardsSetSchemas";
import { z } from "zod";

const setIdSchema = z.string().uuid();

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ setId: string }> }
) {
  try {
    const params = await context.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const setIdValidation = setIdSchema.safeParse(params.setId);
    if (!setIdValidation.success) {
      return NextResponse.json({ error: "Invalid setId format" }, { status: 400 });
    }

    const body = await request.json();
    const bodyValidation = cloneFlashcardsSetCommandSchema.safeParse(body);
    if (!bodyValidation.success) {
        return NextResponse.json({ error: "Invalid request body", details: bodyValidation.error.format() }, { status: 400 });
    }

    const service = new FlashcardsSetService(supabase);
    const clonedSet = await service.clone(user.id, setIdValidation.data, bodyValidation.data);

    return NextResponse.json(clonedSet, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: "Internal Server Error", details: errorMessage }, { status: 500 });
  }
} 