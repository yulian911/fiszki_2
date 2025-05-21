import { useMutation } from "@tanstack/react-query";
import type { AISuggestionsResponseDTO, GenerateSuggestionsCommand } from "@/types";

export const useGenerateFlashcardsSuggestions = () => {
  return useMutation<AISuggestionsResponseDTO, Error, GenerateSuggestionsCommand>({
    mutationFn: async (command: GenerateSuggestionsCommand) => {
      const response = await fetch(`/api/flashcards-suggestions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to generate suggestions (${response.status})`);
      }

      return (await response.json()) as AISuggestionsResponseDTO;
    },
  });
}; 