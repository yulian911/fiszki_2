import { memo } from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
}

// Wewnętrzny komponent do memorizacji
function LoadingSpinnerComponent({
  message = "Ładowanie...",
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// Eksportujemy zmemorizowany komponent
export const LoadingSpinner = memo(LoadingSpinnerComponent);
