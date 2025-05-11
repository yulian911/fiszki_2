import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/client";
import { z } from "zod";

import { FlashcardsSetService } from "../../../services/FlashcardsSetService";
import {
  flashcardsSetListQuerySchema,
  createFlashcardsSetSchema,
} from "../../../features/schemas/flashcardsSet";

/**
 * Pobieranie listy zestawów fiszek
 * GET /api/flashcards-sets
 */
export async function GET(request: NextRequest) {
  try {
    // Inicjalizacja klienta Supabase
    const supabase = createClient();

    // Próba pobrania użytkownika z sesji cookie
    let {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Jeśli nie udało się pobrać użytkownika z cookie, sprawdź nagłówek Authorization
    if (!user) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data.user) {
          user = data.user;
          authError = null;
        }
      }
    }

    // Jeśli nadal nie ma użytkownika, zwróć błąd autoryzacji
    if (!user) {
      return NextResponse.json(
        {
          error: "Nieautoryzowany dostęp",
          details:
            "Musisz być zalogowany, aby wykonać tę operację. " +
            "Sprawdź swoje ciasteczka sesji lub nagłówek Authorization.",
        },
        { status: 401 }
      );
    }

    // Inicjalizacja serwisu z uwierzytelnionym klientem
    const flashcardsSetService = new FlashcardsSetService(supabase);

    // Pobranie i walidacja parametrów zapytania
    const url = new URL(request.url);
    const params = {
      page: url.searchParams.get("page") || "1",
      limit: url.searchParams.get("limit") || "20",
      sortBy: url.searchParams.get("sortBy") || "createdAt",
      status: url.searchParams.get("status"),
    };

    // Walidacja parametrów zapytania
    const validatedParams = flashcardsSetListQuerySchema.safeParse({
      page: params.page,
      limit: params.limit,
      sortBy: params.sortBy,
      status: params.status,
    });

    if (!validatedParams.success) {
      return NextResponse.json(
        {
          error: "Nieprawidłowe parametry zapytania",
          details: validatedParams.error.format(),
        },
        { status: 400 }
      );
    }

    // Pobranie listy zestawów fiszek
    const { page, limit, sortBy, status } = validatedParams.data;
    const result = await flashcardsSetService.list(
      user.id,
      page,
      limit,
      sortBy,
      status
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Błąd podczas pobierania zestawów fiszek:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera", details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Tworzenie nowego zestawu fiszek
 * POST /api/flashcards-sets
 */
export async function POST(request: NextRequest) {
  try {
    // Inicjalizacja klienta Supabase
    const supabase = createClient();

    // Próba pobrania użytkownika z sesji cookie
    let {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Jeśli nie udało się pobrać użytkownika z cookie, sprawdź nagłówek Authorization
    if (!user) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data.user) {
          user = data.user;
          authError = null;
        }
      }
    }

    // Jeśli nadal nie ma użytkownika, zwróć błąd autoryzacji
    if (!user) {
      return NextResponse.json(
        {
          error: "Nieautoryzowany dostęp",
          details:
            "Musisz być zalogowany, aby wykonać tę operację. " +
            "Sprawdź swoje ciasteczka sesji lub nagłówek Authorization.",
        },
        { status: 401 }
      );
    }

    // Inicjalizacja serwisu z uwierzytelnionym klientem
    const flashcardsSetService = new FlashcardsSetService(supabase);

    // Pobranie i walidacja danych z żądania
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Nieprawidłowy format JSON",
          details: "Przesłane dane nie są poprawnym JSON",
        },
        { status: 400 }
      );
    }

    const validatedData = createFlashcardsSetSchema.safeParse(requestData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane", details: validatedData.error.format() },
        { status: 400 }
      );
    }

    // Utworzenie nowego zestawu fiszek
    try {
      const result = await flashcardsSetService.create(
        user.id,
        validatedData.data
      );

      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      console.error("Błąd podczas tworzenia zestawu fiszek:", error);
      return NextResponse.json(
        { error: "Wystąpił błąd serwera", details: (error as Error).message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Błąd podczas tworzenia zestawu fiszek:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera", details: (error as Error).message },
      { status: 500 }
    );
  }
}
