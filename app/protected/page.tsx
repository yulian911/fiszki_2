import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import Link from 'next/link';

import withAuth from "@/lib/withAuth";
import { AIGeneratorButton } from "@/features/ai-generator";
import SessionStarterButton from "@/features/sessions/components/SessionStarterButton";

function ProtectedPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <AIGeneratorButton />
        </div>
        <SessionStarterButton />
      </div>
    </div>
  );
}

export default withAuth(ProtectedPage);
