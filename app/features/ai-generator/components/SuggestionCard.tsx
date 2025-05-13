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
import { Check, Pencil, X, Loader2 } from "lucide-react";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { cn } from "@/lib/utils";

interface SuggestionCardProps {
  suggestion: AISuggestionDTO;
  onAcceptClick: (sugId: string) => void;
  onEditClick: () => void;
  onRejectClick: () => void;
  isMobile?: boolean;
  isProcessing?: boolean;
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
    prevProps.isMobile === nextProps.isMobile &&
    prevProps.isProcessing === nextProps.isProcessing
    // Nie porównujemy funkcji, bo zakładamy że są stabilne przez referencje
  );
};

// Komponenty wewnętrzne dla czytelności
const QuestionDisplay = ({question, isMobile}: {question: string, isMobile?: boolean}) => (
  <>
    <CardHeader className={cn("bg-muted/50 pb-2", isMobile && "p-3")}>
      <CardTitle
        className={cn("text-md font-medium", isMobile && "text-sm")}
      >
        Pytanie
      </CardTitle>
    </CardHeader>
    <CardContent className={cn("pt-4 pb-2", isMobile && "p-3 pt-3 pb-2")}>
      <p className={cn(isMobile && "text-sm")}>{question}</p>
    </CardContent>
  </>
);

const AnswerDisplay = ({answer, isMobile}: {answer: string, isMobile?: boolean}) => (
  <>
    <CardHeader className={cn("bg-muted/50 pb-2", isMobile && "p-3")}>
      <CardTitle
        className={cn("text-md font-medium", isMobile && "text-sm")}
      >
        Odpowiedź
      </CardTitle>
    </CardHeader>
    <CardContent className={cn("pt-4 pb-2", isMobile && "p-3 pt-3 pb-2")}>
      <p className={cn(isMobile && "text-sm")}>{answer}</p>
    </CardContent>
  </>
);

// Komponent akcji dla karty sugestii
function SuggestionActions({
  onAcceptClick,
  onEditClick,
  onRejectClick,
  setShowConfirmation,
  isMobile = false,
  suggestionId,
  isProcessing = false,
}: {
  onAcceptClick: (sugId: string) => void;
  onEditClick: () => void;
  onRejectClick: () => void;
  setShowConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile?: boolean;
  suggestionId: string;
  isProcessing?: boolean;
}) {
  return (
    <CardFooter
      className={cn(
        "flex justify-between p-4 pt-2 gap-2",
        isMobile && "flex-row"
      )}
    >
      <Button
        size="sm"
        className="flex-1"
        onClick={() => onAcceptClick(suggestionId)}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Akceptuję...
          </>
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" /> Akceptuj
          </>
        )}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="flex-1"
        onClick={onEditClick}
        disabled={isProcessing}
      >
        <Pencil className="mr-2 h-4 w-4" /> Edytuj
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="flex-1"
        onClick={() => setShowConfirmation(true)}
        disabled={isProcessing}
      >
        <X className="mr-2 h-4 w-4" /> Odrzuć
      </Button>
    </CardFooter>
  );
}

// Komponent wewnętrzny do memorizacji
function SuggestionCardComponent({
  suggestion,
  onAcceptClick,
  onEditClick,
  onRejectClick,
  isMobile = false,
  isProcessing = false,
}: SuggestionCardProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <>
      <Card className={cn("overflow-hidden", isProcessing && "opacity-80")}>
        <QuestionDisplay question={suggestion.question} isMobile={isMobile} />
        <AnswerDisplay answer={suggestion.answer} isMobile={isMobile} />
        <SuggestionActions 
          onAcceptClick={onAcceptClick}
          onEditClick={onEditClick}
          onRejectClick={onRejectClick}
          setShowConfirmation={setShowConfirmation}
          isMobile={isMobile}
          suggestionId={suggestion.id}
          isProcessing={isProcessing}
        />
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
