"use client";

import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { FileText, Upload, AlertCircle } from "lucide-react";
import { notify } from "../utils/notifications";

// Schema walidacji formularza
const generateSuggestionsFormSchema = z.object({
  text: z
    .string()
    .min(1, "Tekst jest wymagany")
    .max(5000, "Tekst nie może przekraczać 5000 znaków"),
});

type GenerateSuggestionsFormValues = z.infer<
  typeof generateSuggestionsFormSchema
>;

interface TextGenerationFormProps {
  onSubmit: (text: string) => Promise<void>;
  isLoading: boolean;
}

export function TextGenerationForm({
  onSubmit,
  isLoading,
}: TextGenerationFormProps) {
  const [charCount, setCharCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<GenerateSuggestionsFormValues>({
    resolver: zodResolver(generateSuggestionsFormSchema),
    defaultValues: {
      text: "",
    },
    mode: "onChange" // Walidacja przy każdej zmianie
  });

  // Użyj efektu, aby ustawić focus na textarea po załadowaniu
  useEffect(() => {
    if (textareaRef.current && !isLoading) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCharCount(text.length);
    // Wyczyść błąd ogólny formularza, gdy użytkownik wprowadza zmiany
    if (formError) setFormError(null);
  };

  const handleSubmit = async (data: GenerateSuggestionsFormValues) => {
    try {
      setFormError(null);
      await onSubmit(data.text);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Wystąpił błąd podczas przetwarzania tekstu";
      
      setFormError(errorMessage);
      form.setError("text", {
        type: "manual",
        message: errorMessage,
      });
    }
  };

  // Obsługa Drag and Drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (isLoading) return;

    const items = e.dataTransfer.items;
    let textContent = "";

    // Najpierw sprawdź, czy ktoś bezpośrednio upuścił tekst
    if (e.dataTransfer.types.includes("text/plain")) {
      e.dataTransfer.items[0].getAsString((text) => {
        // Ustaw wartość pola
        form.setValue("text", text);
        setCharCount(text.length);
        form.trigger("text"); // Uruchom walidację
        
        // Sprawdź długość tekstu
        if (text.length > 5000) {
          form.setValue("text", text.substring(0, 5000));
          setCharCount(5000);
          notify.warning("Tekst został przycięty do 5000 znaków");
        }
      });
      return;
    }

    // Jeśli to plik, spróbuj go odczytać
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.kind === "file") {
        const file = item.getAsFile();

        if (file && file.type.match(/^text\/|application\/json/)) {
          try {
            textContent = await readTextFile(file);

            // Jeśli tekst jest zbyt długi, obetnij go
            if (textContent.length > 5000) {
              textContent = textContent.substring(0, 5000);
              notify.warning("Tekst został przycięty do 5000 znaków");
            }

            // Ustaw wartość pola
            form.setValue("text", textContent);
            setCharCount(textContent.length);
            form.trigger("text"); // Uruchom walidację
            break;
          } catch (error) {
            notify.error("Nie udało się odczytać pliku");
            console.error(error);
          }
        } else {
          notify.warning(
            "Nieobsługiwany format pliku. Obsługiwane są pliki tekstowe."
          );
        }
      }
    }
  };

  // Funkcja pomocnicza do odczytu pliku
  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text");

    if (pastedText.length > 5000) {
      e.preventDefault();
      const truncatedText = pastedText.substring(0, 5000);
      form.setValue("text", truncatedText);
      setCharCount(5000);
      form.trigger("text"); // Uruchom walidację
      notify.warning("Wklejony tekst został przycięty do 5000 znaków");
    }
  };

  const isTextTooLong = charCount > 5000;
  const isTextEmpty = charCount === 0;
  const isSubmitDisabled = isLoading || isTextEmpty || isTextTooLong || !!formError;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {formError && (
          <div className="p-3 border border-destructive/50 rounded bg-destructive/10 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p>{formError}</p>
          </div>
        )}
        
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div
                  className={`relative rounded-md border ${
                    isDragging 
                      ? "border-primary border-dashed bg-primary/5" 
                      : isTextTooLong 
                        ? "border-destructive" 
                        : ""
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Textarea
                    placeholder={
                      isDragging
                        ? "Upuść tekst tutaj..."
                        : "Wklej tekst źródłowy do analizy przez AI..."
                    }
                    className={`min-h-[200px] resize-none pr-16 ${isDragging ? "opacity-50" : ""}`}
                    disabled={isLoading}
                    onPaste={handlePaste}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleTextChange(e);
                    }}
                    ref={textareaRef}
                  />
                  <div className={`absolute bottom-2 right-2 text-sm ${
                    isTextTooLong 
                      ? "text-destructive font-medium" 
                      : "text-muted-foreground"
                  }`}>
                    {charCount}/5000
                  </div>

                  {isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-md">
                      <div className="flex flex-col items-center p-4 bg-background rounded-lg shadow-sm">
                        <Upload className="h-10 w-10 text-primary mb-2" />
                        <span className="text-sm font-medium">
                          Upuść tekst lub plik tekstowy
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground flex items-center">
            <FileText className="h-3 w-3 mr-1" />
            <span>Obsługiwane pliki: .txt, .json, .md</span>
          </div>
          <Button
            type="submit"
            disabled={isSubmitDisabled}
          >
            {isLoading ? "Generowanie..." : "Generuj fiszki"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
