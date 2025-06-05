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

    // Call Openrouter AI service to generate suggestions
    const response = await openai.completions.create({
      model: "openai/gpt-3.5-turbo", // Można dostosować model według potrzeb
      prompt: `Przeanalizuj poniższy tekst i wygeneruj fiszki z pytaniami i odpowiedziami:
      
      ${text}
      
      Zwróć tablicę obiektów JSON w formacie:
      [{"question": "pytanie1", "answer": "odpowiedź1"}, {"question": "pytanie2", "answer": "odpowiedź2"}]`,
      max_tokens: 2000,
      temperature: 0.7,
    });

    try {
      // Parse the JSON response
      const parsedContent = JSON.parse(response.choices[0]?.text || "[]");

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
      console.error("Failed to parse AI response:", error);
      return [];
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
      .from("flashcards")
      .insert({
        flashcards_set_id: command.flashcardsSetId,
        question: suggestion.question,
        answer: suggestion.answer,
        source: "ai-full",
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
