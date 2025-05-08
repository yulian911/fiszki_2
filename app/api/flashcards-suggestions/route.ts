import { NextResponse } from "next/server";
import { GenerateSuggestionsCommandSchema } from "@/features/schemas/flashcardsSuggestion";
import { FlashcardsSuggestionService } from "@/features/services/flashcardsSuggestionService";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parse = GenerateSuggestionsCommandSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: parse.error.format() }, { status: 400 });
    }
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const suggestions = await FlashcardsSuggestionService.generate(parse.data.text);
    return NextResponse.json({ suggestions }, { status: 202 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 