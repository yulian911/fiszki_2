"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useFlashcardSets } from "../hooks/useFlashcardSets";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, RefreshCw } from "lucide-react";
import { notify } from "../utils/notifications";

// Schema walidacji formularza wyboru zestawu
const selectSetFormSchema = z.object({
  flashcardsSetId: z.string().min(1, "Wybór zestawu jest wymagany"),
});

type SelectSetFormValues = z.infer<typeof selectSetFormSchema>;

// Schema walidacji formularza nowego zestawu
const newSetFormSchema = z.object({
  name: z.string().min(1, "Nazwa zestawu jest wymagana"),
});

type NewSetFormValues = z.infer<typeof newSetFormSchema>;

interface SelectFlashcardsSetFormProps {
  suggestionId: string;
  onSubmit: (setId: string) => Promise<any>;
  onCancel: () => void;
  defaultSetId?: string;
}

export function SelectFlashcardsSetForm({
  suggestionId,
  onSubmit,
  onCancel,
  defaultSetId,
}: SelectFlashcardsSetFormProps) {
  // Stan tworzenia nowego zestawu
  const [isCreatingNewSet, setIsCreatingNewSet] = useState(false);

  // Hook pobierający zestawy fiszek
  const { setOptions, isLoading, error, refreshSets, createSet } =
    useFlashcardSets();

  // Formularz wyboru istniejącego zestawu
  const form = useForm<SelectSetFormValues>({
    resolver: zodResolver(selectSetFormSchema),
    defaultValues: {
      flashcardsSetId: defaultSetId || "",
    },
  });

  // Formularz tworzenia nowego zestawu
  const newSetForm = useForm<NewSetFormValues>({
    resolver: zodResolver(newSetFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const isSubmitting =
    form.formState.isSubmitting || newSetForm.formState.isSubmitting;

  // Obsługa submisji formularza wyboru zestawu
  const handleSubmit = async (data: SelectSetFormValues) => {
    try {
      await onSubmit(data.flashcardsSetId);
    } catch (error) {
      notify.apiError(error, "Nie udało się dodać fiszki do zestawu");
    }
  };

  // Obsługa tworzenia nowego zestawu
  const handleCreateNewSet = async (data: NewSetFormValues) => {
    try {
      // Utwórz nowy zestaw poprzez API
      const newSet = await createSet(data.name);

      // Akceptacja sugestii z nowym zestawem
      await onSubmit(newSet.id);

      // Reset stanu tworzenia
      setIsCreatingNewSet(false);
    } catch (error) {
      // Błąd jest już obsługiwany wewnątrz createSet
      console.error(error);
    }
  };

  return (
    <Card className="overflow-hidden border-blue-500/50 shadow-md">
      <CardHeader className="bg-blue-500/10 pb-2">
        <CardTitle className="text-md font-medium">
          Wybierz zestaw fiszek
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {isCreatingNewSet ? (
          <Form {...newSetForm}>
            <form
              onSubmit={newSetForm.handleSubmit(handleCreateNewSet)}
              className="space-y-4"
            >
              <FormField
                control={newSetForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwa nowego zestawu</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Wpisz nazwę zestawu..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreatingNewSet(false)}
                  disabled={isSubmitting}
                >
                  Wróć do wyboru
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Tworzenie..." : "Utwórz i akceptuj"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <div className="flex space-x-2">
                <div className="flex-grow">
                  <FormField
                    control={form.control}
                    name="flashcardsSetId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zestaw fiszek</FormLabel>
                        <Select
                          disabled={isLoading || isSubmitting}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz zestaw fiszek" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {setOptions.length > 0 ? (
                              setOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-center text-sm text-muted-foreground">
                                Brak zestawów. Utwórz nowy zestaw.
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="mt-8"
                  onClick={() => refreshSets()}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreatingNewSet(true)}
                disabled={isSubmitting}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Utwórz nowy zestaw
              </Button>

              <div className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Anuluj
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || setOptions.length === 0}
                >
                  {isSubmitting ? "Akceptowanie..." : "Akceptuj"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
