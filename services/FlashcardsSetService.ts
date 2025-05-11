import {
  FlashcardsSetDTO,
  FlashcardsSetWithCardsDTO,
  CreateFlashcardsSetCommand,
  UpdateFlashcardsSetCommand,
  PaginatedResponse,
  FlashcardsSetStatus,
} from "../types";
import { SupabaseClient } from "../utils/supabase/client";

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
    status?: FlashcardsSetStatus
  ): Promise<PaginatedResponse<FlashcardsSetDTO>> {
    // Obliczanie przesunięcia dla paginacji
    const offset = (page - 1) * limit;

    // Początkowe zapytanie
    let query = this.supabase
      .from("flashcards_set")
      .select("*", { count: "exact" })
      .eq("owner_id", userId);

    // Dodanie filtrowania po statusie, jeśli podano
    if (status) {
      query = query.eq("status", status);
    }

    // Sortowanie i paginacja
    const { data, error, count } = await query
      .order(sortBy, { ascending: sortBy === "name" })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(
        `Błąd podczas pobierania listy zestawów: ${error.message}`
      );
    }

    // Mapowanie danych z DB na DTO
    const flashcardsSets: FlashcardsSetDTO[] = (data || []).map((item) =>
      mapFlashcardsSetToDTO(item)
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

    // Przygotowanie danych do aktualizacji
    const updateData: Partial<Record<string, unknown>> = {};
    if (command.name !== undefined) updateData.name = command.name;
    if (command.status !== undefined) updateData.status = command.status;

    // Aktualizacja zestawu
    const { data, error } = await this.supabase
      .from("flashcards_set")
      .update(updateData)
      .eq("id", setId)
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
