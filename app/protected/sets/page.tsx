"use client";

import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FlashcardsSetTableComponent } from "@/features/flashcard-sets/components/FlashcardsSetTableComponent";
import { EmptyStateSetsComponent } from "@/features/flashcard-sets/components/EmptyStateSetsComponent";
import { useRouter } from "next/navigation";
import { useGetFlashcardSets } from "@/features/flashcard-sets/api/useGetFlashcardSets";
import useEditModalSet from "@/features/flashcard-sets/hooks/useEditModal";
import { FilterControlsComponent } from "@/features/flashcard-sets/components/FilterControlsComponent";
import { PaginationControlsComponent } from "@/features/flashcard-sets/components/PaginationControlsComponent";
import { useDebounce } from "@/app/hooks/use-debounce";
import { useFlashcardSetFilters } from "@/features/flashcard-sets/hooks/useFlashcardSetFilters";

export default function FlashcardsSetsListViewPage() {
  const router = useRouter();

  // Używamy hooka do zarządzania filtrami w URL
  const [filters, setFilters] = useFlashcardSetFilters();

  // Zastosuj debounce dla wyszukiwania, aby nie wykonywać zbyt wielu zapytań
  const debouncedNameSearch = useDebounce(filters.nameSearch, 800);

  // Przygotuj filtry do zapytania
  const queryFilters = {
    page: filters.page,
    limit: filters.limit,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    status: filters.status,
    nameSearch: debouncedNameSearch,
  };

  // Use React Query for data fetching
  const {
    data: setsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetFlashcardSets(queryFilters);

  // Get modal controls
  const { open } = useEditModalSet();

  // Handle navigation to set details
  const handleViewDetails = useCallback(
    (setId: string) => {
      router.push(`/protected/sets/${setId}`);
    },
    [router]
  );

  // Handle filter updates - teraz aktualizujemy parametry URL
  const handleUpdateFilters = useCallback(
    (newFilters: Partial<typeof filters>) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  // Handle page change - teraz aktualizujemy parametr page w URL
  const handlePageChange = useCallback(
    (page: number) => {
      setFilters({ page });
    },
    [setFilters]
  );

  // Handle limit change - teraz aktualizujemy parametr limit w URL
  const handleLimitChange = useCallback(
    (limit: number) => {
      setFilters({
        limit,
        page: 1, // Reset to first page when changing limit
      });
    },
    [setFilters]
  );

  // Resetuj filtry
  const resetFilters = useCallback(() => {
    setFilters({
      nameSearch: "",
      status: "",
      page: 1,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  }, [setFilters]);

  // Render content based on loading/error/data state
  const renderContent = useCallback(() => {
    // Pokaż loader tylko przy pierwszym ładowaniu, nie przy odświeżaniu
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
      // Sprawdź, czy mamy jakieś filtry aktywne
      const hasActiveFilters = filters.nameSearch || filters.status;

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

      return <EmptyStateSetsComponent onOpenCreateModal={open} />;
    }

    return (
      <div className="mt-6 relative">
        {isFetching && setsData && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        )}
        <FlashcardsSetTableComponent
          sets={setsData.data.map((set) => ({
            ...set,
            flashcardCount: set.flashcardCount || 0,
          }))}
          isLoading={isFetching && !setsData}
          onViewDetails={handleViewDetails}
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
    handleViewDetails,
    open,
    filters,
    resetFilters,
  ]);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Moje Zestawy Fiszek</h1>
        <Button onClick={open} disabled={isLoading}>
          Utwórz nowy zestaw
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="mb-6">
        <FilterControlsComponent
          filters={filters}
          onUpdateFilters={handleUpdateFilters}
          isLoading={isLoading}
        />
      </div>

      {/* Table Content */}
      {renderContent()}

      {/* Pagination Controls - only show if we have data */}
      {setsData && setsData.meta && setsData.data.length > 0 && (
        <div className="mt-4">
          <PaginationControlsComponent
            meta={setsData.meta}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            isLoading={isFetching}
          />
        </div>
      )}
    </div>
  );
}
