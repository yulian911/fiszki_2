"use client";

import { useFlashcardSuggestions } from "../hooks/useFlashcardSuggestions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TextGenerationForm } from "./TextGenerationForm";
import { LoadingSpinner } from "./LoadingSpinner";

import { ToastProvider } from "./ToastProvider";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/app/hooks/use-media-query";
import { SuggestionsList } from "./SuggestionsList";

interface AIFlashcardGeneratorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSetId?: string;
}

export function AIFlashcardGeneratorDialog({
  isOpen,
  onOpenChange,
  defaultSetId,
}: AIFlashcardGeneratorDialogProps) {
  const {
    generationState,
    editState,
    acceptState,
    handleSubmitText,
    handleAcceptSuggestion,
    handleRejectSuggestion,
    handleEditSuggestion,
    handleSaveEdit,
    handleCancelEdit,
    handleInitAccept,
    handleCancelAccept,
  } = useFlashcardSuggestions();

  // Wykrywanie czy jest to urządzenie mobilne
  const isMobile = useMediaQuery("(max-width: 640px)");

  const { status, suggestions, error } = generationState;

  const content = (
    <>
      {status !== "completed" && (
        <TextGenerationForm
          onSubmit={handleSubmitText}
          isLoading={status === "generating"}
        />
      )}

      {status === "generating" && (
        <LoadingSpinner message="Generowanie sugestii fiszek..." />
      )}

      {status === "error" && (
        <div className="p-4 text-center">
          <p className="text-destructive mb-4">Wystąpił błąd: {error}</p>
          <Button
            variant="outline"
            onClick={() => handleSubmitText(generationState.text)}
          >
            Spróbuj ponownie
          </Button>
        </div>
      )}

      {status === "completed" && (
        <>
          {suggestions.length > 0 ? (
            <SuggestionsList
              suggestions={suggestions}
              onAccept={handleAcceptSuggestion}
              onReject={handleRejectSuggestion}
              onEdit={handleSaveEdit}
              onEditInit={handleEditSuggestion}
              onEditCancel={handleCancelEdit}
              onAcceptInit={handleInitAccept}
              onAcceptCancel={handleCancelAccept}
              editState={editState}
              acceptState={acceptState}
              defaultSetId={defaultSetId}
              isMobile={isMobile}
            />
          ) : (
            <div className="p-4 text-center">
              <p className="mb-4">
                Nie udało się wygenerować żadnych sugestii dla podanego tekstu.
              </p>
              <Button onClick={() => handleSubmitText(generationState.text)}>
                Spróbuj ponownie
              </Button>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                // Reset stanu do formularza początkowego
                handleSubmitText("");
              }}
            >
              Generuj nowe sugestie
            </Button>
          </div>
        </>
      )}
    </>
  );

  // Responsywny komponent, który dostosowuje się do szerokości ekranu
  return (
    <>
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={onOpenChange}>
          <DrawerContent className="max-h-dvh">
            <DrawerHeader className="text-left">
              <DrawerTitle>Generator Fiszek AI</DrawerTitle>
              <DrawerDescription>
                Wklej tekst (maksymalnie 1000 znaków), a AI wygeneruje z niego
                propozycje fiszek.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-0 overflow-y-auto max-h-[calc(100dvh-10rem)]">
              {content}
            </div>
            <DrawerFooter className="pt-2">
              <DrawerClose asChild>
                <Button variant="outline">Zamknij</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Generator Fiszek AI</DialogTitle>
              <DialogDescription>
                Wklej tekst (maksymalnie 1000 znaków), a AI wygeneruje z niego
                propozycje fiszek.
              </DialogDescription>
            </DialogHeader>
            {content}
          </DialogContent>
        </Dialog>
      )}
      <ToastProvider />
    </>
  );
}
