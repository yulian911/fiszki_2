"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SessionStarterButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStartSession = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flashcardsSetId: "123e4567-e89b-42d3-a456-426614174000", tags: [], limit: 10 })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error("Failed to create session: " + JSON.stringify(errorData));
      }
      const data = await res.json();
      const sessionId = data.sessionId;
      router.push(`/protected/sessions/${sessionId}`);
    } catch (error) {
      console.error("Error starting session:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
      <button
        onClick={handleStartSession}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {loading ? "Starting Session..." : "Start Session"}
      </button>
    </div>
  );
} 