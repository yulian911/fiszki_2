"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";

type RecentSession = {
  id: string;
  ended_at: string;
  score: number | null;
  duration_seconds: number | null;
  set_name: string;
};

async function fetchRecentSessions(): Promise<RecentSession[]> {
  const response = await fetch("/api/dashboard/recent-sessions");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

const formatDuration = (seconds: number | null) => {
  if (seconds === null) return "-";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

export const RecentSessionsHistory = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["recentSessions"],
    queryFn: fetchRecentSessions,
  });

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (isError) {
    return (
      <div className="text-red-500">
        Wystąpił błąd podczas ładowania historii sesji.
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-muted-foreground mt-4">
        <p>Brak historii ukończonych sesji.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historia sesji</CardTitle>
        <CardDescription>
          Twoje ostatnie 5 ukończonych sesji nauki.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zestaw</TableHead>
              <TableHead className="text-right">Wynik</TableHead>
              <TableHead className="text-right">Czas</TableHead>
              <TableHead className="text-right">Kiedy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((session) => (
              <TableRow key={session.id}>
                <TableCell className="font-medium truncate max-w-[120px]">
                  {session.set_name}
                </TableCell>
                <TableCell className="text-right">{session.score}%</TableCell>
                <TableCell className="text-right">
                  {formatDuration(session.duration_seconds)}
                </TableCell>
                <TableCell className="text-right">
                  {formatDistanceToNow(new Date(session.ended_at), {
                    addSuffix: true,
                    locale: pl,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
