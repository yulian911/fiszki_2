"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { FlashcardsSetDTO, FlashcardsSetStatus } from '@/types';
import { useGetFlashCardsSetId } from '../api/useGetFlashcardSetsId';
import { useUpdateFlashcardSet } from '../api/useMutateFlashcardSets';
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from '@/hooks/use-debounce';
import { checkSetNameUnique } from '../services/FlashcardsSetService';

const flashcardsSetStatusEnum = z.enum(["pending", "accepted", "rejected"]);

const formSchema = z.object({
  name: z.string()
    .min(3, { message: "Nazwa zestawu musi mieć co najmniej 3 znaki." })
    .max(100, { message: "Nazwa zestawu nie może przekraczać 100 znaków." }),
  status: flashcardsSetStatusEnum,
  description: z.string().max(500, { message: "Opis nie może przekraczać 500 znaków." }).optional(),
});

type EditSetFormValues = z.infer<typeof formSchema>;

interface EditSetFormComponentProps {
  flashcardSetId: string;
  onCancel: () => void;
}

const statusOptions: { label: string; value: FlashcardsSetStatus }[] = [
  { label: "Oczekujący", value: "pending" },
  { label: "Zaakceptowany", value: "accepted" },
  { label: "Odrzucony", value: "rejected" },
];

export function EditSetFormComponent({ onCancel, flashcardSetId }: EditSetFormComponentProps) {
  const { data: flashcardSet, isLoading, error } = useGetFlashCardsSetId({ flashcardSetId });
  const { mutate: updateSet, isPending } = useUpdateFlashcardSet();
  
  const form = useForm<EditSetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      status: "pending",
      description: "",
    },
    mode: "onChange",
  });
  
  const [initialName, setInitialName] = useState<string | undefined>(undefined);
  const [isCheckingName, setIsCheckingName] = useState(false);
  
  const nameValue = form.watch("name");
  const debouncedName = useDebounce(nameValue, 500);

  useEffect(() => {
    if (flashcardSet) {
      const initialValues = {
        name: flashcardSet.name || "",
        status: flashcardSet.status || "pending",
        description: flashcardSet.description || "",
      };
      form.reset(initialValues);
      setInitialName(initialValues.name);
    }
  }, [flashcardSet, form]);
  
  useEffect(() => {
    const checkName = async () => {
      if (debouncedName && debouncedName !== initialName && debouncedName.length > 2) {
        setIsCheckingName(true);
        try {
          const { isUnique } = await checkSetNameUnique(debouncedName, flashcardSetId);
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
  }, [debouncedName, initialName, flashcardSetId, form]);

  const onSubmit = (values: EditSetFormValues) => {
    updateSet(
      { setId: flashcardSetId, command: values },
      {
        onSuccess: () => {
          onCancel();
        },
      }
    );
  };

  if (isLoading) return <div className="p-4 text-center">Ładowanie danych formularza...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Błąd: {error.message}</div>;

  const isSubmitDisabled = isPending || isCheckingName || !form.formState.isDirty || !form.formState.isValid;

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
                  placeholder="Wpisz nową nazwę zestawu" 
                  {...field} 
                  disabled={isPending}
                  autoFocus
                />
              </FormControl>
              <FormMessage />
              {isCheckingName && <p className="text-sm text-muted-foreground">Sprawdzanie nazwy...</p>}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  value={field.value || ""}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-3 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            disabled={isPending}
          >
            Anuluj
          </Button>
          <Button type="submit" disabled={isSubmitDisabled}>
            {isPending ? "Zapisywanie..." : isCheckingName ? "Sprawdzanie..." : "Zapisz zmiany"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
