"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { AIFlashcardGeneratorDialog } from "./AIFlashcardGeneratorDialog";

interface AIGeneratorButtonProps {
  defaultSetId?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function AIGeneratorButton({
  defaultSetId,
  variant = "default",
  size = "default",
  className,
}: AIGeneratorButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Generuj fiszki AI
      </Button>

      <AIFlashcardGeneratorDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        defaultSetId={defaultSetId}
      />
    </>
  );
}
