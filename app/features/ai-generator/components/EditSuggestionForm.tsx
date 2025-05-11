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
}

export function EditSuggestionForm({
  suggestion,
  onSubmit,
  onCancel,
  defaultValues,
}: EditSuggestionFormProps) {
  const form = useForm<EditSuggestionFormValues>({
    resolver: zodResolver(editSuggestionFormSchema),
    defaultValues: {
      question: defaultValues?.question || suggestion.question,
      answer: defaultValues?.answer || suggestion.answer,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleSubmit = async (data: EditSuggestionFormValues) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Obsługa błędu - można dodać wyświetlanie komunikatu
      console.error("Błąd podczas zapisywania edycji:", error);
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
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pytanie</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea {...field} className="min-h-[100px]" />
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
                disabled={isSubmitting}
              >
                Anuluj
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
