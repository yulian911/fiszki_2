import { NextResponse } from "next/server";
import {
  AcceptSuggestionCommandSchema,
  SuggestionIdParamSchema,
} from "@/features/schemas/flashcardsSuggestion";
import { FlashcardsSuggestionService } from "@/features/ai-generator/services/flashcardsSuggestionService";
import { createClient } from "@/utils/supabase/server";

export async function POST(
  request: Request,
  context: { params: { suggestionId: string } }
) {
  const params = context.params;
  console.log("ACCEPT Received params:", params);
  try {
    const paramParseResult = SuggestionIdParamSchema.safeParse(params);
    if (!paramParseResult.success) {
      console.error(
        "ACCEPT Error parsing suggestionId params:",
        paramParseResult.error
      );
      return NextResponse.json(
        { error: paramParseResult.error.format() },
        { status: 400 }
      );
    }
    const { suggestionId } = paramParseResult.data;
    console.log("ACCEPT Parsed suggestionId:", suggestionId);

    const rawBody = await request.text();
    console.log("ACCEPT Raw request body:", rawBody);

    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (e: any) {
      console.error("ACCEPT Error parsing request body as JSON:", e.message);
      return NextResponse.json(
        { error: "Invalid JSON format in request body." },
        { status: 400 }
      );
    }
    console.log("ACCEPT Parsed request body:", parsedBody);

    const bodyParseResult = AcceptSuggestionCommandSchema.safeParse(parsedBody);
    if (!bodyParseResult.success) {
      console.error(
        "ACCEPT AcceptSuggestion validation errors:",
        bodyParseResult.error
      );
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: bodyParseResult.error.format(),
        },
        { status: 400 }
      );
    }
    const validatedBody = bodyParseResult.data;
    console.log("ACCEPT Validated body:", validatedBody);

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const card = await FlashcardsSuggestionService.accept(
      suggestionId,
      validatedBody
    );
    console.log("ACCEPT Suggestion accepted, card:", card);
    return NextResponse.json(card, { status: 201 });
  } catch (err: any) {
    console.error(
      "ACCEPT Error in POST /api/flashcards-suggestions/[suggestionId]/accept:",
      err
    );
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
