"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, SignInInput } from "@/features/auth/schemas";
import { signIn as signInApi } from "@/features/auth/api";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) });

  const mutation = useMutation({
    mutationFn: (data: SignInInput) => signInApi(data),
    onSuccess: () => {
      toast.success("Zalogowano pomyślnie");
      router.push("/protected");
    },
    onError: () => {
      toast.error("Nieprawidłowy email lub hasło");
    },
  });

  const onSubmit = (data: SignInInput) => mutation.mutate(data);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col min-w-64 max-w-64 mx-auto"
    >
      <h1 className="text-2xl font-medium">Zaloguj</h1>
      <p className="text-sm text-foreground">
        Nie masz konta?{" "}
        <Link href="/sign-up" className="text-primary font-medium underline">
          Zarejestruj
        </Link>
      </p>
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

        <div className="flex justify-between items-center">
          <Label htmlFor="password">Hasło</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-foreground underline"
          >
            Zapomniałeś hasła?
          </Link>
        </div>
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

        <Button type="submit" disabled={mutation.status === "pending"}>
          {mutation.status === "pending" ? "Logowanie..." : "Zaloguj"}
        </Button>
      </div>
    </form>
  );
}
