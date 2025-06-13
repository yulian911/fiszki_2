import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ShareDTO, CreateShareCommand } from "@/types";

const COLLABORATORS_QUERY_KEY = "set-collaborators" as const;

export const useGetCollaborators = (setId?: string) => {
  return useQuery<ShareDTO[]>({
    queryKey: [COLLABORATORS_QUERY_KEY, setId],
    enabled: !!setId,
    queryFn: async () => {
      const response = await fetch(`/api/flashcards-sets/${setId}/shares`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch collaborators (${response.status})`);
      }
      return (await response.json()) as ShareDTO[];
    },
  });
};

export const useInviteCollaborator = (setId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ShareDTO, Error, CreateShareCommand>({
    mutationFn: async (command) => {
      const response = await fetch(`/api/flashcards-sets/${setId}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to invite collaborator (${response.status})`);
      }
      return (await response.json()) as ShareDTO;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COLLABORATORS_QUERY_KEY, setId] });
    },
  });
};

export const useRevokeShare = (setId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (shareId) => {
      const response = await fetch(`/api/flashcards-sets/${setId}/shares/${shareId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to revoke share (${response.status})`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COLLABORATORS_QUERY_KEY, setId] });
    },
  });
}; 