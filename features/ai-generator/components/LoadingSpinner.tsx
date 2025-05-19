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
    <div className="flex flex-col items-center justify-center p-8 space-y-4 min-h-[150px]">
      <div className="relative">
        <div className="absolute -inset-1 rounded-full bg-primary/20 blur-sm animate-pulse"></div>
        <Loader2 className="h-10 w-10 animate-spin text-primary relative" />
      </div>
      <p className="text-md text-center font-medium text-muted-foreground">{message}</p>
      <p className="text-sm text-center text-muted-foreground/70">To może zająć kilka sekund, prosimy o cierpliwość.</p>
    </div>
  );
}

// Eksportujemy zmemorizowany komponent
export const LoadingSpinner = memo(LoadingSpinnerComponent);
