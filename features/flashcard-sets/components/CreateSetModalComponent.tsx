"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter, // Może nie być potrzebny, jeśli formularz ma swoje przyciski
} from "@/components/ui/dialog";
import { CreateSetFormComponent } from './CreateSetFormComponent';
import { Button } from "@/components/ui/button"; // Dla przycisku zamknięcia, jeśli nie ma go w headerze Dialog
import { XIcon } from 'lucide-react'; // Alternatywa dla Radix Icon, jeśli zainstalowane

interface CreateSetModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSetModalComponent({ isOpen, onClose }: CreateSetModalComponentProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Utwórz nowy zestaw fiszek</DialogTitle>
          <DialogDescription>
            Wprowadź nazwę dla swojego nowego zestawu. Po zapisaniu będziesz mógł dodać do niego fiszki.
          </DialogDescription>
        </DialogHeader>
        
        <CreateSetFormComponent 
          onFormSubmitSuccess={onClose} // Po sukcesie zamknij modal
          onCancel={onClose} // Anulowanie w formularzu również zamyka modal
        />
        
        {/* 
          Przycisk X do zamknięcia modala jest standardowo dodawany przez Shadcn/ui DialogContent,
          więc jawne dodawanie go tutaj może nie być konieczne, chyba że chcemy inny styl/pozycję.
          Jeśli DialogClose jest potrzebny jako osobny przycisk:
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="ghost">Zamknij</Button>
            </DialogClose>
          </DialogFooter> 
        */}
      </DialogContent>
    </Dialog>
  );
} 