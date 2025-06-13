import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useGetCollaborators,
  useInviteCollaborator,
  useRevokeShare,
} from "@/features/flashcard-sets/api/useShareSet";
import { useCloneForUser } from "@/features/flashcard-sets/api/useCloneFlashcardSet";
import { useParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { XCircle } from "lucide-react";

type FoundUser = {
  id: string;
  email: string;
};

type Role = "viewer" | "editor";

export const ShareSetModalComponent: React.FC<{ onCancel: () => void }> = ({
  onCancel,
}) => {
  const params = useParams<{ setId: string }>();
  const setId = params?.setId ?? "";

  const { data: collaborators = [], isLoading: isLoadingCollaborators } =
    useGetCollaborators(setId);
  const { mutate: invite, isPending: isInviting } =
    useInviteCollaborator(setId);
  const { mutate: revoke, isPending: isRevoking } = useRevokeShare(setId);
  const { mutate: cloneForUser, isPending: isCloning } = useCloneForUser();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("viewer");
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const debouncedEmail = useDebounce(email, 500);

  useEffect(() => {
    const searchUser = async () => {
      if (!debouncedEmail || !debouncedEmail.includes("@")) {
        setFoundUser(null);
        setSearchError(null);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setFoundUser(null);
      setSearchError(null);

      try {
        const response = await fetch(
          `/api/users/find-by-email?email=${encodeURIComponent(debouncedEmail)}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Nie znaleziono użytkownika");
        }

        setFoundUser(data);
      } catch (error: any) {
        setFoundUser(null);
        setSearchError(error.message);
      } finally {
        setIsSearching(false);
      }
    };

    searchUser();
  }, [debouncedEmail]);

  const handleAction = () => {
    if (!foundUser) return;

    if (role === "viewer") {
      // Logika udostępniania (share)
      invite(
        { userId: foundUser.id, role: "learning" },
        {
          onSuccess: () => {
            toast.success(`Zestaw udostępniony dla ${foundUser.email}`);
            setEmail("");
            setFoundUser(null);
          },
          onError: (e) => toast.error(`Błąd: ${e.message}`),
        }
      );
    } else if (role === "editor") {
      // Logika wysyłania kopii (clone)
      cloneForUser(
        {
          setId,
          command: { targetUserId: foundUser.id },
        },
        {
          onSuccess: () => {
            toast.success(
              `Kopia zestawu została wysłana do ${foundUser.email}`
            );
            setEmail("");
            setFoundUser(null);
          },
          onError: (e) => toast.error(`Błąd: ${e.message}`),
        }
      );
    }
  };

  const handleRevoke = (shareId: string) => {
    revoke(shareId, {
      onSuccess: () => toast.success("Anulowano udostępnienie"),
      onError: (e) => toast.error(`Błąd: ${e.message}`),
    });
  };

  const isActionPending = isInviting || isRevoking || isCloning;
  const isButtonDisabled =
    isActionPending ||
    !foundUser ||
    (role === "viewer" &&
      !!collaborators.find((c) => c.userId === foundUser?.id));
  const buttonText = role === "viewer" ? "Udostępnij" : "Wyślij Kopię";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="w-full">
          <Input
            placeholder="Wpisz email, aby znaleźć użytkownika..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isActionPending}
          />
          <div className="text-xs text-muted-foreground h-4 mt-1">
            {isSearching && <p>Szukam...</p>}
            {searchError && <p className="text-red-500">{searchError}</p>}
            {foundUser && (
              <p className="text-green-600">Znaleziono: {foundUser.email}</p>
            )}
            {foundUser &&
              role === "viewer" &&
              collaborators.find((c) => c.userId === foundUser.id) && (
                <p className="text-yellow-600">Ten użytkownik ma już dostęp.</p>
              )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <select
            className="border rounded-md px-2 py-2 text-sm h-10 bg-background"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            disabled={isActionPending}
          >
            <option value="viewer">Podgląd</option>
            <option value="editor">Edycja (Wyślij kopię)</option>
          </select>

          <Button
            onClick={handleAction}
            disabled={isButtonDisabled}
            className="w-32"
          >
            {isActionPending ? "Przetwarzanie..." : buttonText}
          </Button>
        </div>
      </div>

      <p className="text-sm font-medium pt-4 border-t">
        Udostępniono w trybie "Podgląd":
      </p>
      <ScrollArea className="h-48 pr-2 border rounded-md">
        {isLoadingCollaborators ? (
          <p className="p-2">Ładowanie...</p>
        ) : (
          collaborators.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between px-2 py-1 border-b text-sm hover:bg-muted/50"
            >
              <span className="truncate" title={c.userId}>
                {c.userId}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{c.role}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRevoke(c.id)}
                  disabled={isRevoking}
                >
                  <XCircle className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                </Button>
              </div>
            </div>
          ))
        )}
        {collaborators.length === 0 && !isLoadingCollaborators && (
          <p className="p-2 text-muted-foreground">
            Zestaw nie jest nikomu udostępniony.
          </p>
        )}
      </ScrollArea>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isActionPending}>
          Zamknij
        </Button>
      </div>
    </div>
  );
};
