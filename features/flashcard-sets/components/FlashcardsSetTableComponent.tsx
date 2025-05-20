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
import useEditModalSet from "../hooks/useEditModal";

interface FlashcardsSetTableComponentProps {
  sets: FlashcardsSetViewItem[];
  isLoading: boolean;
  onViewDetails: (setId: string) => void;
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
}: FlashcardsSetTableComponentProps) {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const { flashcardSetEditId,deleteOpen, openEdit, closeEdit } = useEditModalSet();
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
              <TableCell className="text-right space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onViewDetails(set.id)}
                >
                  Szczegóły
                </Button>
                <Button 
                  size="sm"
                  onClick={() => openEdit(set.id)}
                >
                  Edytuj
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => deleteOpen(set.id)}
                >
                  Usuń
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
