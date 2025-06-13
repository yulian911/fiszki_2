import { NextRequest, NextResponse } from "next/server";

import { FlashcardsSetService } from "../../../../../../features/flashcard-sets/services/FlashcardsSetService";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const paramsSchema = z.object({
  setId: z.string().uuid(),
  shareId: z.string().uuid(),
});

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ setId: string,shareId: string   }> }
) {
  try {
    const params = await context.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paramsValidation = paramsSchema.safeParse(params);
    if (!paramsValidation.success) {
      return NextResponse.json({ error: "Invalid params format", details: paramsValidation.error.format() }, { status: 400 });
    }

    const { setId, shareId } = paramsValidation.data;

    const service = new FlashcardsSetService(supabase);
    await service.revokeShare(user.id, setId, shareId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: "Internal Server Error", details: errorMessage }, { status: 500 });
  }
} 