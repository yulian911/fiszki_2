import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Wywołujemy funkcję RPC `get_daily_activity_last_7_days` z bazy danych.
  const { data, error } = await supabase.rpc("get_daily_activity_last_7_days");

  if (error) {
    console.error("Error fetching daily activity:", error);
    return new NextResponse(
      JSON.stringify({ error: "Could not fetch daily activity" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new NextResponse(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
