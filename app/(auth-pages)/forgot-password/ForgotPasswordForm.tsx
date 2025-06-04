"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  ForgotPasswordInput,
} from "@/features/auth/schemas";
import { forgotPassword as forgotPasswordApi } from "@/features/auth/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: ForgotPasswordInput) => forgotPasswordApi(data),
    onSuccess: () => {
      toast.success("Sprawdź swój email, aby zresetować hasło");
    },
    onError: () => {
      toast.error("Nie można zresetować hasła");
    },
  });

  const onSubmit = (data: ForgotPasswordInput) => mutation.mutate(data);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col min-w-64 max-w-64 mx-auto"
    >
      <div>
        <h1 className="text-2xl font-medium">Resetuj hasło</h1>
        <p className="text-sm text-secondary-foreground">
          Masz już konto?{" "}
          <Link href="/sign-in" className="text-primary underline">
            Zaloguj
          </Link>
        </p>
      </div>
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
        <Button type="submit" disabled={mutation.status === "pending"}>
          {mutation.status === "pending" ? "Wysyłanie..." : "Resetuj hasło"}
        </Button>
      </div>
    </form>
  );
}
