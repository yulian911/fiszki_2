import { useState, memo } from "react";
import { AISuggestionDTO } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Pencil, X } from "lucide-react";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { cn } from "@/lib/utils";

interface SuggestionCardProps {
  suggestion: AISuggestionDTO;
  onAcceptClick: () => void;
  onEditClick: () => void;
  onRejectClick: () => void;
  isMobile?: boolean;
}

// Funkcja porównująca na potrzeby memorizacji
const areEqual = (
  prevProps: SuggestionCardProps,
  nextProps: SuggestionCardProps
) => {
  return (
    prevProps.suggestion.id === nextProps.suggestion.id &&
    prevProps.suggestion.question === nextProps.suggestion.question &&
    prevProps.suggestion.answer === nextProps.suggestion.answer &&
    prevProps.isMobile === nextProps.isMobile
    // Nie porównujemy funkcji, bo zakładamy że są stabilne przez referencje
  );
};

// Komponent wewnętrzny do memorizacji
function SuggestionCardComponent({
  suggestion,
  onAcceptClick,
  onEditClick,
  onRejectClick,
  isMobile = false,
}: SuggestionCardProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className={cn("bg-muted/50 pb-2", isMobile && "p-3")}>
          <CardTitle
            className={cn("text-md font-medium", isMobile && "text-sm")}
          >
            Pytanie
          </CardTitle>
        </CardHeader>
        <CardContent className={cn("pt-4 pb-2", isMobile && "p-3 pt-3 pb-2")}>
          <p className={cn(isMobile && "text-sm")}>{suggestion.question}</p>
        </CardContent>

        <CardHeader className={cn("bg-muted/50 pb-2", isMobile && "p-3")}>
          <CardTitle
            className={cn("text-md font-medium", isMobile && "text-sm")}
          >
            Odpowiedź
          </CardTitle>
        </CardHeader>
        <CardContent className={cn("pt-4 pb-2", isMobile && "p-3 pt-3 pb-2")}>
          <p className={cn(isMobile && "text-sm")}>{suggestion.answer}</p>
        </CardContent>

        <CardFooter
          className={cn(
            "flex justify-between pt-4 pb-4 bg-muted/30",
            isMobile && "p-3 flex-wrap gap-2"
          )}
        >
          {isMobile ? (
            // Układ mobilny - przyciski jeden pod drugim
            <div className="w-full space-y-2">
              <Button
                size="sm"
                variant="outline"
                className="flex items-center space-x-1 bg-green-500/10 hover:bg-green-500/20 border-green-500/30 w-full"
                onClick={onAcceptClick}
              >
                <Check className="h-4 w-4" />
                <span>Akceptuj</span>
              </Button>

              <div className="flex w-full space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center space-x-1 flex-1"
                  onClick={onEditClick}
                >
                  <Pencil className="h-4 w-4" />
                  <span>Edytuj</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center space-x-1 bg-destructive/10 hover:bg-destructive/20 border-destructive/30 flex-1"
                  onClick={() => setShowConfirmation(true)}
                >
                  <X className="h-4 w-4" />
                  <span>Odrzuć</span>
                </Button>
              </div>
            </div>
          ) : (
            // Układ desktopowy - przyciski obok siebie
            <>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center space-x-1 bg-green-500/10 hover:bg-green-500/20 border-green-500/30"
                  onClick={onAcceptClick}
                >
                  <Check className="h-4 w-4" />
                  <span>Akceptuj</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center space-x-1"
                  onClick={onEditClick}
                >
                  <Pencil className="h-4 w-4" />
                  <span>Edytuj</span>
                </Button>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="flex items-center space-x-1 bg-destructive/10 hover:bg-destructive/20 border-destructive/30"
                onClick={() => setShowConfirmation(true)}
              >
                <X className="h-4 w-4" />
                <span>Odrzuć</span>
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      <ConfirmationDialog
        isOpen={showConfirmation}
        onOpenChange={setShowConfirmation}
        onConfirm={onRejectClick}
        title="Odrzuć sugestię"
        description="Czy na pewno chcesz odrzucić tę sugestię fiszki? Tej operacji nie można cofnąć."
        confirmText="Odrzuć"
        cancelText="Anuluj"
        variant="destructive"
      />
    </>
  );
}

// Eksportujemy zmemorizowany komponent
export const SuggestionCard = memo(SuggestionCardComponent, areEqual);
