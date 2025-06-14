"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Brain, Calendar, Flame } from "lucide-react";
import React from "react";

type DashboardStatsData = {
  flashcards_to_review_today: number;
  total_flashcards: number;
  completed_sessions: number;
  study_streak: number;
};

async function fetchDashboardStats(): Promise<DashboardStatsData> {
  const response = await fetch("/api/dashboard/stats");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

export const DashboardStats = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
  });

  const stats = [
    {
      title: "Fiszki do powtórki",
      value: data?.flashcards_to_review_today,
      icon: Calendar,
      color: "text-blue-500",
    },
    {
      title: "Wszystkie fiszki",
      value: data?.total_flashcards,
      icon: BookOpen,
      color: "text-green-500",
    },
    {
      title: "Ukończone sesje",
      value: data?.completed_sessions,
      icon: Brain,
      color: "text-purple-500",
    },
    {
      title: "Passa nauki",
      value: `${data?.study_streak || 0} dni`,
      icon: Flame,
      color: "text-orange-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-6" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500">
        Wystąpił błąd podczas ładowania statystyk.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
