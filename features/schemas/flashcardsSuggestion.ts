import { z } from "zod";

// Schema for generating AI suggestions
export const GenerateSuggestionsCommandSchema = z.object({
  text: z.string().min(1, "Text is required").max(10000, "Text must be at most 10000 characters"),
});

// Schema for a single AI suggestion DTO
export const AISuggestionDTOSchema = z.object({
  id: z.string().uuid(),
  question: z.string().min(1),
  answer: z.string().min(1),
});

// Schema for the response containing multiple AI suggestions
export const AISuggestionsResponseDTOSchema = z.object({
  suggestions: z.array(AISuggestionDTOSchema),
});

// Schema for accepting a suggestion
export const AcceptSuggestionCommandSchema = z.object({
  flashcardsSetId: z.string().uuid(),
});

// Schema for editing a suggestion
export const EditSuggestionCommandSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

// Schema for suggestionId path parameter
export const SuggestionIdParamSchema = z.object({
  suggestionId: z.string().uuid(),
}); 