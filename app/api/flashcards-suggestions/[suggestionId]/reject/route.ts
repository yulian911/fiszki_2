import { NextResponse } from "next/server";
import { FlashcardsSuggestionService } from "@/features/services/flashcardsSuggestionService";
import { createClient } from "@/utils/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: any }
) {
  try {
    const { suggestionId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await FlashcardsSuggestionService.reject(suggestionId);
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 