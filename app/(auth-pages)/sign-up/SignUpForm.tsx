"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { signUpAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignUpSubmitButton } from "./SignUpSubmitButton";

export default function SignUpForm() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toast.error(error);
    }
  }, [searchParams]);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Rejestracja</CardTitle>
        <CardDescription>
          Wprowadź swoje dane, aby utworzyć konto.
        </CardDescription>
      </CardHeader>
      <form action={signUpAction}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              data-testid="email-input"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              type="password"
              name="password"
              data-testid="password-input"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="passwordConfirmation">Potwierdź hasło</Label>
            <Input
              id="passwordConfirmation"
              type="password"
              name="passwordConfirmation"
              data-testid="password-confirm-input"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <SignUpSubmitButton />
          <div className="mt-4 text-center text-sm">
            Masz już konto?{" "}
            <Link href="/sign-in" className="underline">
              Zaloguj się
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
