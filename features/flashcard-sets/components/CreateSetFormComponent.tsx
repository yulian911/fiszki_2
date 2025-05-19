"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFlashcardSetsStore } from '@/features/flashcard-sets/hooks/useFlashcardSets';
import type { CreateFlashcardsSetCommand } from '@/types';

const formSchema = z.object({
  name: z.string()
    .min(3, { message: "Nazwa zestawu musi mieć co najmniej 3 znaki." })
    .max(100, { message: "Nazwa zestawu nie może przekraczać 100 znaków." }),
});

type CreateSetFormValues = z.infer<typeof formSchema>;

interface CreateSetFormComponentProps {
  onFormSubmitSuccess: () => void;
  onCancel: () => void;
}

export function CreateSetFormComponent({ onFormSubmitSuccess, onCancel }: CreateSetFormComponentProps) {
  const { createSet, isMutating, error: apiError, resetError } = useFlashcardSetsStore();

  const form = useForm<CreateSetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values: CreateSetFormValues) {
    console.log('Submitting create form:', { values, isMutating });
    try {
      resetError();
      const command: CreateFlashcardsSetCommand = { name: values.name };
      console.log('Creating set with command:', command);
      const newSet = await createSet(command);
      console.log('Set created:', newSet);
      if (newSet) {
        form.reset();
        onFormSubmitSuccess();
      }
    } catch (error) {
      console.error('Failed to create set:', error);
    }
  }

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
                  placeholder="Np. Słówka z Angielskiego - Rozdział 1" 
                  {...field} 
                  disabled={isMutating}
                />
              </FormControl>
              <FormDescription>
                Podaj nazwę dla swojego nowego zestawu fiszek.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {apiError && (
          <p className="text-sm font-medium text-destructive">
            Błąd API: {apiError.message}
          </p>
        )}

        <div className="flex justify-end space-x-3 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              console.log('Canceling create form');
              resetError();
              onCancel();
            }} 
            disabled={isMutating}
          >
            Anuluj
          </Button>
          <Button 
            type="submit" 
            disabled={isMutating || !form.formState.isDirty}
          >
            {isMutating ? "Zapisywanie..." : "Zapisz zestaw"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 