"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import type { FlashcardsSetViewItem } from "@/features/flashcard-sets/types";
import type { FlashcardsSetDTO, FlashcardsSetStatus } from "@/types";

interface FlashcardsSetTableComponentProps {
  sets: FlashcardsSetViewItem[];
  isLoading: boolean;
  onViewDetails: (setId: string) => void;
  onEditSet: (set: FlashcardsSetDTO) => void;
  onDeleteSet: (set: FlashcardsSetDTO) => void;
}

const statusVariantMap: Record<
  FlashcardsSetStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  accepted: "default",
  rejected: "destructive",
};

const statusLabelMap: Record<FlashcardsSetStatus, string> = {
  pending: "Oczekujący",
  accepted: "Zaakceptowany",
  rejected: "Odrzucony",
};

export function FlashcardsSetTableComponent({
  sets,
  isLoading,
  onViewDetails,
  onEditSet,
  onDeleteSet,
}: FlashcardsSetTableComponentProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4">
        <p className="text-center text-gray-500">Ładowanie danych tabeli...</p>
        {/* W przyszłości można dodać komponent Skeleton dla lepszego UX */}
        {/* Przykład: <TableSkeleton numberOfRows={5} /> */}
      </div>
    );
  }

  // Stan pustej tabeli (gdy sets=[] ale nie ma isLoading) powinien być obsłużony
  // przez EmptyStateSetsComponent na poziomie strony. Tutaj zwracamy null,
  // aby nie renderować pustej struktury tabeli, jeśli sets jest puste.
  if (!sets || sets.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35%] min-w-[200px]">Nazwa</TableHead>
            <TableHead className="w-[15%] min-w-[120px]">Status</TableHead>
            <TableHead className="w-[20%] min-w-[150px]">
              Data utworzenia
            </TableHead>
            <TableHead className="w-[15%] min-w-[100px] text-center">
              Liczba fiszek
            </TableHead>
            <TableHead className="w-[15%] min-w-[100px] text-right">
              Akcje
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sets.map((set) => (
            <TableRow key={set.id}>
              <TableCell className="font-medium">
                <button
                  onClick={() => onViewDetails(set.id)}
                  className="hover:underline focus:underline focus:outline-none text-left w-full truncate"
                  title={set.name}
                >
                  {set.name}
                </button>
              </TableCell>
              <TableCell>
                <Badge
                  variant={statusVariantMap[set.status] || "outline"}
                  className="whitespace-nowrap"
                >
                  {statusLabelMap[set.status] || set.status}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatDate(set.createdAt)}
              </TableCell>
              <TableCell className="text-center">
                {set.flashcardCount !== undefined ? set.flashcardCount : "N/A"}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">
                        Otwórz menu dla {set.name}
                      </span>
                      <DotsHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(set.id)}>
                      Zobacz szczegóły
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditSet(set)}>
                      Edytuj
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteSet(set)}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      Usuń
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
