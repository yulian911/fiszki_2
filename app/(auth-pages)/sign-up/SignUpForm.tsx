"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, SignUpInput } from "@/features/auth/schemas";
import { signUp as signUpApi } from "@/features/auth/api";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SignUpForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: SignUpInput) => signUpApi(data),
    onSuccess: () => {
      toast.success("Rejestracja zakończona pomyślnie");
      setServerError("");
      router.push("/protected");
    },
    onError: (error: Error) => {
      const errorMessage = error.message.toLowerCase();
      let errorToShow = "Coś poszło nie tak";

      if (
        errorMessage.includes("user already registered") ||
        errorMessage.includes("already registered") ||
        errorMessage.includes("email already exists")
      ) {
        errorToShow = "Email już istnieje";
      }

      setServerError(errorToShow);
      toast.error(errorToShow);
    },
  });

  const onSubmit = (data: SignUpInput) => {
    setServerError("");
    mutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col min-w-64 max-w-64 mx-auto"
    >
      <h1 className="text-2xl font-medium">Zarejestruj się</h1>
      <p className="text-sm text-foreground">
        Masz już konto?{" "}
        <Link href="/sign-in" className="text-primary font-medium underline">
          Zaloguj
        </Link>
      </p>

      {serverError && (
        <div className="text-sm text-red-500 mt-4 p-2 bg-red-50 border border-red-200 rounded">
          {serverError}
        </div>
      )}

      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          {...register("email")}
          placeholder="you@example.com"
        />
        {errors.email && (
          <span className="text-sm text-red-500">{errors.email.message}</span>
        )}

        <Label htmlFor="password">Hasło</Label>
        <Input
          id="password"
          type="password"
          {...register("password")}
          placeholder="Twoje hasło"
        />
        {errors.password && (
          <span className="text-sm text-red-500">
            {errors.password.message}
          </span>
        )}

        <Label htmlFor="passwordConfirmation">Potwierdź hasło</Label>
        <Input
          id="passwordConfirmation"
          type="password"
          {...register("passwordConfirmation")}
          placeholder="Powtórz hasło"
        />
        {errors.passwordConfirmation && (
          <span className="text-sm text-red-500">
            {errors.passwordConfirmation.message}
          </span>
        )}

        <Button type="submit" disabled={mutation.status === "pending"}>
          {mutation.status === "pending" ? "Rejestracja..." : "Zarejestruj"}
        </Button>
      </div>
    </form>
  );
}
