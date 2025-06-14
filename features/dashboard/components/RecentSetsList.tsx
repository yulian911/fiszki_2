"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

type RecentSet = {
  id: string;
  name: string;
  description: string | null;
  updated_at: string;
  flashcard_count: number;
};

async function fetchRecentSets(): Promise<RecentSet[]> {
  const response = await fetch("/api/dashboard/recent-sets");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

export const RecentSetsList = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["recentSets"],
    queryFn: fetchRecentSets,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500">
        Wystąpił błąd podczas ładowania ostatnich zestawów.
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-muted-foreground border-2 border-dashed border-muted-foreground/30 rounded-lg p-12">
        <h3 className="text-lg font-semibold">
          Nie masz jeszcze żadnych zestawów
        </h3>
        <p className="mb-4 mt-2 text-sm">
          Stwórz swój pierwszy zestaw fiszek, aby rozpocząć naukę.
        </p>
        <Button asChild>
          <Link href="/protected/sets">
            <PlusCircle className="mr-2 h-4 w-4" />
            Przejdź do zestawów
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
      {data.map((set) => (
        <Card key={set.id}>
          <CardHeader>
            <CardTitle className="truncate">{set.name}</CardTitle>
            <CardDescription className="truncate">
              {set.flashcard_count} fiszek
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href={`/protected/sets/${set.id}/learn`}>Ucz się</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
