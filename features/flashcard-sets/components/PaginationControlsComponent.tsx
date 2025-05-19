"use client";

import React from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFlashcardSetsStore } from "@/features/flashcard-sets/hooks/useFlashcardSets";
import type { MetaDTO } from "@/types";

interface PaginationControlsProps {
  meta: MetaDTO;
  // Można dodać opcjonalny prop na dostępne rozmiary strony, jeśli chcemy to konfigurować z zewnątrz
  // availablePageSizes?: number[];
}

const defaultPageSizes = [10, 20, 30, 50, 100];

export function PaginationControlsComponent({ meta /*, availablePageSizes = defaultPageSizes */ }: PaginationControlsProps) {
  const { filters, setFilters, isMutating } = useFlashcardSetsStore();
  const { page, limit, total } = meta;
  const totalPages = Math.ceil(total / limit);

  const handlePageChange = (newPage: number) => {
    if (!isMutating && newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setFilters({ page: newPage });
    }
  };

  const handleLimitChange = (newLimitString: string) => {
    if (!isMutating) {
      const newLimit = parseInt(newLimitString, 10);
      if (newLimit !== filters.limit) {
        setFilters({ limit: newLimit, page: 1 });
      }
    }
  };

  // Nie pokazuj paginacji, jeśli jest tylko jedna strona lub mniej, lub jeśli total jest 0
  if (total === 0 || totalPages <= 1) {
    return (
        <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
                {total === 0 ? "Brak zestawów do wyświetlenia." : `Wyświetlono ${total} z ${total} zestawów.`}
            </div>
             {/* Opcjonalnie można pokazać wybór liczby elementów nawet przy jednej stronie, jeśli total > 0 */}
        </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4">
      <div className="text-sm text-muted-foreground">
        Wyświetlono {Math.min(limit * (page - 1) + 1, total)} - {Math.min(limit * page, total)} z {total} zestawów.
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
            <p className="text-sm font-medium hidden md:block">Elementów na stronie:</p>
            <Select 
              value={limit.toString()} 
              onValueChange={handleLimitChange}
              disabled={isMutating}
            >
            <SelectTrigger className="h-9 w-[75px]">
                <SelectValue placeholder={limit.toString()} />
            </SelectTrigger>
            <SelectContent side="top">
                {defaultPageSizes.map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
        <div className="flex items-center space-x-1">
            <Button
            variant="outline"
            className="hidden h-9 w-9 p-0 lg:flex"
            onClick={() => handlePageChange(1)}
            disabled={page === 1 || isMutating}
            >
            <span className="sr-only">Przejdź do pierwszej strony</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
            </Button>
            <Button
            variant="outline"
            className="h-9 w-9 p-0"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || isMutating}
            >
            <span className="sr-only">Przejdź do poprzedniej strony</span>
            <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center text-sm font-medium px-2">
            Strona {page} z {totalPages}
            </div>
            <Button
            variant="outline"
            className="h-9 w-9 p-0"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || isMutating}
            >
            <span className="sr-only">Przejdź do następnej strony</span>
            <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
            variant="outline"
            className="hidden h-9 w-9 p-0 lg:flex"
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages || isMutating}
            >
            <span className="sr-only">Przejdź do ostatniej strony</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
            </Button>
        </div>
      </div>
    </div>
  );
} 