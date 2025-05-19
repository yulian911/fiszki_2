"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFlashcardSetsStore } from "@/features/flashcard-sets/hooks/useFlashcardSets";
import type { FlashcardsSetStatus, FlashcardsSetDTO } from "@/types";

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

export function FilterControlsComponent() {
  const { filters, setFilters, isMutating } = useFlashcardSetsStore();

  const handleNameSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!isMutating) {
      setFilters({ nameSearch: event.target.value, page: 1 });
    }
  };

  const handleStatusChange = (value: FlashcardsSetStatus | "all") => {
    if (!isMutating) {
      setFilters({ status: value === "all" ? "" : value, page: 1 });
    }
  };

  const handleSortChange = (value: string) => {
    if (!isMutating) {
      const [sortBy, sortOrder] = value.split("_") as [
        keyof Omit<FlashcardsSetDTO, "ownerId">,
        "asc" | "desc",
      ];
      setFilters({ sortBy, sortOrder, page: 1 });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-background shadow">
      <div>
        <Label htmlFor="nameSearch" className="text-sm font-medium">
          Wyszukaj po nazwie
        </Label>
        <Input
          id="nameSearch"
          type="text"
          placeholder="Wpisz nazwę zestawu..."
          value={filters.nameSearch || ""}
          onChange={handleNameSearchChange}
          className="mt-1"
          disabled={isMutating}
        />
      </div>
      <div>
        <Label htmlFor="statusFilter" className="text-sm font-medium">
          Status
        </Label>
        <Select
          value={filters.status || "all"}
          onValueChange={handleStatusChange}
          disabled={isMutating}
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
              : ""
          }
          onValueChange={handleSortChange}
          disabled={isMutating}
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
  );
}
