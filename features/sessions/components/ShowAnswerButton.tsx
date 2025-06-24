"use client";

import { Button } from "@/components/ui/button";
import { ShowAnswerButtonProps } from "../types";

export function ShowAnswerButton({
  onShowAnswer,
  disabled,
}: ShowAnswerButtonProps) {
  return (
    <Button
      onClick={onShowAnswer}
      disabled={disabled}
      className="px-8"
      size="lg"
    >
      Pokaż odpowiedź
    </Button>
  );
}
