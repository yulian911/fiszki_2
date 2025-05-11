"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Sprawdzanie, czy window jest dostępne (SSR sprawdzenie)
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);

      // Ustawienie początkowego stanu
      setMatches(media.matches);

      // Callback do aktualizacji stanu
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };

      // Dodanie nasłuchiwania zmian
      media.addEventListener("change", listener);

      // Cleanup przy odmontowaniu
      return () => {
        media.removeEventListener("change", listener);
      };
    }

    // Domyślna wartość dla SSR
    return () => {};
  }, [query]);

  return matches;
}
