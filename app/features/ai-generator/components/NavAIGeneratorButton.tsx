"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { AIFlashcardGeneratorDialog } from "./AIFlashcardGeneratorDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function NavAIGeneratorButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(true)}
              className="relative"
            >
              <Sparkles className="h-5 w-5" />
              <span className="sr-only">Generuj fiszki AI</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Generuj fiszki AI</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AIFlashcardGeneratorDialog isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
