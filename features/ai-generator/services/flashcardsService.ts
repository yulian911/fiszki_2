import { createClient } from "@/utils/supabase/server";
import type {
  FlashcardSource,
  CreateFlashcardCommand,
  UpdateFlashcardCommand,
  FlashcardDTO,
  CreateBulkFlashcardsCommand,
} from "@/types";

export interface ListParams {
  setId?: string;
  source?: FlashcardSource;
  tags?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "question";
}

export class FlashcardsService {
  /**
   * Lists flashcards with optional filtering, sorting, and pagination.
   */
  static async list(
    params: ListParams
  ): Promise<{ data: any[]; total: number }> {
    const supabase = await createClient();
    let query = supabase.from("flashcards").select("*", { count: "exact" });

    if (params.setId) {
      query = query.eq("flashcards_set_id", params.setId);
    }
    if (params.source) {
      query = query.eq("source", params.source);
    }

    if (params.tags) {
      const tagNames = params.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tagNames.length > 0) {
        // Retrieve tag IDs
        const { data: tagRows, error: tagError } = await supabase
          .from("tags")
          .select("id")
          .in("name", tagNames);
        if (tagError) {
          throw new Error(tagError.message);
        }
        const tagIds = tagRows?.map((t) => t.id) ?? [];
        if (tagIds.length === 0) {
          return { data: [], total: 0 };
        }
        // Find flashcard IDs that have any of the specified tags
        const { data: linkRows, error: linkError } = await supabase
          .from("flashcards_tags")
          .select("flashcard_id")
          .in("tag_id", tagIds);
        if (linkError) {
          throw new Error(linkError.message);
        }
        const flashcardIds = Array.from(
          new Set(linkRows.map((link) => link.flashcard_id))
        );
        if (flashcardIds.length === 0) {
          return { data: [], total: 0 };
        }
        query = query.in("id", flashcardIds);
      }
    }

