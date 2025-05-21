import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useCreateFlashcard } from "@/features/flashcard-sets/api/useMutateFlashcards";
import { toast } from "sonner";

const createFlashcardSchema = z.object({
  question: z.string().min(1, "Wprowadź pytanie"),
  answer: z.string().min(1, "Wprowadź odpowiedź"),
});

type FormValues = z.infer<typeof createFlashcardSchema>;

interface AddFlashcardFormComponentProps {
  setId: string;
  onCancel: () => void;
}

export const AddFlashcardFormComponent: React.FC<AddFlashcardFormComponentProps> = ({ setId, onCancel }) => {
  const form = useForm<FormValues>({
    defaultValues: { question: "", answer: "" },
    resolver: zodResolver(createFlashcardSchema),
  });

  const { mutate: createFlashcard, isPending } = useCreateFlashcard();

  const onSubmit = (values: FormValues) => {
    createFlashcard(
      {
        flashcardsSetId: setId,
        question: values.question,
        answer: values.answer,
        source: "manual",
        tags: [],
      },
      {
        onSuccess: () => {
          toast.success("Dodano fiszkę");
          onCancel();
        },
        onError: (e) => {
          toast.error(`Błąd: ${e.message}`);
        },
      }
    );
  };

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
                <Textarea placeholder="Wprowadź pytanie..." {...field} disabled={isPending} />
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
                <Textarea placeholder="Wprowadź odpowiedź..." {...field} disabled={isPending} />
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