"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EditSetFormComponent } from './EditSetFormComponent';
import type { FlashcardsSetDTO } from '@/types';

interface EditSetModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
  set: FlashcardsSetDTO | undefined; // Może być undefined, jeśli modal nie jest jeszcze otwarty z danymi
}

export function EditSetModalComponent({ isOpen, onClose, set }: EditSetModalComponentProps) {
  if (!isOpen || !set) return null; // Nie renderuj, jeśli nie jest otwarty lub brakuje danych zestawu

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edytuj zestaw: {set.name}</DialogTitle>
          <DialogDescription>
            Zmień nazwę lub status swojego zestawu fiszek.
          </DialogDescription>
        </DialogHeader>
        
        <EditSetFormComponent 
          set={set} 
          onFormSubmitSuccess={onClose} 
          onCancel={onClose} 
        />
        
      </DialogContent>
    </Dialog>
  );
} 