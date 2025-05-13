"use client";

import { useState } from "react";
import { useFlashcardSuggestions } from "../hooks/useFlashcardSuggestions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { SetSelectionForm } from "./SetSelectionForm";
import { ChevronLeft, Info } from "lucide-react";

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

  const { status, suggestions, error, text } = generationState;
  // Wizard step: 1 = select set, 2 = enter text/generate, 3 = review suggestions
  const [step, setStep] = useState<number>(defaultSetId ? 2 : 1);
  const [selectedSet, setSelectedSet] = useState<string | undefined>(defaultSetId);
  
  // Informacja o wybranym zestawie
  const [selectedSetName, setSelectedSetName] = useState<string | undefined>(undefined);

  const handleRestartGeneration = () => {
    // Reset state and go back to text input
    handleSubmitText("");
    setStep(2);
  };

  const handleGenerateNewSuggestions = () => {
    // Keep the same text but reset suggestions
    handleSubmitText(text);
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-4 text-sm text-muted-foreground">
        <div className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>1</div>
        <div className="h-px w-6 bg-muted"></div>
        <div className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>2</div>
        <div className="h-px w-6 bg-muted"></div>
        <div className={`px-3 py-1 rounded-full ${step === 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>3</div>
      </div>
    );
  };

  const renderContent = () => {
    if (step === 1) {
      return (
        <SetSelectionForm
          defaultSetId={defaultSetId}
          onNext={(setId: string, setName?: string) => {
            setSelectedSet(setId);
            setSelectedSetName(setName);
            setStep(2);
          }}
        />
      );
    }

    if (step === 2 || status === "idle" || status === "error") {
      return (
        <>
          {selectedSet && selectedSetName && (
            <div className="mb-4 p-2 bg-muted/30 rounded-md flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                Wybrano zestaw: <span className="font-medium">{selectedSetName}</span>
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto text-xs h-7"
                onClick={() => setStep(1)}
              >
                Zmień
              </Button>
            </div>
          )}
          
          <TextGenerationForm
            onSubmit={async (text) => {
              await handleSubmitText(text);
              if (status !== "error") {
                setStep(3);
              }
            }}
            isLoading={status === "generating"}
          />

          {status === "error" && (
            <div className="p-4 text-center">
              <p className="text-destructive mb-4">Wystąpił błąd: {error}</p>
              <Button
                variant="outline"
                onClick={() => handleSubmitText(text)}
              >
                Spróbuj ponownie
              </Button>
            </div>
          )}
          
          <div className="mt-4 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="gap-1"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Wróć do wyboru zestawu
            </Button>
          </div>
        </>
      );
    }

    if (status === "generating") {
      return <LoadingSpinner message="Generowanie sugestii fiszek..." />;
    }

    if (status === "completed" && step === 3) {
      return (
        <>
          {selectedSet && selectedSetName && (
            <div className="mb-4 p-2 bg-muted/30 rounded-md flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span className="text-sm">
                Wybrano zestaw: <span className="font-medium">{selectedSetName}</span>
              </span>
            </div>
          )}
          
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
              defaultSetId={selectedSet}
              isMobile={isMobile}
            />
          ) : (
            <div className="p-4 text-center">
              <p className="mb-4">
                Nie udało się wygenerować żadnych sugestii dla podanego tekstu.
              </p>
              <Button onClick={handleGenerateNewSuggestions}>
                Spróbuj ponownie
              </Button>
            </div>
          )}

          <div className="mt-4 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
            >
              Wróć do edycji tekstu
            </Button>
            <Button
              variant="outline"
              onClick={handleRestartGeneration}
            >
              Generuj nowe sugestie
            </Button>
          </div>
        </>
      );
    }

    return null;
  };

  // Responsywny komponent, który dostosowuje się do szerokości ekranu
  return (
    <>
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={onOpenChange}>
          <DrawerContent className="max-h-dvh">
            <DrawerHeader className="text-left">
              <DrawerTitle>Generator Fiszek AI</DrawerTitle>
              <DrawerDescription>
                {step === 1 && "Wybierz zestaw fiszek, do którego zostaną dodane wygenerowane fiszki."}
                {step === 2 && "Wklej tekst (maksymalnie 5000 znaków), a AI wygeneruje z niego propozycje fiszek."}
                {step === 3 && "Przejrzyj wygenerowane propozycje fiszek i wybierz te, które chcesz dodać do zestawu."}
              </DrawerDescription>
              {renderStepIndicator()}
            </DrawerHeader>
            <div className="px-4 pb-0 overflow-y-auto max-h-[calc(100dvh-10rem)]">
              {renderContent()}
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
                {step === 1 && "Wybierz zestaw fiszek, do którego zostaną dodane wygenerowane fiszki."}
                {step === 2 && "Wklej tekst (maksymalnie 5000 znaków), a AI wygeneruje z niego propozycje fiszek."}
                {step === 3 && "Przejrzyj wygenerowane propozycje fiszek i wybierz te, które chcesz dodać do zestawu."}
              </DialogDescription>
              {renderStepIndicator()}
            </DialogHeader>
            {renderContent()}
          </DialogContent>
        </Dialog>
      )}
      <ToastProvider />
    </>
  );
}
