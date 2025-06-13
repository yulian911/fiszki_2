"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { FlashcardsSetTableComponent } from "@/features/flashcard-sets/components/FlashcardsSetTableComponent";
import { EmptyStateSetsComponent } from "@/features/flashcard-sets/components/EmptyStateSetsComponent";
import { useRouter } from "next/navigation";
import { useGetFlashcardSets } from "@/features/flashcard-sets/api/useGetFlashcardSets";
import useEditModalSet from "@/features/flashcard-sets/hooks/useEditModal";
import { FilterControlsComponent } from "@/features/flashcard-sets/components/FilterControlsComponent";
import { PaginationControlsComponent } from "@/features/flashcard-sets/components/PaginationControlsComponent";
import { useDebounce } from "@/hooks/use-debounce";
import { useFlashcardSetFilters } from "@/features/flashcard-sets/hooks/useFlashcardSetFilters";
import { useCloneFlashcardSet } from "@/features/flashcard-sets/api/useCloneFlashcardSet";
import { ConfirmDeleteModalComponent } from "@/features/flashcard-sets/components/ConfirmDeleteModalComponent";
import { ShareSetModalComponent } from "@/features/flashcard-sets/components/ShareSetModalComponent";
import { FlashcardsSetDTO } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function FlashcardsSetsListViewPage() {
  const router = useRouter();

  const [filters, setFilters] = useFlashcardSetFilters();

  const debouncedNameSearch = useDebounce(filters.nameSearch, 800);

  const [setToDelete, setSetToDelete] = useState<FlashcardsSetDTO | null>(null);
  const [setToShare, setSetToShare] = useState<FlashcardsSetDTO | null>(null);

  const queryFilters = {
    page: filters.page,
    limit: filters.limit,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    status: filters.status,
    nameSearch: debouncedNameSearch,
    view: filters.view,
  };

  const {
    data: setsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetFlashcardSets(queryFilters);

  const { open: openEditModal } = useEditModalSet();
  const cloneMutation = useCloneFlashcardSet();

  const handleLearn = async (set: FlashcardsSetDTO) => {
    const toastId = toast.loading("Przygotowywanie sesji nauki...");
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flashcardsSetId: set.id,
          tags: [], // Brak tagów w szybkim starcie
          limit: 50, // Domyślny limit kart
          shuffle: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Nie udało się utworzyć sesji.");
      }

      const data = await response.json();
      const sessionId = data.sessionId;

      toast.success("Sesja gotowa! Przekierowuję...", { id: toastId });
      router.push(`/protected/sessions/${sessionId}`);
    } catch (error) {
      console.error("Błąd podczas rozpoczynania sesji:", error);
      toast.error(
        error instanceof Error ? error.message : "Wystąpił nieznany błąd.",
        { id: toastId }
      );
    }
  };

  const handleEdit = (set: FlashcardsSetDTO) => {
    if (set.accessLevel === "owner") {
      router.push(`/protected/sets/${set.id}?edit-flashcard-set=${set.id}`);
    } else {
      // Dla udostępnionych zestawów, 'Edytuj' oznacza 'Ucz się'
      router.push(`/protected/sets/${set.id}`);
    }
  };

  const handleShare = (set: FlashcardsSetDTO) => {
    setSetToShare(set);
  };

  const handleClone = (set: FlashcardsSetDTO) => {
    cloneMutation.mutate(set.id);
  };

  const handleDelete = (set: FlashcardsSetDTO) => {
    setSetToDelete(set);
  };

  const resetFilters = useCallback(() => {
    setFilters({
      nameSearch: "",
      status: "",
      page: 1,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  }, [setFilters]);

  const renderContent = useCallback(() => {
    if (isLoading && !setsData) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-center text-sm text-muted-foreground">
              Ładowanie zestawów...
            </p>
          </div>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-center py-10">
          <p className="text-destructive mb-4">
            Wystąpił błąd podczas ładowania zestawów:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Button onClick={() => refetch()}>Spróbuj ponownie</Button>
        </div>
      );
    }

    if (!setsData || setsData.data.length === 0) {
      const hasActiveFilters =
        filters.nameSearch || filters.status || filters.view !== "all";

      if (hasActiveFilters) {
        return (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">
              Nie znaleziono żadnych zestawów pasujących do podanych kryteriów.
            </p>
            <Button variant="outline" onClick={resetFilters}>
              Wyczyść filtry
            </Button>
          </div>
        );
      }

      return <EmptyStateSetsComponent onOpenCreateModal={openEditModal} />;
    }

    return (
      <div className="mt-6 relative">
        {isFetching && setsData && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        )}
        <FlashcardsSetTableComponent
          sets={setsData.data}
          onEdit={handleEdit}
          onShare={handleShare}
          onDelete={handleDelete}
          onClone={handleClone}
          onLearn={handleLearn}
        />
      </div>
    );
  }, [
    isLoading,
    isError,
    error,
    setsData,
    isFetching,
    refetch,
    openEditModal,
    filters,
    resetFilters,
  ]);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Moje Zestawy Fiszek</h1>
        <Button onClick={openEditModal} disabled={isLoading}>
          Utwórz nowy zestaw
        </Button>
      </div>

      <div className="mb-6">
        <FilterControlsComponent
          filters={filters}
          onUpdateFilters={setFilters}
          isLoading={isLoading}
        />
      </div>

      {renderContent()}

      {setsData && setsData.meta && setsData.data.length > 0 && (
        <div className="mt-4">
          <PaginationControlsComponent
            meta={setsData.meta}
            onPageChange={(page) => setFilters({ page })}
            onLimitChange={(limit) => setFilters({ limit, page: 1 })}
            isLoading={isFetching}
          />
        </div>
      )}

      {/* Modals */}
      {setToDelete && (
        <Dialog
          open={!!setToDelete}
          onOpenChange={(isOpen) => !isOpen && setSetToDelete(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Czy na pewno chcesz usunąć zestaw: {setToDelete.name}?
              </DialogTitle>
            </DialogHeader>
            <ConfirmDeleteModalComponent
              deleteFlashcardSetId={setToDelete.id}
              onCancel={() => setSetToDelete(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {setToShare && (
        <Dialog
          open={!!setToShare}
          onOpenChange={(isOpen) => !isOpen && setSetToShare(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Udostępnij zestaw: {setToShare.name}</DialogTitle>
            </DialogHeader>
            <ShareSetModalComponent onCancel={() => setSetToShare(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
