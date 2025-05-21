import {
  FlashcardsSetDTO,
  FlashcardsSetWithCardsDTO,
  CreateFlashcardsSetCommand,
  UpdateFlashcardsSetCommand,
  PaginatedResponse,
  FlashcardsSetStatus,
} from "../types";
import type { SupabaseClient } from "@supabase/supabase-js";

// Typy pomocnicze dla danych z bazy danych
interface FlashcardsSetRecord {
  id: string;
  owner_id: string;
  name: string;
  status: FlashcardsSetStatus;
  created_at: string;
  updated_at: string;
}

interface FlashcardRecord {
  id: string;
  flashcards_set_id: string;
  question: string;
  answer: string;
  source: "ai-full" | "ai-edit" | "manual";
  created_at: string;
  updated_at: string;
}

interface TagRecord {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// Funkcja pomocnicza do mapowania rekordu na DTO
function mapFlashcardsSetToDTO(record: unknown): FlashcardsSetDTO {
  const item = record as any;
  return {
    id: item.id,
    ownerId: item.owner_id,
    name: item.name,
    status: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    description: item.description,
    flashcardCount:
      item.flashcard_count ??
      (Array.isArray(item.flashcards) && item.flashcards.length > 0
        ? item.flashcards[0].count
        : 0),
  };
}

export class FlashcardsSetService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Pobiera stronicowaną listę zestawów fiszek użytkownika
   */
  async list(
    userId: string,
    page: number = 1,
    limit: number = 20,
    sortBy: string = "createdAt",
    sortOrder: string = "desc",
    status?: FlashcardsSetStatus,
    nameSearch?: string
  ): Promise<PaginatedResponse<FlashcardsSetDTO>> {
    // Obliczanie przesunięcia dla paginacji
    const offset = (page - 1) * limit;

    // Początkowe zapytanie
    let query = this.supabase
      .from("flashcards_set")
      .select("*, flashcards(count)", { count: "exact" })
      .eq("owner_id", userId);

    // Dodanie filtrowania po statusie, jeśli podano
    if (status) {
      query = query.eq("status", status);
    }

    // Dodanie filtrowania po nazwie, jeśli podano
    if (nameSearch) {
      query = query.ilike("name", `%${nameSearch}%`);
    }

    // Sortowanie i paginacja: mapujemy sortBy na nazwy kolumn w DB
    const sortColumnMap: Record<string, string> = {
      name: "name",
      createdAt: "created_at",
      updatedAt: "updated_at",
    };
    const column = sortColumnMap[sortBy] ?? "created_at";
    const ascending = sortOrder === "asc";

    const { data, error, count } = await query
      .order(column, { ascending })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(
        `Błąd podczas pobierania listy zestawów: ${error.message}`
      );
    }

    // Mapowanie danych z DB na DTO
    const flashcardsSets: FlashcardsSetDTO[] = (data || []).map(
      mapFlashcardsSetToDTO
    );

