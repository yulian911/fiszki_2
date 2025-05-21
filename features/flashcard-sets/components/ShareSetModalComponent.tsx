import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetCollaborators, useInviteCollaborator } from "@/features/flashcard-sets/api/useShareSet";
import { useParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const ShareSetModalComponent: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
  const params = useParams<{ setId: string }>();
  const setId = params?.setId ?? "";
  const { data: collaborators = [], isLoading } = useGetCollaborators(setId);
  const { mutate: invite, isPending } = useInviteCollaborator(setId);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");

  const handleInvite = () => {
    invite(
      { setId, email, role },
      {
        onSuccess: () => {
          toast.success("Zaproszenie wysłane");
          setEmail("");
        },
        onError: (e) => toast.error(`Błąd: ${e.message}`),
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-end">
        <Input
          placeholder="Email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
        />
        <select
          className="border rounded-md px-2 py-1 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          disabled={isPending}
        >
          <option value="viewer">Podgląd</option>
          <option value="editor">Edycja</option>
        </select>
        <Button onClick={handleInvite} disabled={isPending || !email.trim()}>
          Zaproś
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          Zamknij
        </Button>
      </div>
      <ScrollArea className="h-64 pr-2 border rounded-md">
        {isLoading ? (
          <p className="p-2">Ładowanie...</p>
        ) : (
          collaborators.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-2 py-1 border-b text-sm">
              <span>{c.email}</span>
              <Badge>{c.role}</Badge>
            </div>
          ))
        )}
        {collaborators.length === 0 && !isLoading && (
          <p className="p-2 text-muted-foreground">Brak współpracowników</p>
        )}
      </ScrollArea>
    </div>
  );
}; 