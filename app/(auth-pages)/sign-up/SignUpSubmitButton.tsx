"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SignUpSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full"
      disabled={pending}
      data-testid="signup-button"
    >
      {pending ? "Tworzenie konta..." : "Utwórz konto"}
    </Button>
  );
}
