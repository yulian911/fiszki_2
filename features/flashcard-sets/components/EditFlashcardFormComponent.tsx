import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useGetFlashcardById } from "@/features/flashcard-sets/api/useGetFlashcardById";
import { useUpdateFlashcard } from "@/features/flashcard-sets/api/useMutateFlashcards";
import { toast } from "sonner";

const editFlashcardSchema = z.object({
  question: z.string().min(1, "Wprowadź pytanie"),
  answer: z.string().min(1, "Wprowadź odpowiedź"),
});

type FormValues = z.infer<typeof editFlashcardSchema>;

interface EditFlashcardFormComponentProps {
  flashcardId: string;
  onCancel: () => void;
}

export const EditFlashcardFormComponent: React.FC<EditFlashcardFormComponentProps> = ({ flashcardId, onCancel }) => {
  const { data, isLoading, isError } = useGetFlashcardById(flashcardId);
  const { mutate: updateFlashcard, isPending } = useUpdateFlashcard();

  const form = useForm<FormValues>({
    defaultValues: { question: "", answer: "" },
    resolver: zodResolver(editFlashcardSchema),
  });

  // When data is loaded, reset form
  useEffect(() => {
    if (data) {
      form.reset({ question: data.question, answer: data.answer });
    }
  }, [data, form]);

  const onSubmit = (values: FormValues) => {
    updateFlashcard(
      { flashcardId, command: values },
      {
        onSuccess: () => {
          toast.success("Zaktualizowano fiszkę");
          onCancel();
        },
        onError: (e) => toast.error(`Błąd: ${e.message}`),
      }
    );
  };

  if (isLoading) return <p>Ładowanie...</p>;
  if (isError || !data) return <p>Nie udało się załadować fiszki.</p>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pytanie</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={isPending} />
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
                <Textarea {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isPending}>
            Anuluj
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </div>
      </form>
    </Form>
  );
}; 