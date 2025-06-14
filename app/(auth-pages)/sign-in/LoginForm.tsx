"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { signInAction } from "@/features/auth/actions";
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
import { SubmitButton } from "./SubmitButton";

export default function LoginForm() {
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
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Wprowadź swój email poniżej, aby zalogować się na swoje konto.
        </CardDescription>
      </CardHeader>
      <form action={signInAction}>
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
            <div className="flex items-center">
              <Label htmlFor="password">Hasło</Label>
              <Link
                href="/forgot-password"
                className="ml-auto inline-block text-sm underline"
              >
                Zapomniałeś hasła?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              name="password"
              data-testid="password-input"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <SubmitButton />
          <div className="mt-4 text-center text-sm">
            Nie masz konta?{" "}
            <Link href="/sign-up" className="underline">
              Zarejestruj się
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
