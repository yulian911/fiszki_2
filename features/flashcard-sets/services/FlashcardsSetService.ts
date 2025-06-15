import {
  FlashcardsSetDTO,
  FlashcardsSetWithCardsDTO,
  CreateFlashcardsSetCommand,
  UpdateFlashcardsSetCommand,
  PaginatedResponse,
  FlashcardsSetStatus,
  CloneFlashcardsSetCommand,
  CreateShareCommand,
  ShareDTO,
} from "../../../types";
import type { SupabaseClient } from "@supabase/supabase-js";

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
    flashcardCount: item.flashcard_count ?? 0,
    accessLevel: item.access_level,
    ownerEmail: item.owner_email,
  };
}

// Nowa funkcja do sprawdzania, czy bieżący użytkownik jest administratorem
export const isCurrentUserAdmin = async (
  supabase: SupabaseClient
): Promise<boolean> => {
  const { data, error } = await supabase.rpc("is_admin");
  if (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
  return data === true;
};

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
    nameSearch?: string,
    view: "all" | "owned" | "shared" = "all"
  ): Promise<PaginatedResponse<FlashcardsSetDTO>> {
    const { data, error } = await this.supabase.rpc(
      "get_flashcard_sets_for_user",
      {
        p_user_id: userId,
        p_page: page,
        p_limit: limit,
        p_sort_by: sortBy,
        p_sort_order: sortOrder,
        p_status: status || null,
        p_name_search: nameSearch || null,
        p_view: view,
      }
    );

    if (error) {
      console.error(
        "Błąd podczas wywołania RPC get_flashcard_sets_for_user:",
        error
      );
      throw new Error(
        `Błąd podczas pobierania listy zestawów: ${error.message}`
      );
    }

    const totalCount = data && data.length > 0 ? data[0].total_count : 0;
    const flashcardsSets: FlashcardsSetDTO[] = (data || []).map(
      mapFlashcardsSetToDTO
    );

    return {
      data: flashcardsSets,
      meta: {
        page,
        limit,
        total: totalCount,
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
    command: UpdateFlashcardsSetCommand,
    isAdmin: boolean = false
  ): Promise<FlashcardsSetDTO> {
    // Sprawdzenie uprawnień
    let checkQuery = this.supabase
      .from("flashcards_set")
      .select("status")
      .eq("id", setId);

    if (!isAdmin) {
      checkQuery = checkQuery.eq("owner_id", userId);
    }

    const { data: existingSet, error: checkError } = await checkQuery.single();

    if (checkError) {
      throw new Error(
        `Zestaw nie istnieje lub brak uprawnień: ${checkError.message}`
      );
    }

    const finalUpdates = {
      ...command,
      updated_at: new Date().toISOString(),
    };

    let updateQuery = this.supabase
      .from("flashcards_set")
      .update(finalUpdates)
      .eq("id", setId);

    if (!isAdmin) {
      updateQuery = updateQuery.eq("owner_id", userId);
    }

    const { data, error } = await updateQuery.select().single();

    if (error) {
      throw new Error(`Błąd podczas aktualizacji zestawu: ${error.message}`);
    }

    return mapFlashcardsSetToDTO(data);
  }

  /**
   * Usuwa zestaw i wszystkie powiązane fiszki
   */
  async delete(userId: string, setId: string): Promise<void> {
    // 1. Sprawdź, czy zestaw istnieje i należy do użytkownika
    const { data: existingSet, error: checkError } = await this.supabase
      .from("flashcards_set")
      .select("id, status")
      .eq("id", setId)
      .eq("owner_id", userId)
      .single();

    if (checkError) {
      throw new Error(
        `Zestaw nie istnieje lub nie masz do niego dostępu: ${checkError.message}`
      );
    }

    // 2. Usuń powiązane udostępnienia
    const { error: deleteSharesError } = await this.supabase
      .from("flashcards_set_shares")
      .delete()
      .eq("flashcards_set_id", setId);

    if (deleteSharesError) {
      throw new Error(
        `Błąd podczas usuwania udostępnień: ${deleteSharesError.message}`
      );
    }

    // 3. Usuń powiązane sesje nauki
    const { error: deleteSessionsError } = await this.supabase
      .from("sessions")
      .delete()
      .eq("flashcards_set_id", setId);

    if (deleteSessionsError) {
      throw new Error(
        `Błąd podczas usuwania sesji nauki: ${deleteSessionsError.message}`
      );
    }

    // 4. Pobierz ID wszystkich fiszek w zestawie
    const { data: flashcards, error: getFlashcardsError } = await this.supabase
      .from("flashcards")
      .select("id")
      .eq("flashcards_set_id", setId);

    if (getFlashcardsError) {
      throw new Error(
        `Błąd podczas pobierania fiszek do usunięcia: ${getFlashcardsError.message}`
      );
    }

    const flashcardIds = flashcards.map((f) => f.id);

    // 5. Usuń powiązania tagów dla tych fiszek
    if (flashcardIds.length > 0) {
      const { error: deleteTagsError } = await this.supabase
        .from("flashcards_tags")
        .delete()
        .in("flashcard_id", flashcardIds);

      if (deleteTagsError) {
        throw new Error(
          `Błąd podczas usuwania powiązań tagów: ${deleteTagsError.message}`
        );
      }
    }

    // 6. Usuń same fiszki
    const { error: deleteFlashcardsError } = await this.supabase
      .from("flashcards")
      .delete()
      .eq("flashcards_set_id", setId);

    if (deleteFlashcardsError) {
      throw new Error(
        `Błąd podczas usuwania fiszek z zestawu: ${deleteFlashcardsError.message}`
      );
    }

    // 7. Na koniec usuń sam zestaw
    const { error: deleteSetError } = await this.supabase
      .from("flashcards_set")
      .delete()
      .eq("id", setId);

    if (deleteSetError) {
      throw new Error(
        `Błąd podczas usuwania zestawu: ${deleteSetError.message}`
      );
    }
  }

  /**
   * Klonuje istniejący zestaw fiszek
   * Możliwe jest sklonowanie dla siebie lub dla innego użytkownika (jeśli mamy uprawnienia)
   */
  async clone(
    userId: string,
    setId: string,
    command: CloneFlashcardsSetCommand
  ): Promise<FlashcardsSetDTO> {
    const { data: userData, error: userError } =
      await this.supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error(`Brak uwierzytelnienia: ${userError?.message}`);
    }

    const { data, error } = await this.supabase
      .rpc("clone_flashcards_set", {
        set_id_to_clone: setId,
        new_owner_id: command.targetUserId || userData.user.id,
      })
      .single();

    if (error) {
      throw new Error(
        `Błąd podczas klonowania zestawu fiszek: ${error.message}`
      );
    }
    if (!data) {
      throw new Error("Klonowanie zestawu fiszek nie zwróciło żadnych danych.");
    }

    return mapFlashcardsSetToDTO(data);
  }

  /**
   * Udostępnia zestaw fiszek innemu użytkownikowi.
   */
  async share(
    ownerId: string,
    setId: string,
    command: CreateShareCommand
  ): Promise<ShareDTO> {
    // 1. Sprawdź, czy zestaw należy do użytkownika i ma status 'accepted'
    const { data: set, error: setError } = await this.supabase
      .from("flashcards_set")
      .select("status")
      .eq("id", setId)
      .eq("owner_id", ownerId)
      .single();

    if (setError || !set) {
      throw new Error("Zestaw nie znaleziony lub brak uprawnień.");
    }
    if (set.status !== "accepted") {
      throw new Error("Udostępniać można tylko zaakceptowane zestawy.");
    }

    // 2. Utwórz wpis w tabeli 'flashcards_set_shares'
    const { data: share, error: shareError } = await this.supabase
      .from("flashcards_set_shares")
      .insert({
        flashcards_set_id: setId,
        user_id: command.userId,
        role: command.role,
        expires_at: command.expiresAt,
      })
      .select()
      .single();

    if (shareError) {
      throw new Error(
        `Błąd podczas udostępniania zestawu: ${shareError.message}`
      );
    }

    return {
      id: share.id,
      setId: share.flashcards_set_id,
      userId: share.user_id,
      role: share.role,
      createdAt: share.created_at,
      expiresAt: share.expires_at,
    };
  }

  /**
   * Pobiera listę udostępnień dla danego zestawu.
   */
  async listShares(ownerId: string, setId: string): Promise<ShareDTO[]> {
    // 1. Sprawdź, czy użytkownik jest właścicielem zestawu
    const { count, error: checkError } = await this.supabase
      .from("flashcards_set")
      .select("id", { count: "exact" })
      .eq("id", setId)
      .eq("owner_id", ownerId);

    if (checkError || count === 0) {
      throw new Error("Zestaw nie znaleziony lub brak uprawnień.");
    }

    // 2. Pobierz udostępnienia
    const { data, error } = await this.supabase
      .from("flashcards_set_shares")
      .select("*")
      .eq("flashcards_set_id", setId);

    if (error) {
      throw new Error(`Błąd podczas pobierania udostępnień: ${error.message}`);
    }

    return (data || []).map((share) => ({
      id: share.id,
      setId: share.flashcards_set_id,
      userId: share.user_id,
      role: share.role,
      createdAt: share.created_at,
      expiresAt: share.expires_at,
    }));
  }

  /**
   * Anuluje udostępnienie zestawu fiszek
   */
  async revokeShare(
    ownerId: string,
    setId: string,
    shareId: string
  ): Promise<void> {
    // 1. Sprawdź, czy użytkownik jest właścicielem zestawu
    const { count, error: checkError } = await this.supabase
      .from("flashcards_set")
      .select("id", { count: "exact" })
      .eq("id", setId)
      .eq("owner_id", ownerId);

    if (checkError || count === 0) {
      throw new Error("Zestaw nie znaleziony lub brak uprawnień.");
    }

    // 2. Usuń udostępnienie
    const { error } = await this.supabase
      .from("flashcards_set_shares")
      .delete()
      .eq("id", shareId)
      .eq("flashcards_set_id", setId);

    if (error) {
      throw new Error(
        `Błąd podczas anulowania udostępnienia: ${error.message}`
      );
    }
  }

  async isNameUnique(
    userId: string,
    name: string,
    setIdToExclude?: string
  ): Promise<{ isUnique: boolean }> {
    const { data, error } = await this.supabase.rpc(
      "is_flashcard_set_name_unique",
      {
        p_user_id: userId,
        p_name: name,
        p_set_id_to_exclude: setIdToExclude || null,
      }
    );

    if (error) {
      console.error("Error checking set name uniqueness:", error);
      throw new Error("Could not verify set name uniqueness.");
    }

    return { isUnique: data };
  }
}

