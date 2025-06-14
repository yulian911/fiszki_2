"use client";

import React, { useEffect, useState } from "react";
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
import { useCreateFlashcardSet } from "../api/useMutateFlashcardSets";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { checkSetNameUnique } from "../services/FlashcardsSetService";
import { useQueryClient } from "@tanstack/react-query";
import { FLASHCARD_SETS_QUERY_KEY } from "../api/useGetFlashcardSets";

type Props = {
  onCancel: () => void;
};

// Typ formularza na podstawie schematu Zod
type FormValues = z.infer<typeof createFlashcardsSetSchema>;

export function CreateSetFormComponent({ onCancel }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(createFlashcardsSetSchema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onChange",
  });

  const { mutate: createSet, isPending } = useCreateFlashcardSet();
  const queryClient = useQueryClient();
  const [isCheckingName, setIsCheckingName] = useState(false);

  const nameValue = form.watch("name");
  const debouncedName = useDebounce(nameValue, 500);

  useEffect(() => {
    const checkName = async () => {
      if (debouncedName && debouncedName.length > 2) {
        setIsCheckingName(true);
        try {
          const { isUnique } = await checkSetNameUnique(debouncedName);
          if (!isUnique) {
            form.setError("name", {
              type: "manual",
              message: "Ta nazwa jest już zajęta.",
            });
          } else {
            form.clearErrors("name");
          }
        } catch (error) {
          console.error("Błąd podczas sprawdzania nazwy:", error);
        } finally {
          setIsCheckingName(false);
        }
      }
    };
    checkName();
  }, [debouncedName, form]);

  const onSubmit = (values: FormValues) => {
    createSet(values, {
      onSuccess: () => {
        toast.success(`Zestaw "${values.name}" został pomyślnie utworzony.`);
        queryClient.invalidateQueries({
          queryKey: [FLASHCARD_SETS_QUERY_KEY],
        });
        onCancel();
      },
    });
  };

  const isSubmitDisabled =
    isPending || isCheckingName || !form.formState.isValid;

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
                  data-testid="set-name-input"
                />
              </FormControl>
              <FormMessage />
              {isCheckingName && (
                <p className="text-sm text-muted-foreground">
                  Sprawdzanie nazwy...
                </p>
              )}
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
                  data-testid="set-description-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Anuluj
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            data-testid="save-set-button"
          >
            {isPending ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
