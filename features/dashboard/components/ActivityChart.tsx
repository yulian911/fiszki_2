"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type ActivityData = {
  activity_date: string;
  review_count: number;
};

async function fetchActivityData(): Promise<ActivityData[]> {
  const response = await fetch("/api/dashboard/activity");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

export const ActivityChart = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["activityData"],
    queryFn: fetchActivityData,
  });

  const formattedData = data?.map((item) => ({
    name: new Date(item.activity_date).toLocaleDateString("pl-PL", {
      weekday: "short",
    }),
    total: item.review_count,
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktywność w ostatnich 7 dniach</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">
            Wystąpił błąd podczas ładowania wykresu aktywności.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktywność w ostatnich 7 dniach</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formattedData}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: any) => `${value}`}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
              }}
            />
            <Bar
              dataKey="total"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
