import { toast } from "sonner";

export const notify = {
  success: (message: string) => {
    toast.success(message);
  },
  error: (message: string) => {
    toast.error(message);
  },
  warning: (message: string) => {
    toast.warning(message);
  },
  info: (message: string) => {
    toast.info(message);
  },
  // Funkcja pomocnicza do obsługi błędów API
  apiError: (
    error: unknown,
    defaultMessage: string = "Wystąpił nieoczekiwany błąd"
  ) => {
    const errorMessage =
      error instanceof Error ? error.message : defaultMessage;

    toast.error(errorMessage);
    console.error(error);
  },
};
