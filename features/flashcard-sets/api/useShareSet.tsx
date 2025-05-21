import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SetCollaboratorDTO, InviteCollaboratorCommand } from "@/types";

const COLLABORATORS_QUERY_KEY = "set-collaborators" as const;

export const useGetCollaborators = (setId?: string) => {
  return useQuery<SetCollaboratorDTO[]>({
    queryKey: [COLLABORATORS_QUERY_KEY, setId],
    enabled: !!setId,
    queryFn: async () => {
      const response = await fetch(`/api/flashcards-sets/${setId}/collaborators`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch collaborators (${response.status})`);
      }
      return (await response.json()) as SetCollaboratorDTO[];
    },
  });
};

export const useInviteCollaborator = (setId: string) => {
  const queryClient = useQueryClient();
  return useMutation<SetCollaboratorDTO, Error, InviteCollaboratorCommand>({
    mutationFn: async (command) => {
      const response = await fetch(`/api/flashcards-sets/${setId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to invite collaborator (${response.status})`);
      }
      return (await response.json()) as SetCollaboratorDTO;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COLLABORATORS_QUERY_KEY, setId] });
    },
  });
}; 