import { NextResponse } from "next/server";
import { AcceptSuggestionCommandSchema, SuggestionIdParamSchema } from "@/features/schemas/flashcardsSuggestion";
import { FlashcardsSuggestionService } from "@/features/services/flashcardsSuggestionService";
import { createClient } from "@/utils/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: { suggestionId: string } }
) {
  try {
    const paramParse = SuggestionIdParamSchema.safeParse(params);
    if (!paramParse.success) {
      return NextResponse.json({ error: paramParse.error.format() }, { status: 400 });
    }
    const body = await request.json();
    const bodyParse = AcceptSuggestionCommandSchema.safeParse(body);
    if (!bodyParse.success) {
      return NextResponse.json({ error: bodyParse.error.format() }, { status: 400 });
    }
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const card = await FlashcardsSuggestionService.accept(
      paramParse.data.suggestionId,
      bodyParse.data
    );
    return NextResponse.json(card, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 