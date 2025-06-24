import { createClient } from "@/utils/supabase/server";
import type {
  AISuggestionDTO,
  AcceptSuggestionCommand,
  EditSuggestionCommand,
  FlashcardDTO,
} from "@/types";
import { randomUUID } from "crypto";
import OpenAI from "openai";
import {
  getSuggestion,
  setSuggestion,
  deleteSuggestion,
} from "@/features/ai-generator/services/suggestionsCache";

// Cache moved to suggestionsCache module

export class FlashcardsSuggestionService {
  private static getOpenAIClient(): OpenAI {
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterApiKey) {
      console.error("Missing Openrouter API key");
      throw new Error("Missing Openrouter API key");
    }
    return new OpenAI({
      apiKey: openrouterApiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });
  }

  /**
   * Generates AI suggestions for given text and caches them in memory
   */
  static async generate(text: string): Promise<AISuggestionDTO[]> {
    // Validate input text
    if (!text) {
      throw new Error("Text is required");
    }

    const openai = this.getOpenAIClient();

    try {
      // Call Openrouter AI service to generate suggestions
      const response = await openai.chat.completions.create({
        model: "google/gemini-2.5-flash-preview-05-20", // Można dostosować model według potrzeb
        messages: [
          {
            role: "system",
            content: `Przeanalizuj poniższy tekst i wygeneruj fiszki z pytaniami i odpowiedziami. Zwróć tablicę obiektów JSON w formacie: [{"question": "pytanie1", "answer": "odpowiedź1"}, {"question": "pytanie2", "answer": "odpowiedź2"}]`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      // Parse the JSON response
      const parsedContent = JSON.parse(
        response.choices[0]?.message.content || "[]"
      );

      // Validate and map to AISuggestionDTO with unique IDs
      const suggestions: AISuggestionDTO[] = Array.isArray(parsedContent)
        ? parsedContent.map((item: any) => ({
            id: randomUUID(),
            question: item.question,
            answer: item.answer,
          }))
        : [];

      // Store suggestions in cache with TTL
      suggestions.forEach(setSuggestion);
      return suggestions;
    } catch (error) {
      console.error("Failed to generate or parse AI response:", error);
      // Let's rethrow or handle it as an empty array for now
      // For debugging, it's better to see the actual error in the API response.
      if (error instanceof Error) {
        throw new Error(`AI service failed: ${error.message}`);
      }
      throw new Error("AI service failed with an unknown error.");
    }
  }

  /**
   * Accepts a suggestion and creates a flashcard in the database
   */
  static async accept(
    suggestionId: string,
    command: AcceptSuggestionCommand
  ): Promise<FlashcardDTO> {
    const suggestion = getSuggestion(suggestionId);
    if (!suggestion) {
      throw new Error("Suggestion not found");
    }
    const supabase = await createClient();
    const { data: flashcard, error } = await supabase
      .rpc("create_flashcard_and_update_tsv", {
        p_flashcards_set_id: command.flashcardsSetId,
        p_question: suggestion.question,
        p_answer: suggestion.answer,
        p_source: "ai-full",
      })
      .select("*")
      .single();
    if (error || !flashcard) {
      throw new Error(error?.message ?? "Failed to create flashcard");
    }
    // Clear suggestion from cache
    deleteSuggestion(suggestionId);
    // Return assembled FlashcardDTO
    return {
      id: flashcard.id,
      flashcardsSetId: flashcard.flashcards_set_id,
      question: flashcard.question,
      answer: flashcard.answer,
      source: flashcard.source,
      createdAt: flashcard.created_at,
      updatedAt: flashcard.updated_at,
      tags: [],
    };
  }

  /**
   * Rejects a suggestion and removes it from cache
   */
  static async reject(suggestionId: string): Promise<void> {
    const suggestion = getSuggestion(suggestionId);
    if (!suggestion) {
      throw new Error("Suggestion not found");
    }
    deleteSuggestion(suggestionId);
  }

  /**
   * Edits a suggestion in the cache
   */
  static async edit(
    suggestionId: string,
    command: EditSuggestionCommand
  ): Promise<AISuggestionDTO> {
    const suggestion = getSuggestion(suggestionId);
    if (!suggestion) {
      throw new Error("Suggestion not found");
    }
    const updated: AISuggestionDTO = {
      ...suggestion,
      question: command.question,
      answer: command.answer,
    };
    setSuggestion(updated);
    return updated;
  }
}
