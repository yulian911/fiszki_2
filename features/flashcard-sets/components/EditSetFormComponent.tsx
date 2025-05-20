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
import type { UpdateFlashcardsSetCommand, FlashcardsSetDTO, FlashcardsSetStatus } from '@/types';
import { useGetFlashCardsSetId } from '../api/useGetFlashcardSetsId';
import { useUpdateFlashcardSet } from '../api/useMutateFlashcardSets';
import { useQueryClient } from '@tanstack/react-query';
import { FLASHCARD_SETS_QUERY_KEY } from '../api/useGetFlashcardSets';
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SubmitButton } from "@/components/submit-button";

const flashcardsSetStatusEnum = z.enum(["pending", "accepted", "rejected"]);

const formSchema = z.object({
  name: z.string()
    .min(3, { message: "Nazwa zestawu musi mieć co najmniej 3 znaki." })
    .max(100, { message: "Nazwa zestawu nie może przekraczać 100 znaków." }),
  status: flashcardsSetStatusEnum,
  description: z.string().max(500, { message: "Opis nie może przekraczać 500 znaków." }),
});

type EditSetFormValues = z.infer<typeof formSchema>;

interface EditSetFormComponentProps {
  flashcardSetId: string;
  onCancel?: () => void;
}

const statusOptions: { label: string; value: FlashcardsSetStatus }[] = [
  { label: "Oczekujący", value: "pending" },
  { label: "Zaakceptowany", value: "accepted" },
  { label: "Odrzucony", value: "rejected" },
];

export function EditSetFormComponent({ onCancel, flashcardSetId }: EditSetFormComponentProps) {
  const { data, isLoading, error } = useGetFlashCardsSetId({ flashcardSetId });
  const updateMutation = useUpdateFlashcardSet();
  const queryClient = useQueryClient();
  
  // Check both data formats - some APIs return {flashcardSet: {...}} and others return the set directly
  const flashcardSet = data?.flashcardSet || data;
  
  console.log('Data from query:', data);
  console.log('Extracted flashcardSet:', flashcardSet);
  
  const form = useForm<EditSetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      status: "pending",
      description: "",
    },
  });

  // Update form when data is loaded
  useEffect(() => {
    if (flashcardSet) {
      form.reset({
        name: flashcardSet.name || "",
        status: flashcardSet.status || "pending",
        description: flashcardSet.description || "",
      });
    }
  }, [flashcardSet, form]);

  async function onSubmit(values: EditSetFormValues) {
    console.log('Form submitted with values:', values);
    
    if (!flashcardSet || typeof flashcardSet !== 'object') {
      console.error('No valid flashcard set data available!', flashcardSet);
      return;
    }
    
    // Make sure we have an ID before proceeding
    const setId = flashcardSet.id;
    if (!setId) {
      console.error('Flashcard set has no ID!', flashcardSet);
      return;
    }
    
    console.log('Current flashcard set:', flashcardSet);
    
    const command: UpdateFlashcardsSetCommand = {};
    let hasChanges = false;

    if (values.name !== flashcardSet.name) {
      command.name = values.name;
      hasChanges = true;
      console.log(`Name changed from "${flashcardSet.name}" to "${values.name}"`);
    }
    
    if (values.status !== flashcardSet.status) {
      command.status = values.status;
      hasChanges = true;
      console.log(`Status changed from "${flashcardSet.status}" to "${values.status}"`);
    }

    if (values.description !== flashcardSet.description) {
      command.description = values.description;
      hasChanges = true;
      console.log(`Description changed from "${flashcardSet.description}" to "${values.description}"`);
    }

    if (!hasChanges) {
      console.log('No changes detected, closing modal');
      onCancel?.();
      return;
    }

    console.log('Changes detected, sending update with command:', command);
    
    try {
      // Use React Query mutation
      await updateMutation.mutateAsync({ 
        setId: setId, 
        command 
      });
      
      console.log('Update successful!');
      
      // Force refresh queries
      queryClient.invalidateQueries({ queryKey: [FLASHCARD_SETS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FLASHCARD_SETS_QUERY_KEY, flashcardSetId] });
      
      // Close the modal
      onCancel?.();
      toast.success("Zestaw fiszek został zaktualizowany");
    } catch (error) {
      console.error('Failed to update set:', error);
      toast.error(`Błąd podczas aktualizacji zestawu fiszek: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const isDisabled = updateMutation.isPending;

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
                  disabled={isDisabled}
                  autoFocus
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
                disabled={isDisabled}
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
                  disabled={isDisabled}
                  value={field.value || ""}
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
            disabled={isDisabled}
          >
            Anuluj
          </Button>
          <Button type="submit" disabled={isDisabled}>
            {isDisabled ? "Zapisywanie..." : "Zapisz zmiany"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
