

import React, { useState, useEffect } from "react";
import withAuth from "@/lib/withAuth";
import { SessionStarterModal } from "@/features/sessions/components";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { AIGeneratorButton } from "@/features/ai-generator";

const ProtectedPage: React.FC = () => {



  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Protected Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 border rounded shadow">
          <p className="text-sm text-gray-500">Fiszki do powtórki dzisiaj:</p>
          <p className="text-xl font-semibold">"TEST"</p>
        </div>
        <div className="p-4 border rounded shadow">
          <p className="text-sm text-gray-500">Łączna liczba fiszek:</p>
          <p className="text-xl font-semibold">"TEST"</p>
        </div>
      </div>
      <div className="flex gap-4">
        {/* Using SessionStarterModal for 'Rozpocznij naukę' action */}
        <SessionStarterModal />
        <AIGeneratorButton />
        <Link href="/protected/sets" aria-label="Zestawy fiszek">
          <Button variant="outline">Zestawy fiszek</Button>
        </Link>
      </div>
    </div>
  );
};

export default withAuth(ProtectedPage);
