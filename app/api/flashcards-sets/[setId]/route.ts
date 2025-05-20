import { NextRequest, NextResponse } from "next/server";


import { createClient } from "@/utils/supabase/server";
import { FlashcardsSetService } from "../../../../services/FlashcardsSetService";
import {
  idParamSchema,
  updateFlashcardsSetSchema,
} from "../../../../features/schemas/flashcardsSet";

/**
 * Pobiera szczegóły pojedynczego zestawu fiszek
 * GET /api/flashcards-sets/[setId]
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ setId: string }> }
) {
  try {
    // Get and await params
    const params = await context.params;
    
    // Walidacja ID zestawu
    const validatedParams = idParamSchema.safeParse({ setId: params.setId });

    if (!validatedParams.success) {
      return NextResponse.json(
        {
          error: "Nieprawidłowy identyfikator zestawu",
          details: validatedParams.error.format(),
        },
        { status: 400 }
      );
    }

    // Inicjalizacja klienta Supabase
    const supabase = await createClient ();

    // Pobranie danych użytkownika z sesji
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Nieautoryzowany dostęp",
          details:
            authError?.message ||
            "Musisz być zalogowany, aby wykonać tę operację",
        },
        { status: 401 }
      );
    }

    // Inicjalizacja serwisu z uwierzytelnionym klientem
    const flashcardsSetService = new FlashcardsSetService(supabase);

    // Pobranie zestawu fiszek
    try {
      const result = await flashcardsSetService.getById(user.id, params.setId);
      return NextResponse.json(result);
    } catch (serviceError) {
      // Obsługa błędu, gdy zestaw nie istnieje lub użytkownik nie ma do niego dostępu
      if (
        (serviceError as Error).message.includes("nie istnieje") ||
        (serviceError as Error).message.includes("nie ma do niego dostępu")
      ) {
        return NextResponse.json(
          {
            error: "Zestaw nie został znaleziony",
            details: (serviceError as Error).message,
          },
          { status: 404 }
        );
      }
      throw serviceError; // Przekazanie innych błędów do głównej obsługi
    }
  } catch (error) {
    console.error("Błąd podczas pobierania zestawu fiszek:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera", details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Aktualizuje zestaw fiszek
 * PUT /api/flashcards-sets/[setId]
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ setId: string }> }
) {
  try {
    // Get and await params
    const params = await context.params;
    
    // Walidacja ID zestawu
    const validatedParams = idParamSchema.safeParse({ setId: params.setId });

    if (!validatedParams.success) {
      return NextResponse.json(
        {
          error: "Nieprawidłowy identyfikator zestawu",
          details: validatedParams.error.format(),
        },
        { status: 400 }
      );
    }

    // Inicjalizacja klienta Supabase
    const supabase = await createClient ();

    // Pobranie danych użytkownika z sesji
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Nieautoryzowany dostęp",
          details:
            authError?.message ||
            "Musisz być zalogowany, aby wykonać tę operację",
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

    const validatedData = updateFlashcardsSetSchema.safeParse(requestData);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: "Nieprawidłowe dane aktualizacji",
          details: validatedData.error.format(),
        },
        { status: 400 }
      );
    }

    // Aktualizacja zestawu fiszek
    try {
      const result = await flashcardsSetService.update(
        user.id,
        params.setId,
        validatedData.data
      );
      return NextResponse.json(result);
    } catch (serviceError) {
      // Obsługa błędu, gdy zestaw nie istnieje lub użytkownik nie ma do niego dostępu
      if (
        (serviceError as Error).message.includes("nie istnieje") ||
        (serviceError as Error).message.includes("nie ma do niego dostępu")
      ) {
        return NextResponse.json(
          {
            error: "Zestaw nie został znaleziony",
            details: (serviceError as Error).message,
          },
          { status: 404 }
        );
      }
      throw serviceError; // Przekazanie innych błędów do głównej obsługi
    }
  } catch (error) {
    console.error("Błąd podczas aktualizacji zestawu fiszek:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera", details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Usuwa zestaw fiszek
 * DELETE /api/flashcards-sets/[setId]
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ setId: string }> }
) {
  try {
    // Get and await params
    const params = await context.params;
    
    // Walidacja ID zestawu
    const validatedParams = idParamSchema.safeParse({ setId: params.setId });

    if (!validatedParams.success) {
      return NextResponse.json(
        {
          error: "Nieprawidłowy identyfikator zestawu",
          details: validatedParams.error.format(),
        },
        { status: 400 }
      );
    }

    // Inicjalizacja klienta Supabase
    const supabase = await createClient ();

    // Pobranie danych użytkownika z sesji
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Nieautoryzowany dostęp",
          details:
            authError?.message ||
            "Musisz być zalogowany, aby wykonać tę operację",
        },
        { status: 401 }
      );
    }

    // Inicjalizacja serwisu z uwierzytelnionym klientem
    const flashcardsSetService = new FlashcardsSetService(supabase);

    // Usunięcie zestawu fiszek
    try {
      await flashcardsSetService.delete(user.id, params.setId);
      return new NextResponse(null, { status: 204 });
    } catch (serviceError) {
      // Obsługa błędu, gdy zestaw nie istnieje lub użytkownik nie ma do niego dostępu
      if (
        (serviceError as Error).message.includes("nie istnieje") ||
        (serviceError as Error).message.includes("nie ma do niego dostępu")
      ) {
        return NextResponse.json(
          {
            error: "Zestaw nie został znaleziony",
            details: (serviceError as Error).message,
          },
          { status: 404 }
        );
      }
      throw serviceError; // Przekazanie innych błędów do głównej obsługi
    }
  } catch (error) {
    console.error("Błąd podczas usuwania zestawu fiszek:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera", details: (error as Error).message },
      { status: 500 }
    );
  }
}
