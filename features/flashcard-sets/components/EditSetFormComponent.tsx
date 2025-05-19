"use client";

import React, { useEffect } from 'react';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFlashcardSetsStore } from '@/features/flashcard-sets/hooks/useFlashcardSets';
import type { UpdateFlashcardsSetCommand, FlashcardsSetDTO, FlashcardsSetStatus } from '@/types';

const flashcardsSetStatusEnum = z.enum(["pending", "accepted", "rejected"]);

const formSchema = z.object({
  name: z.string()
    .min(3, { message: "Nazwa zestawu musi mieć co najmniej 3 znaki." })
    .max(100, { message: "Nazwa zestawu nie może przekraczać 100 znaków." }),
  status: flashcardsSetStatusEnum,
});

type EditSetFormValues = z.infer<typeof formSchema>;

interface EditSetFormComponentProps {
  set: FlashcardsSetDTO;
  onFormSubmitSuccess: () => void;
  onCancel: () => void;
}

const statusOptions: { label: string; value: FlashcardsSetStatus }[] = [
  { label: "Oczekujący", value: "pending" },
  { label: "Zaakceptowany", value: "accepted" },
  { label: "Odrzucony", value: "rejected" },
];

export function EditSetFormComponent({ set, onFormSubmitSuccess, onCancel }: EditSetFormComponentProps) {
  const { updateSet, isMutating, error: apiError, resetError } = useFlashcardSetsStore();

  const form = useForm<EditSetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: set?.name || "",
      status: set?.status || "pending",
    },
  });

  useEffect(() => {
    console.log('Edit form mounted/updated:', { set, isMutating });
    if (set) {
      form.reset({
        name: set.name,
        status: set.status,
      });
    }
  }, [set, form, isMutating]);

  async function onSubmit(values: EditSetFormValues) {
    console.log('Submitting edit form:', { values, isMutating, currentSet: set });
    try {
      resetError();
      const command: UpdateFlashcardsSetCommand = {};
      let hasChanges = false;

      if (values.name !== set.name) {
        command.name = values.name;
        hasChanges = true;
      }
      if (values.status !== set.status) {
        command.status = values.status;
        hasChanges = true;
      }

      if (!hasChanges) {
        console.log('No changes detected, closing modal');
        onFormSubmitSuccess();
        return;
      }

      console.log('Updating set with command:', command);
      const updatedSet = await updateSet(set.id, command);
      console.log('Set updated:', updatedSet);
      if (updatedSet) {
        onFormSubmitSuccess();
      }
    } catch (error) {
      console.error('Failed to update set:', error);
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
                  placeholder="Wpisz nową nazwę zestawu" 
                  {...field} 
                  disabled={isMutating}
                />
              </FormControl>
              <FormMessage />
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
                disabled={isMutating}
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
              console.log('Canceling edit form');
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
            {isMutating ? "Zapisywanie..." : "Zapisz zmiany"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
