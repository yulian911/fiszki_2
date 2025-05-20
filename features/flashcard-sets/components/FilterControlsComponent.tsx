"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Filter } from "lucide-react";
import type { FlashcardsSetStatus, FlashcardsSetDTO } from "@/types";

// Typy zgodne z useFlashcardSetFilters
type SortByOption = "name" | "createdAt" | "updatedAt";
type SortOrderOption = "asc" | "desc";
type StatusOption = "" | FlashcardsSetStatus;

interface FilterControlsProps {
  filters: {
    page: number;
    limit: number;
    sortBy: SortByOption;
    sortOrder: SortOrderOption;
    status: StatusOption;
    nameSearch: string;
  };
  onUpdateFilters: (newFilters: Partial<FilterControlsProps['filters']>) => void;
  isLoading?: boolean;
}

const statusOptions: { label: string; value: FlashcardsSetStatus | "all" }[] = [
  { label: "Wszystkie", value: "all" },
  { label: "Oczekujące", value: "pending" },
  { label: "Zaakceptowane", value: "accepted" },
  { label: "Odrzucone", value: "rejected" },
];

const sortOptions = [
  { label: "Data utworzenia (Najnowsze)", value: "createdAt_desc" },
  { label: "Data utworzenia (Najstarsze)", value: "createdAt_asc" },
  { label: "Nazwa (A-Z)", value: "name_asc" },
  { label: "Nazwa (Z-A)", value: "name_desc" },
  // Można dodać więcej opcji sortowania, np. po liczbie fiszek, jeśli API to wspiera
];

export function FilterControlsComponent({ 
  filters, 
  onUpdateFilters,
  isLoading = false 
}: FilterControlsProps) {
  const handleNameSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!isLoading) {
      onUpdateFilters({ 
        nameSearch: event.target.value,
        ...(event.target.value !== filters.nameSearch ? { page: 1 } : {})
      });
    }
  };

  const handleStatusChange = (value: FlashcardsSetStatus | "all") => {
    if (!isLoading) {
      onUpdateFilters({ 
        status: value === "all" ? "" : value,
        page: 1
      });
    }
  };

  const handleSortChange = (value: string) => {
    if (!isLoading) {
      const [sortBy, sortOrder] = value.split("_") as [
        SortByOption,
        SortOrderOption,
      ];
      onUpdateFilters({ 
        sortBy, 
        sortOrder,
        page: 1
      });
    }
  };
  
  const resetFilters = () => {
    onUpdateFilters({
      nameSearch: "",
      status: "",
      page: 1,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };
  
  // Sprawdź, czy jakiekolwiek filtry są aktywne
  const hasActiveFilters = Boolean(
    filters.nameSearch || 
    filters.status || 
    (filters.sortBy !== "createdAt" || filters.sortOrder !== "desc")
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-background shadow">
        <div>
          <Label htmlFor="nameSearch" className="text-sm font-medium">
            Wyszukaj po nazwie
          </Label>
          <div className="relative mt-1">
            <Input
              id="nameSearch"
              type="text"
              placeholder="Wpisz nazwę zestawu..."
              value={filters.nameSearch || ""}
              onChange={handleNameSearchChange}
              className="pr-8"
              disabled={isLoading}
            />
            {filters.nameSearch && (
              <button
                type="button"
                onClick={() => onUpdateFilters({ nameSearch: "" })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                <X size={16} />
                <span className="sr-only">Wyczyść wyszukiwanie</span>
              </button>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="statusFilter" className="text-sm font-medium">
            Status
          </Label>
          <Select
            value={filters.status || "all"}
            onValueChange={handleStatusChange}
            disabled={isLoading}
          >
            <SelectTrigger id="statusFilter" className="mt-1">
              <SelectValue placeholder="Wybierz status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sortOrder" className="text-sm font-medium">
            Sortuj według
          </Label>
          <Select
            value={
              filters.sortBy && filters.sortOrder
                ? `${filters.sortBy}_${filters.sortOrder}`
                : "createdAt_desc"
            }
            onValueChange={handleSortChange}
            disabled={isLoading}
          >
            <SelectTrigger id="sortOrder" className="mt-1">
              <SelectValue placeholder="Wybierz kolejność" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            disabled={isLoading}
            className="text-sm"
          >
            <Filter className="mr-2 h-4 w-4" />
            Resetuj filtry
          </Button>
        </div>
      )}
    </div>
  );
}
