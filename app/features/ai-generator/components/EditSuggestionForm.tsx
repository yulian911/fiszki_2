"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AISuggestionDTO, EditSuggestionCommand } from "@/types";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { notify } from "../utils/notifications";
import React from "react";

// Schema walidacji formularza edycji
const editSuggestionFormSchema = z.object({
  question: z.string().min(1, "Pytanie jest wymagane"),
  answer: z.string().min(1, "Odpowiedź jest wymagana"),
});

type EditSuggestionFormValues = z.infer<typeof editSuggestionFormSchema>;

interface EditSuggestionFormProps {
  suggestion: AISuggestionDTO;
  onSubmit: (data: EditSuggestionCommand) => Promise<any>;
  onCancel: () => void;
  defaultValues?: {
    question: string;
    answer: string;
  };
  isSubmitting?: boolean;
  error?: string;
}

export function EditSuggestionForm({
  suggestion,
  onSubmit,
  onCancel,
  defaultValues,
  isSubmitting = false,
  error,
}: EditSuggestionFormProps) {
  const form = useForm<EditSuggestionFormValues>({
    resolver: zodResolver(editSuggestionFormSchema),
    defaultValues: {
      question: defaultValues?.question || suggestion.question,
      answer: defaultValues?.answer || suggestion.answer,
    },
  });

  // Use external isSubmitting prop if provided, otherwise use form state
  const isFormSubmitting = isSubmitting || form.formState.isSubmitting;
  const hasErrors = Object.keys(form.formState.errors).length > 0;

  // Update form errors when error prop changes
  React.useEffect(() => {
    if (error) {
      form.setError("root", {
        type: "manual",
        message: error,
      });
    } else {
      form.clearErrors("root");
    }
  }, [error, form]);

  const handleSubmit = async (data: EditSuggestionFormValues) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error is now handled by parent component via the error prop
      // This is just for errors that occur before the API call
      if (error instanceof Error) {
        form.setError("root", {
          type: "manual",
          message: error.message,
        });
      } else {
        form.setError("root", {
          type: "manual",
          message: "Wystąpił problem podczas zapisywania zmian.",
        });
      }
    }
  };

  return (
    <Card className="overflow-hidden border-yellow-500/50 shadow-md">
      <CardHeader className="bg-yellow-500/10 pb-2">
        <CardTitle className="text-md font-medium">Edycja fiszki</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {form.formState.errors.root && (
              <div className="text-sm text-destructive p-2 bg-destructive/10 rounded-md">
                {form.formState.errors.root.message}
              </div>
            )}
            
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pytanie</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Wpisz pytanie..."
                      className={form.formState.errors.question ? "border-destructive" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Odpowiedź</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Wpisz odpowiedź..."
                      className={`min-h-[100px] ${form.formState.errors.answer ? "border-destructive" : ""}`} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isFormSubmitting}
              >
                Anuluj
              </Button>
              <Button 
                type="submit" 
                disabled={isFormSubmitting || hasErrors}
                className="min-w-[120px]"
              >
                {isFormSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Zapisywanie...
                  </>
                ) : "Zapisz zmiany"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
