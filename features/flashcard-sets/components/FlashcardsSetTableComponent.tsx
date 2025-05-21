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
  const { flashcardSetEditId, deleteOpen, openEdit, closeEdit } = useEditModalSet();
  
  if (isLoading) {
    return (
      <div className="border rounded-lg p-4">
        <p className="text-center text-gray-500">Ładowanie danych tabeli...</p>
        {/* W przyszłości można dodać komponent Skeleton dla lepszego UX */}
        {/* Przykład: <TableSkeleton numberOfRows={5} /> */}
      </div>
    );
  }

  // Widok mobilny (karty)
  const MobileView = () => (
    <div className="space-y-4">
      {sets.map((set) => (
        <div 
          key={set.id}
          className="border rounded-lg p-4 shadow-sm space-y-3"
        >
          <div 
            className="font-semibold text-lg cursor-pointer hover:underline"
            onClick={() => onViewDetails(set.id)}
          >
            {set.name}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Status</span>
              <Badge
                variant={statusVariantMap[set.status] || "outline"}
                className="whitespace-nowrap w-fit mt-1"
              >
                {statusLabelMap[set.status] || set.status}
              </Badge>
            </div>
            
            <div className="flex flex-col">
              <span className="text-muted-foreground">Liczba fiszek</span>
              <span className="font-medium mt-1">
                {set.flashcardCount !== undefined ? set.flashcardCount : "N/A"}
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-muted-foreground">Data utworzenia</span>
              <span className="font-medium mt-1">
                {formatDate(set.createdAt)}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2 mt-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewDetails(set.id)}
              className="flex-1"
            >
              Szczegóły
            </Button>
            <Button 
              size="sm"
              onClick={() => openEdit(set.id)}
              className="flex-1"
            >
              Edytuj
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => deleteOpen(set.id)}
              className="flex-1"
            >
              Usuń
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  // Widok desktopowy (tabela)
  const DesktopView = () => (
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
            <TableCell className="text-right space-x-2 space-y-1">
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
  );

  return (
    <div className="border rounded-lg overflow-hidden shadow">
      {/* Widok mobilny */}
      <div className="block md:hidden">
        <MobileView />
      </div>
      
      {/* Widok desktopowy */}
      <div className="hidden md:block">
        <DesktopView />
      </div>
    </div>
  );
}
