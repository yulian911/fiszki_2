"use client";

import { AIGeneratorButton } from "./AIGeneratorButton";

interface SetAIGeneratorButtonProps {
  setId: string;
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

export function SetAIGeneratorButton({
  setId,
  variant = "secondary",
  size = "default",
  className,
}: SetAIGeneratorButtonProps) {
  return (
    <AIGeneratorButton
      defaultSetId={setId}
      variant={variant}
      size={size}
      className={className}
    />
  );
}
