import { NextResponse } from "next/server";
import { EditSuggestionCommandSchema, SuggestionIdParamSchema } from "@/features/schemas/flashcardsSuggestion";
import { FlashcardsSuggestionService } from "@/features/services/flashcardsSuggestionService";
import { createClient } from "@/utils/supabase/server";

export async function PUT(
  request: Request,
  { params: paramsPromise }: { params: { suggestionId: string } }
) {
  console.log("Received paramsPromise:", paramsPromise);
  try {
    const params = await paramsPromise;
    console.log("Resolved params (after await):", params);

    const paramParseResult = SuggestionIdParamSchema.safeParse(params);
    if (!paramParseResult.success) {
      console.error("Error parsing suggestionId params:", paramParseResult.error);
      return NextResponse.json({ error: paramParseResult.error.format() }, { status: 400 });
    }
    const { suggestionId } = paramParseResult.data;

    const rawBody = await request.text();
    console.log("Raw request body:", rawBody);

    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (e: any) {
      console.error("Error parsing request body as JSON:", e.message);
      return NextResponse.json({ error: "Invalid JSON format in request body." }, { status: 400 });
    }
    
    console.log("Parsed request body:", parsedBody);

    const bodyParseResult = EditSuggestionCommandSchema.safeParse(parsedBody);
    if (!bodyParseResult.success) {
      console.error("Error parsing request body with Zod:", bodyParseResult.error);
      return NextResponse.json({ error: bodyParseResult.error.format() }, { status: 400 });
    }
    const validatedBody = bodyParseResult.data;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const updated = await FlashcardsSuggestionService.edit(
      suggestionId,
      validatedBody
    );
    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    console.error("Error in PUT /api/flashcards-suggestions/[suggestionId]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 