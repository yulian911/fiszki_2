import { NextResponse } from "next/server";
import { SuggestionIdParamSchema } from "@/features/schemas/flashcardsSuggestion";
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
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await FlashcardsSuggestionService.reject(paramParse.data.suggestionId);
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 