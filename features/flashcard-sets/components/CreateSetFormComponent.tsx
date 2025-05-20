"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createFlashcardsSetSchema } from "@/features/schemas/flashcardsSet";
import { SubmitButton } from "@/components/submit-button";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateFlashcardSet } from "../api/useMutateFlashcardSets";
import { toast } from "sonner";

type Props = {
  onCancel: () => void;
};

// Typ formularza na podstawie schematu Zod
type FormValues = z.infer<typeof createFlashcardsSetSchema>;

export function CreateSetFormComponent({ onCancel }: Props) {
  // Pobranie metod do obsługi formularza
  const form = useForm<FormValues>({
    resolver: zodResolver(createFlashcardsSetSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const queryClient = useQueryClient();
  const { mutate: createSet, isPending } = useCreateFlashcardSet();

  // Obsługa wysłania formularza
  const onSubmit = async (values: FormValues) => {
    createSet(values, {
      onSuccess: async () => {
        // Najpierw zamykamy modal
        onCancel();
        // Potem pokazujemy powiadomienie o sukcesie
        toast.success("Zestaw fiszek został utworzony");
      },
      onError: (error) => {
        toast.error(`Błąd podczas tworzenia zestawu fiszek: ${error.message}`);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwa zestawu</FormLabel>
              <FormControl>
                <Input
                  placeholder="Wpisz nazwę zestawu..."
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opis (opcjonalnie)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Opisz zestaw..."
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Anuluj
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Tworzenie..." : "Utwórz"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 