    if (params.sortBy) {
      query = query.order(
        params.sortBy === "createdAt" ? "created_at" : "question",
        { ascending: true }
      );
    }

    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const from = (page - 1) * limit;
    const to = page * limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      throw new Error(error.message);
    }
    return {
      data: data ?? [],
      total: count ?? 0,
    };
  }

  /**
   * Creates multiple flashcards in bulk.
   */
  static async createBulk(
    command: CreateBulkFlashcardsCommand
  ): Promise<FlashcardDTO[]> {
    const { flashcardsSetId, flashcards } = command;
    const supabase = await createClient();

    const flashcardsToInsert = flashcards.map((fc) => ({
      flashcards_set_id: flashcardsSetId,
      question: fc.question,
      answer: fc.answer,
      source: "ai-full",
    }));

    const { data, error } = await supabase
      .from("flashcards")
      .insert(flashcardsToInsert)
      .select();

    if (error) {
      throw new Error(error.message || "Failed to create flashcards in bulk");
    }

    return (data || []).map((f) => ({
      id: f.id,
      flashcardsSetId: f.flashcards_set_id,
      question: f.question,
      answer: f.answer,
      source: f.source,
      createdAt: f.created_at,
      updatedAt: f.updated_at,
      tags: [], // Tags are not handled in bulk creation for now
    }));
  }

  /**
   * Creates a new flashcard, upserts tags, and returns full DTO.
   */
  static async create(command: CreateFlashcardCommand): Promise<FlashcardDTO> {
    const { flashcardsSetId, question, answer, source, tags } = command;
    const supabase = await createClient();

    // Insert flashcard record
    const { data: flashcard, error: flashcardError } = await supabase
      .from("flashcards")
      .insert({ flashcards_set_id: flashcardsSetId, question, answer, source })
      .select("*")
      .single();
    if (flashcardError || !flashcard) {
      throw new Error(flashcardError?.message ?? "Failed to create flashcard");
    }

    // Upsert tags
    const uniqueNames = Array.from(new Set(tags));
    const { data: upsertedTags, error: upsertError } = await supabase
      .from("tags")
      .upsert(
        uniqueNames.map((name) => ({ name })),
        { onConflict: "name" }
      )
      .select("*");
    if (upsertError || !upsertedTags) {
      throw new Error(upsertError?.message ?? "Failed to upsert tags");
    }

    // Link tags to flashcard
    const { error: relError } = await supabase.from("flashcards_tags").insert(
      upsertedTags.map((t) => ({
        flashcard_id: flashcard.id,
        tag_id: t.id,
      }))
    );
    if (relError) {
      throw new Error(relError.message);
    }

    // Fetch tags
    const { data: tagRecords, error: tagFetchError } = await supabase
      .from("tags")
      .select("*")
      .in(
        "id",
        upsertedTags.map((t) => t.id)
      );
    if (tagFetchError || !tagRecords) {
      throw new Error(tagFetchError?.message ?? "Failed to fetch tags");
    }

    // Assemble and return DTO
    return {
      id: flashcard.id,
      flashcardsSetId: flashcard.flashcards_set_id,
      question: flashcard.question,
      answer: flashcard.answer,
      source: flashcard.source,
      createdAt: flashcard.created_at,
      updatedAt: flashcard.updated_at,
      tags: tagRecords.map((t) => ({
        id: t.id,
        name: t.name,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      })),
    };
  }

  /**
   * Retrieves a single flashcard by id, including its tags.
   */
  static async getById(id: string): Promise<FlashcardDTO> {
    const supabase = await createClient();

    // Fetch flashcard
    const { data: flashcard, error: flashcardError } = await supabase
      .from("flashcards")
      .select("*")
      .eq("id", id)
      .single();
    if (flashcardError || !flashcard) {
      throw new Error("Flashcard not found");
    }

    // Fetch related tags via flashcards_tags join
    const { data: tagLinks, error: tagLinkError } = await supabase
      .from("flashcards_tags")
      .select("tags(id, name, created_at, updated_at)")
      .eq("flashcard_id", id);
    if (tagLinkError) {
      throw new Error(tagLinkError.message);
    }

    const tags =
      tagLinks?.map((link: any) => ({
        id: link.tags.id,
        name: link.tags.name,
        createdAt: link.tags.created_at,
        updatedAt: link.tags.updated_at,
      })) || [];

    return {
      id: flashcard.id,
      flashcardsSetId: flashcard.flashcards_set_id,
      question: flashcard.question,
      answer: flashcard.answer,
      source: flashcard.source,
      createdAt: flashcard.created_at,
      updatedAt: flashcard.updated_at,
      tags,
    };
  }

  /**
   * Updates a flashcard and its tags, returning the updated DTO.
   */
  static async update(
    id: string,
    command: UpdateFlashcardCommand
  ): Promise<FlashcardDTO> {
    const { question, answer, tags } = command;
    const supabase = await createClient();

    // Prepare update fields
    const updates: Record<string, any> = {};
    if (question !== undefined) updates.question = question;
    if (answer !== undefined) updates.answer = answer;

    // Apply updates to flashcard
    const { data: flashcard, error: updateError } = await supabase
      .from("flashcards")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();
    if (updateError || !flashcard) {
      throw new Error(updateError?.message ?? "Failed to update flashcard");
    }

    // If tags provided, replace tag relations
    if (tags) {
      const uniqueNames = Array.from(new Set(tags));
      const { data: upsertedTags, error: upsertError } = await supabase
        .from("tags")
        .upsert(
          uniqueNames.map((name) => ({ name })),
          { onConflict: "name" }
        )
        .select("*");
      if (upsertError || !upsertedTags) {
        throw new Error(upsertError?.message ?? "Failed to upsert tags");
      }

      // Clear existing tag relations
      const { error: deleteError } = await supabase
        .from("flashcards_tags")
        .delete()
        .eq("flashcard_id", id);
      if (deleteError) {
        throw new Error(deleteError.message);
      }

      // Insert new tag relations
      const { error: relError } = await supabase
        .from("flashcards_tags")
        .insert(upsertedTags.map((t) => ({ flashcard_id: id, tag_id: t.id })));
      if (relError) {
        throw new Error(relError.message);
      }
    }

    // Fetch related tags
    const { data: tagLinks, error: tagLinkError } = await supabase
      .from("flashcards_tags")
      .select("tags(id, name, created_at, updated_at)")
      .eq("flashcard_id", id);
    if (tagLinkError) {
      throw new Error(tagLinkError.message);
    }

    const tagsDTO = tagLinks.map((link: any) => ({
      id: link.tags.id,
      name: link.tags.name,
      createdAt: link.tags.created_at,
      updatedAt: link.tags.updated_at,
    }));

    // Assemble and return DTO
    return {
      id: flashcard.id,
      flashcardsSetId: flashcard.flashcards_set_id,
      question: flashcard.question,
      answer: flashcard.answer,
      source: flashcard.source,
      createdAt: flashcard.created_at,
      updatedAt: flashcard.updated_at,
      tags: tagsDTO,
    };
  }

  /**
   * Deletes a flashcard by ID.
   */
  static async delete(id: string): Promise<void> {
    const supabase = await createClient();

    // The database is configured with ON DELETE CASCADE for the flashcards_tags table,
    // so manual deletion of associations is not necessary.
    const { data, error } = await supabase
      .from("flashcards")
      .delete()
      .eq("id", id)
      .select("*"); // select to check if a row was actually deleted

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      // This error is typically thrown when RLS policy prevents the deletion,
      // making it seem as if the flashcard was not found.
      throw new Error("Flashcard not found");
    }
  }
}
