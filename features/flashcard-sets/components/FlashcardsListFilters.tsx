import React, { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FlashcardsListFiltersProps {
  filters: {
    page: number;
    limit: number;
    sortBy?: "createdAt" | "question" | "answer" | null;
    sortOrder?: "asc" | "desc" | null;
    search?: string;
  };
  onUpdateFilters: (update: Partial<FlashcardsListFiltersProps["filters"]>) => void;
  isLoading?: boolean;
}

export const FlashcardsListFilters: React.FC<FlashcardsListFiltersProps> = ({
  filters,
  onUpdateFilters,
  isLoading = false,
}) => {
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onUpdateFilters({ search: e.target.value, page: 1 });
  };

  const handleSortByChange = (value: string) => {
    onUpdateFilters({ sortBy: value as any });
  };

  const handleSortOrderChange = (value: string) => {
    onUpdateFilters({ sortOrder: value as any });
  };

  return (
    <div className="flex flex-col md:flex-row md:items-end gap-4">
      <div className="flex-1">
        <Input
          placeholder="Szukaj fiszek..."
          value={filters.search || ""}
          onChange={handleSearchChange}
          disabled={isLoading}
        />
      </div>
      <div className="flex items-center gap-2">
        <Select value={filters.sortBy ?? ""} onValueChange={handleSortByChange} disabled={isLoading}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Sortuj po" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Data</SelectItem>
            <SelectItem value="question">Pytanie</SelectItem>
            <SelectItem value="answer">Odpowiedź</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.sortOrder ?? ""} onValueChange={handleSortOrderChange} disabled={isLoading}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Kierunek" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Rosnąco</SelectItem>
            <SelectItem value="desc">Malejąco</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}; 