// =================================================================================
// Funkcje hooków - uproszczone wywołania dla komponentów React
// =================================================================================

import { createClient } from "@/utils/supabase/client";

const getUserIdOrThrow = async (): Promise<string> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Użytkownik nie jest uwierzytelniony.");
  }
  return user.id;
};

const flashcardsSetService = new FlashcardsSetService(createClient());

export const listFlashcardSets = (
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: string,
  status?: FlashcardsSetStatus,
  nameSearch?: string,
  view?: "all" | "owned" | "shared"
) => {
  return getUserIdOrThrow().then((userId) =>
    flashcardsSetService.list(
      userId,
      page,
      limit,
      sortBy,
      sortOrder,
      status,
      nameSearch,
      view
    )
  );
};

export const createFlashcardsSet = (command: CreateFlashcardsSetCommand) => {
  return getUserIdOrThrow().then((userId) =>
    flashcardsSetService.create(userId, command)
  );
};

export const getFlashcardsSetById = (setId: string) => {
  return getUserIdOrThrow().then((userId) =>
    flashcardsSetService.getById(userId, setId)
  );
};

export const updateFlashcardsSet = (
  setId: string,
  command: UpdateFlashcardsSetCommand
) => {
  return getUserIdOrThrow().then(async (userId) => {
    const isAdmin = await isCurrentUserAdmin(createClient());
    return flashcardsSetService.update(userId, setId, command, isAdmin);
  });
};

export const deleteFlashcardsSet = (setId: string) => {
  return getUserIdOrThrow().then((userId) =>
    flashcardsSetService.delete(userId, setId)
  );
};

export const cloneFlashcardsSet = (
  setId: string,
  command: CloneFlashcardsSetCommand = {}
) => {
  return getUserIdOrThrow().then((userId) =>
    flashcardsSetService.clone(userId, setId, command)
  );
};

export const checkSetNameUnique = (name: string, setIdToExclude?: string) => {
  return getUserIdOrThrow().then((userId) =>
    flashcardsSetService.isNameUnique(userId, name, setIdToExclude)
  );
};
