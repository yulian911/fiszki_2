import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateFlashcardsSetCommand,
  UpdateFlashcardsSetCommand,
  FlashcardsSetDTO,
  PaginatedResponse,
} from "@/types";
import {
  FLASHCARD_SETS_QUERY_KEY,
  getFlashcardSetsQueryKey,
} from "./useGetFlashcardSets";
import { toast } from "sonner";

export const useCreateFlashcardSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      command: CreateFlashcardsSetCommand
    ): Promise<FlashcardsSetDTO> => {
      const response = await fetch(`/api/flashcards-sets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(
          errorData.message ||
            errorData.error ||
            `Failed to create flashcard set (${response.status})`
        );
        (error as any).status = response.status;
        throw error;
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast.success(`Zestaw "${data.name}" został utworzony.`);
      queryClient.invalidateQueries({ queryKey: [FLASHCARD_SETS_QUERY_KEY] });
    },
    onError: (error: any) => {
      if (error.status === 409) {
        toast.error("Błąd zapisu", {
          description: "Zestaw o tej nazwie już istnieje. Wybierz inną nazwę.",
        });
      } else {
        toast.error("Wystąpił błąd", {
          description: error.message || "Nie udało się utworzyć zestawu.",
        });
      }
    },
  });
};

export const useUpdateFlashcardSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      setId,
      command,
    }: {
      setId: string;
      command: UpdateFlashcardsSetCommand;
    }): Promise<FlashcardsSetDTO> => {
      const response = await fetch(`/api/flashcards-sets/${setId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(
          errorData.message ||
            errorData.error ||
            `Failed to update flashcard set (${response.status})`
        );
        (error as any).status = response.status;
        throw error;
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast.success(`Zestaw "${data.name}" został zaktualizowany.`);
      queryClient.invalidateQueries({ queryKey: [FLASHCARD_SETS_QUERY_KEY] });
    },
    onError: (error: any) => {
      if (error.status === 409) {
        toast.error("Błąd zapisu", {
          description: "Zestaw o tej nazwie już istnieje. Wybierz inną nazwę.",
        });
      } else {
        toast.error("Wystąpił błąd", {
          description: error.message || "Nie udało się zaktualizować zestawu.",
        });
      }
    },
  });
};

export const useDeleteFlashcardSet = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (setId: string) => {
      const response = await fetch(`/api/flashcards-sets/${setId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(
          errorData.message ||
            errorData.error ||
            `Failed to delete flashcard set (${response.status})`
        );
        (error as any).status = response.status;
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Zestaw został pomyślnie usunięty.");
      queryClient.invalidateQueries({ queryKey: [FLASHCARD_SETS_QUERY_KEY] });
    },
    onError: (error: any) => {
      toast.error("Wystąpił błąd", {
        description: `Nie udało się usunąć zestawu. ${
          error.message || "Spróbuj ponownie później."
        }`,
      });
    },
  });
};
