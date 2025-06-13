import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const emailSchema = z.string().email();

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const emailQuery = request.nextUrl.searchParams.get("email");

    const emailValidation = emailSchema.safeParse(emailQuery);
    if (!emailValidation.success) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const { data: foundUser, error } = await supabase.rpc("find_user_by_email", {
      email_query: emailValidation.data,
    }).single<{ id: string; email: string }>();

    console.log("Found user data from RPC:", foundUser);

    if (error && error.code !== 'PGRST116') {
      console.error("Error calling find_user_by_email RPC:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    if (!foundUser) {
      return NextResponse.json({ error: "Nie znaleziono użytkownika o podanym adresie e-mail." }, { status: 404 });
    }

    // Nie zwracaj danych użytkownika, który wysyła zapytanie
    if (foundUser.id === currentUser.id) {
        return NextResponse.json({ error: "You cannot share a set with yourself" }, { status: 400 });
    }

    // Zwracamy tylko bezpieczne dane
    return NextResponse.json({ id: foundUser.id, email: foundUser.email });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: "Internal Server Error", details: errorMessage }, { status: 500 });
  }
}