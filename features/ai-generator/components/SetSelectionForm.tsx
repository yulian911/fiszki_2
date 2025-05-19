"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, RefreshCw } from "lucide-react";

// Schema for selecting existing set
const selectSetFormSchema = z.object({
  flashcardsSetId: z.string().min(1, "Wybór zestawu jest wymagany"),
});
type SelectSetFormValues = z.infer<typeof selectSetFormSchema>;

interface SetSelectionFormProps {
  onNext: (setId: string, setName?: string) => void;
  defaultSetId?: string;
}

export function SetSelectionForm({ onNext, defaultSetId }: SetSelectionFormProps) {
  // Stany komponentu
  const [isCreatingNewSet, setIsCreatingNewSet] = useState(false);
  const [newSetName, setNewSetName] = useState("");
  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  
  const { setOptions, isLoading, error, refreshSets, createSet } = useFlashcardSets();

  // Form for selecting existing set
  const form = useForm<SelectSetFormValues>({
    resolver: zodResolver(selectSetFormSchema),
    defaultValues: {
      flashcardsSetId: defaultSetId || "",
    },
  });

  const isSubmitting = form.formState.isSubmitting || isCreatingSet;

  const handleSelectSubmit = (data: SelectSetFormValues) => {
    // Znajdź nazwę zestawu na podstawie ID
    const selectedOption = setOptions.find(opt => opt.value === data.flashcardsSetId);
    onNext(data.flashcardsSetId, selectedOption?.label);
  };

  const handleCreateSetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSetName.trim()) {
      setCreateError("Nazwa zestawu jest wymagana");
      return;
    }
    
    try {
      setIsCreatingSet(true);
      setCreateError(null);
      const newSet = await createSet(newSetName);
      onNext(newSet.id, newSet.name);
    } catch (error) {
      console.error("Błąd przy tworzeniu zestawu:", error);
      setCreateError("Nie udało się utworzyć zestawu");
    } finally {
      setIsCreatingSet(false);
    }
  };

  // Resetowanie formularza tworzenia nowego zestawu
  const handleSwitchToCreateNew = () => {
    setNewSetName("");
    setCreateError(null);
    setIsCreatingNewSet(true);
  };

  const handleCancelCreate = () => {
    setNewSetName("");
    setCreateError(null);
    setIsCreatingNewSet(false);
  };

  // Jeśli defaultSetId jest ustawione, ale nie wybrano jeszcze zestawu,
  // automatycznie wypełnij nazwę wybranego zestawu
  useEffect(() => {
    if (defaultSetId && setOptions.length > 0 && !isCreatingNewSet) {
      const defaultOption = setOptions.find(opt => opt.value === defaultSetId);
      if (defaultOption) {
        form.setValue('flashcardsSetId', defaultSetId);
      }
    }
  }, [defaultSetId, setOptions, form, isCreatingNewSet]);

  return (
    <Card className="overflow-hidden border-blue-500/50 shadow-md">
      <CardHeader className="bg-blue-500/10 pb-2">
        <CardTitle className="text-md font-medium">Wybierz zestaw fiszek</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {isCreatingNewSet ? (
          // Uproszczony formularz dla tworzenia nowego zestawu
          <form onSubmit={handleCreateSetSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="newSetName" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Nazwa nowego zestawu
              </label>
              <Input
                id="newSetName"
                value={newSetName}
                onChange={(e) => setNewSetName(e.target.value)}
                placeholder="Wpisz nazwę zestawu..."
                autoFocus
                autoComplete="off"
                className={`mt-2 ${createError ? "border-destructive" : ""}`}
              />
              {createError && (
                <div className="text-sm text-destructive mt-1">{createError}</div>
              )}
            </div>

            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelCreate}
                disabled={isCreatingSet}
              >
                Wróć do wyboru
              </Button>
              <Button
                type="submit"
                disabled={isCreatingSet || !newSetName.trim()}
              >
                {isCreatingSet ? "Tworzenie..." : "Utwórz i wybierz"}
              </Button>
            </div>
          </form>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSelectSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="flashcardsSetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wybierz zestaw fiszek</FormLabel>
                    <FormControl>
                      <Select
                        disabled={isLoading || isSubmitting}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz zestaw fiszek" />
                        </SelectTrigger>
                        <SelectContent>
                          {setOptions.length > 0 ? (
                            setOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-center text-sm text-muted-foreground">
                              Brak zestawów. Utwórz nowy.
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={refreshSets}
                  disabled={isLoading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Odśwież
                </Button>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSwitchToCreateNew}
                    disabled={isSubmitting}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Utwórz nowy
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    Dalej
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
} 