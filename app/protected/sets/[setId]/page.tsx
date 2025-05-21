"use client";

// We create a skeleton page for displaying details of a specific flashcard set.
// It integrates API data fetching hooks, URL filters hook and renders placeholder components.

import React, { useCallback } from "react";
import { useParams } from "next/navigation";

import { useGetFlashcardSetById } from "@/features/flashcard-sets/api/useGetFlashcardSetById";
import { useGetFlashcards } from "@/features/flashcard-sets/api/useGetFlashcards";
import { useFlashcardFilters } from "@/features/flashcard-sets/hooks/useFlashcardFilters";
import { useFlashcardModal } from "@/features/flashcard-sets/hooks/useFlashcardModal";
import { useDebounce } from "@/app/hooks/use-debounce";

import { BreadcrumbNavigation } from "@/features/flashcard-sets/components/BreadcrumbNavigation";
import { SetDetailsHeader } from "@/features/flashcard-sets/components/SetDetailsHeader";
import { ActionsButtonsGroup } from "@/features/flashcard-sets/components/ActionsButtonsGroup";
import { FlashcardsListFilters } from "@/features/flashcard-sets/components/FlashcardsListFilters";
import { FlashcardsListView } from "@/features/flashcard-sets/components/FlashcardsListView";
import { PaginationControlsComponent } from "@/features/flashcard-sets/components/PaginationControlsComponent";
import OpenFlashcardModals from "@/features/flashcard-sets/components/OpenFlashcardModals";

import { Button } from "@/components/ui/button";
import type { FlashcardDTO } from "@/types";

export default function FlashcardsSetDetailsPage() {
  const params = useParams<{ setId: string }>();
  const setId = params?.setId;

  // Manage flashcard filters via URL
  const [filters, setFilters] = useFlashcardFilters();

  const { data: setData, isLoading: isSetLoading, isError: isSetError, error: setError } =
    useGetFlashcardSetById(setId);

  const debouncedSearch = useDebounce(filters.search, 800);

  const queryFilters = {
    page: filters.page,
    limit: filters.limit,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    search: debouncedSearch,
  } as const;

  const {
    data: flashcardsData,
    isLoading: isFlashcardsLoading,
    isFetching: isFlashcardsFetching,
    refetch: refetchFlashcards,
  } = useGetFlashcards(setId, queryFilters);

  // Modal controls
  const { openEdit, openDelete } = useFlashcardModal();

  // Handlers
  const handleUpdateFilters = useCallback(
    (newFilters: any) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setFilters({ page });
    },
    [setFilters]
  );

  const handleLimitChange = useCallback(
    (limit: number) => {
      setFilters({ limit, page: 1 });
    },
    [setFilters]
  );

  // Placeholder content for loading/error states
  if (isSetLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (isSetError || !setData) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive mb-4">
          Nie udało się załadować zestawu fiszek: {setError instanceof Error ? setError.message : "Unknown error"}
        </p>
        <Button onClick={() => refetchFlashcards()}>Spróbuj ponownie</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 space-y-6">
      {/* Breadcrumb */}
      <BreadcrumbNavigation setName={setData.name} />

      {/* Header with set details */}
      <SetDetailsHeader set={setData} />

      {/* Actions buttons */}
      <ActionsButtonsGroup />

      {/* Filters for flashcards */}
      <FlashcardsListFilters filters={filters} onUpdateFilters={handleUpdateFilters} isLoading={isFlashcardsLoading} />

      {/* Flashcards list */}
      <FlashcardsListView
        isLoading={isFlashcardsFetching}
        flashcards={flashcardsData?.data ?? []}
        onEdit={(card: FlashcardDTO) => openEdit(card.id)}
        onDelete={(card: FlashcardDTO) => openDelete(card.id)}
      />

      {/* Pagination */}
      {flashcardsData?.meta && flashcardsData.data.length > 0 && (
        <PaginationControlsComponent
          meta={flashcardsData.meta}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          isLoading={isFlashcardsFetching}
        />
      )}

      {/* Modals */}
      <OpenFlashcardModals />
    </div>
  );
} 