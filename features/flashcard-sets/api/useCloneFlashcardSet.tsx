import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cloneFlashcardsSet } from "../services/FlashcardsSetService";
import { FlashcardsSetDTO, CloneFlashcardsSetCommand } from "@/types";

export const useCloneFlashcardSet = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (setId: string) => cloneFlashcardsSet(setId),
    onSuccess: (data: FlashcardsSetDTO) => {
      queryClient.invalidateQueries({ queryKey: ["flashcard-sets"] });
      toast.success("Zestaw został pomyślnie sklonowany.");
      router.push(`/protected/sets/${data.id}?edit-flashcard-set=${data.id}`);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Wystąpił błąd podczas klonowania zestawu."
      );
    },
  });
};

export const useCloneForUser = () => {
  return useMutation({
    mutationFn: ({ setId, command }: { setId: string, command: CloneFlashcardsSetCommand }) => 
      cloneFlashcardsSet(setId, command),
    onSuccess: () => {
      toast.success("Kopia zestawu została wysłana pomyślnie.");
    },
    onError: (error: any) => {
      toast.error(
        error?.message ||
          "Wystąpił błąd podczas wysyłania kopii zestawu."
      );
    },
  });
}; 