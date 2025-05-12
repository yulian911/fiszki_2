import { NextResponse } from "next/server";
import { AcceptSuggestionCommandSchema } from "@/features/schemas/flashcardsSuggestion";
import { FlashcardsSuggestionService } from "@/features/services/flashcardsSuggestionService";
import { createClient } from "@/utils/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: any }
) {
  try {
    const { suggestionId } = await params;
    const body = await request.json();
    const bodyParse = AcceptSuggestionCommandSchema.safeParse(body);
    if (!bodyParse.success) {
      console.error('AcceptSuggestion validation errors:', bodyParse.error.flatten().fieldErrors);
      return NextResponse.json(
        { error: 'Invalid request body', details: bodyParse.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const card = await FlashcardsSuggestionService.accept(
      suggestionId,
      bodyParse.data
    );
    return NextResponse.json(card, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 