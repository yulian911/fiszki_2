"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full"
      disabled={pending}
      data-testid="login-button"
    >
      {pending ? "Logowanie..." : "Zaloguj się"}
    </Button>
  );
}
