"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { FlashcardsSetDTO } from '@/types';
import { AlertTriangleIcon } from 'lucide-react';
import { useGetFlashcardSetById } from "../api/useGetFlashcardSets";
import { useDeleteFlashcardSet } from "../api/useMutateFlashcardSets";
import { toast } from "sonner";

type Props = {
  deleteFlashcardSetId: string;
  onCancel: () => void;
};

export function ConfirmDeleteModalComponent({ deleteFlashcardSetId, onCancel }: Props) {
 
  const { mutate: deleteSet, isPending: isDeleting } = useDeleteFlashcardSet();

  const handleDelete = () => {
    if (!deleteFlashcardSetId) return;

    deleteSet(deleteFlashcardSetId, {
      onSuccess: () => {
        toast.success("Zestaw fiszek został usunięty");
        onCancel(); // Zamknij modal po sukcesie
      },
      onError: (error) => {
        toast.error(`Błąd podczas usuwania zestawu fiszek: ${error.message}`);
      },
    });
  };

  const isDisabled =  isDeleting;

 
  if (!deleteFlashcardSetId) {
    return <div className="p-4 text-center text-destructive">Nie znaleziono zestawu fiszek</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-amber-600 mb-4">
        <AlertTriangleIcon className="h-5 w-5" />
        <span>Ta operacja jest nieodwracalna. Czy na pewno chcesz usunąć ten zestaw?</span>
      </div>
      
      <div className="flex justify-end space-x-3 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={isDisabled}
        >
          Anuluj
        </Button>
        <Button 
          variant="destructive"
          onClick={handleDelete}
          disabled={isDisabled}
        >
          {isDeleting ? "Usuwanie..." : "Usuń"}
        </Button>
      </div>
    </div>
  );
} 