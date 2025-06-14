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

  // Wywołujemy funkcję RPC `get_dashboard_stats` z bazy danych.
  const { data, error } = await supabase.rpc("get_dashboard_stats").single();

  if (error) {
    console.error("Error fetching dashboard stats:", error);
    return new NextResponse(
      JSON.stringify({ error: "Could not fetch dashboard stats" }),
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
