"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { AIFlashcardGeneratorDialog } from "./AIFlashcardGeneratorDialog";

export function DashboardAIGeneratorButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary/10 pb-3">
          <CardTitle className="flex items-center text-lg font-semibold">
            <Sparkles className="mr-2 h-5 w-5 text-primary" />
            Generator Fiszek AI
          </CardTitle>
          <CardDescription>
            Utwórz fiszki automatycznie na podstawie tekstu
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 pb-2">
          <p className="text-sm text-muted-foreground">
            Wklej tekst, artykuł lub notatki, a sztuczna inteligencja wygeneruje
            z nich gotowe fiszki, które możesz dodać do wybranego zestawu lub
            utworzyć nowy.
          </p>
        </CardContent>
        <CardFooter className="border-t bg-muted/30 px-6 py-4">
          <Button onClick={() => setIsOpen(true)} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            Generuj fiszki z tekstem
          </Button>
        </CardFooter>
      </Card>

      <AIFlashcardGeneratorDialog isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