    return {
      data: flashcardsSets,
      meta: {
        page,
        limit,
        total: count || 0,
      },
    };
  }

  /**
   * Tworzy nowy, pusty zestaw fiszek
   */
  async create(
    userId: string,
    command: CreateFlashcardsSetCommand
  ): Promise<FlashcardsSetDTO> {
    console.log("Tworzenie zestawu fiszek dla użytkownika:", userId);
    console.log("Dane:", command);

    // Sprawdzenie, czy użytkownik ma uprawnienia do wykonywania operacji
    const { data: userData, error: userError } =
      await this.supabase.auth.getUser();
    console.log("Aktualnie uwierzytelniony użytkownik:", userData?.user?.id);

    if (userError || !userData.user) {
      throw new Error(
        `Brak uwierzytelnienia użytkownika: ${userError?.message || "Nieznany błąd"}`
      );
    }

    if (userData.user.id !== userId) {
      console.warn(
        "Niezgodność ID użytkownika: przekazane ID",
        userId,
        "ale uwierzytelnione ID to",
        userData.user.id
      );
    }

    // Tworzenie zestawu z jawnie ustawionym owner_id
    const { data, error } = await this.supabase
      .from("flashcards_set")
      .insert({
        owner_id: userData.user.id, // Używamy ID z aktualnej sesji zamiast przekazanego
        name: command.name,
        description: command.description,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Błąd Supabase:", error);
      throw new Error(
        `Błąd podczas tworzenia zestawu fiszek: ${error.message}`
      );
    }

    return mapFlashcardsSetToDTO(data);
  }

  /**
   * Pobiera szczegóły zestawu wraz z listą fiszek
   */
  async getById(
    userId: string,
    setId: string
  ): Promise<FlashcardsSetWithCardsDTO> {
    // Pobieranie zestawu
    const { data: set, error: setError } = await this.supabase
      .from("flashcards_set")
      .select("*")
      .eq("id", setId)
      .eq("owner_id", userId)
      .single();

    if (setError) {
      throw new Error(`Błąd podczas pobierania zestawu: ${setError.message}`);
    }

    // Pobieranie fiszek powiązanych z zestawem
    const { data: flashcardsData, error: flashcardsError } = await this.supabase
      .from("flashcards")
      .select(
        `
        *,
        flashcards_tags (
          tag_id
        ),
        tags (
          id,
          name,
          created_at,
          updated_at
        )
      `
      )
      .eq("flashcards_set_id", setId);

    if (flashcardsError) {
      throw new Error(
        `Błąd podczas pobierania fiszek: ${flashcardsError.message}`
      );
    }

    // Mapowanie i grupowanie tagów dla każdej fiszki
    const flashcards = (flashcardsData || []).map((card: any) => {
      const tags = card.tags || [];

      return {
        id: card.id,
        flashcardsSetId: card.flashcards_set_id,
        question: card.question,
        answer: card.answer,
        source: card.source,
        createdAt: card.created_at,
        updatedAt: card.updated_at,
        tags: tags.map((tag: any) => ({
          id: tag.id,
          name: tag.name,
          createdAt: tag.created_at,
          updatedAt: tag.updated_at,
        })),
      };
    });

    const setDTO = mapFlashcardsSetToDTO(set);

    return {
      ...setDTO,
      // Upewniamy się, że flashcardCount w detail zawiera faktyczną liczbę pobranych fiszek
      flashcardCount: flashcards.length,
      flashcards,
    };
  }

  /**
   * Aktualizuje nazwę i/lub status zestawu
   */
  async update(
    userId: string,
    setId: string,
    command: UpdateFlashcardsSetCommand
  ): Promise<FlashcardsSetDTO> {
    // Przygotowanie pól do aktualizacji
    const updates: Partial<{
      name: string;
      status: FlashcardsSetStatus;
      description: string;
    }> = {};

    if (command.name !== undefined) {
      updates.name = command.name;
    }

    if (command.status !== undefined) {
      updates.status = command.status;
    }

    if (command.description !== undefined) {
      updates.description = command.description;
    }

    // Sprawdzenie, czy cokolwiek wymaga aktualizacji
    if (Object.keys(updates).length === 0) {
      throw new Error("Brak pól do aktualizacji");
    }

    console.log("Aktualizacja zestawu:", setId, "dla użytkownika:", userId);
    console.log("Aktualizowane pola:", updates);

    // Wykonanie aktualizacji
    const { data, error } = await this.supabase
      .from("flashcards_set")
      .update(updates)
      .eq("id", setId)
      .eq("owner_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Błąd podczas aktualizacji zestawu: ${error.message}`);
    }

    return mapFlashcardsSetToDTO(data);
  }

  /**
   * Usuwa zestaw i wszystkie powiązane fiszki
   */
  async delete(userId: string, setId: string): Promise<void> {
    // Sprawdzenie, czy zestaw istnieje i należy do użytkownika
    const { data: existingSet, error: checkError } = await this.supabase
      .from("flashcards_set")
      .select("*")
      .eq("id", setId)
      .eq("owner_id", userId)
      .single();

    if (checkError) {
      throw new Error(
        `Zestaw nie istnieje lub użytkownik nie ma do niego dostępu: ${checkError.message}`
      );
    }

    // Usunięcie zestawu (kaskadowe usunięcie fiszek powinno być obsługiwane przez RLS w bazie)
    const { error } = await this.supabase
      .from("flashcards_set")
      .delete()
      .eq("id", setId);

    if (error) {
      throw new Error(`Błąd podczas usuwania zestawu: ${error.message}`);
    }
  }
}
