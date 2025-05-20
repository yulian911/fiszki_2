import { useState, useEffect } from 'react';

/**
 * Hook do debounce'owania wartości.
 * Zwraca wartość, która aktualizuje się tylko gdy upłynie podany czas od ostatniej zmiany.
 * Przydatne do wyszukiwania i filtrów, aby nie wykonywać zapytań przy każdym naciśnięciu klawisza.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Ustaw timer, który zaktualizuje wartość po określonym czasie
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Wyczyść timer, jeśli wartość się zmieni (lub komponent zostanie odmontowany)
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
} 