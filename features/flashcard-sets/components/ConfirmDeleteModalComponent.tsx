"use client";

import React from 'react';
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
import { useFlashcardSetsStore } from '@/features/flashcard-sets/hooks/useFlashcardSets';
import type { FlashcardsSetDTO } from '@/types';
import { AlertTriangleIcon } from 'lucide-react';

interface ConfirmDeleteModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
  set: FlashcardsSetDTO | undefined;
}

export function ConfirmDeleteModalComponent({ isOpen, onClose, set }: ConfirmDeleteModalComponentProps) {
  const { deleteSet, isMutating, error: apiError, resetError } = useFlashcardSetsStore();

  if (!isOpen || !set) return null;

  const handleDelete = async () => {
    try {
      resetError();
      const success = await deleteSet(set.id);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to delete set:', error);
    }
  };

  const handleClose = () => {
    resetError();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <DialogTitle className="text-center text-lg font-semibold leading-6 text-gray-900">
            Potwierdź usunięcie zestawu
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-500">
            Czy na pewno chcesz usunąć zestaw "<strong>{set.name}</strong>"? Tej operacji nie można cofnąć, a wszystkie fiszki w tym zestawie zostaną trwale usunięte.
          </DialogDescription>
        </DialogHeader>

        {apiError && (
          <p className="mt-3 text-center text-sm font-medium text-destructive">
            Błąd API: {apiError.message}
          </p>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose} 
            disabled={isMutating}
            className="w-full sm:w-auto"
          >
            Anuluj
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isMutating}
            className="w-full sm:w-auto"
          >
            {isMutating ? "Usuwanie..." : "Usuń zestaw"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 