"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { useFlashcardSetsStore, initialFilters } from '@/features/flashcard-sets/hooks/useFlashcardSets';
import { FileTextIcon, InboxIcon } from 'lucide-react'; // Przykładowe ikony

interface EmptyStateSetsComponentProps {
  onOpenCreateModal: () => void;
}

export function EmptyStateSetsComponent({ onOpenCreateModal }: EmptyStateSetsComponentProps) {
  const { filters, resetFilters, setsData } = useFlashcardSetsStore();

  const isActiveFilter = 
    filters.nameSearch || 
    filters.status || 
    filters.sortBy !== initialFilters.sortBy || 
    filters.sortOrder !== initialFilters.sortOrder;

  const noResultsAfterFiltering = isActiveFilter && setsData && setsData.data.length === 0;
  const noSetsAtAll = !isActiveFilter && setsData && setsData.data.length === 0;

  if (noResultsAfterFiltering) {
    return (
      <div className="text-center py-16 sm:py-20 px-6">
        <FileTextIcon className="mx-auto h-16 w-16 text-gray-400 mb-6" strokeWidth={1.5} />
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">Brak wyników</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Nie znaleziono zestawów fiszek pasujących do Twoich kryteriów wyszukiwania. Spróbuj dostosować filtry lub je wyczyścić.
        </p>
        <Button onClick={resetFilters} size="lg" variant="outline">
          Wyczyść filtry
        </Button>
      </div>
    );
  }

  if (noSetsAtAll) {
    return (
      <div className="text-center py-16 sm:py-20 px-6">
        <InboxIcon className="mx-auto h-16 w-16 text-gray-400 mb-6" strokeWidth={1.5} />
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">Nie masz jeszcze zestawów</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Wygląda na to, że nie utworzyłeś jeszcze żadnego zestawu fiszek. Zacznij od stworzenia swojego pierwszego zestawu!
        </p>
        <Button onClick={onOpenCreateModal} size="lg">
          Utwórz swój pierwszy zestaw
        </Button>
      </div>
    );
  }
  
  return null;
} 