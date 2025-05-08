import { createClient } from "@/utils/supabase/server";
import type {
  AISuggestionDTO,
  AcceptSuggestionCommand,
  EditSuggestionCommand,
  FlashcardDTO,
} from "@/types";
import { randomUUID } from "crypto";
// @ts-ignore: openrouter client does not have type declarations
const OpenRouter = require("openrouter");
import { getSuggestion, setSuggestion, deleteSuggestion } from "@/features/services/suggestionsCache";

// Configure Openrouter client
const openrouterApiKey = process.env.OPENROUTER_API_KEY;
if (!openrouterApiKey) {
  throw new Error("Missing Openrouter API key");
}
const openRouterClient = new OpenRouter({ apiKey: openrouterApiKey });

// Cache moved to suggestionsCache module

export class FlashcardsSuggestionService {
  /**
   * Generates AI suggestions for given text and caches them in memory
   */
  static async generate(text: string): Promise<AISuggestionDTO[]> {
    // Validate input text
    if (!text) {
      throw new Error("Text is required");
    }
    // Call Openrouter AI service to generate suggestions
    // TODO: integrate actual API call using openRouterClient
    const aiResponse = await openRouterClient.generate({ text });
    // Map raw AI response to AISuggestionDTO with unique IDs
    const suggestions: AISuggestionDTO[] = aiResponse.suggestions.map((item: any) => ({
      id: randomUUID(),
      question: item.question,
      answer: item.answer,
    }));
    // Store suggestions in cache with TTL
    suggestions.forEach(setSuggestion);
    return suggestions;
  }

  /**
   * Accepts a suggestion and creates a flashcard in the database
   */
  static async accept(
    suggestionId: string,
    command: AcceptSuggestionCommand,
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
    command: EditSuggestionCommand,
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