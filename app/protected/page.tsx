import { AIGeneratorButton } from "@/features/ai-generator";
import { ActivityChart } from "@/features/dashboard/components/ActivityChart";
import { DashboardStats } from "@/features/dashboard/components/DashboardStats";
import { RecentSetsList } from "@/features/dashboard/components/RecentSetsList";
import { RecentSessionsHistory } from "@/features/dashboard/components/RecentSessionsHistory";
import { SessionStarterModal } from "@/features/sessions/components";
import withAuth from "@/lib/withAuth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ProtectedPage = () => {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Panel główny</h1>
        <p className="text-muted-foreground">
          Oto przegląd Twojej aktywności i postępów w nauce.
        </p>
      </div>

      <DashboardStats />

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
        {/* Main content - Chart and Recent Sets */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <ActivityChart />
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-4">
              Ostatnie zestawy
            </h2>
            <RecentSetsList />
          </div>
        </div>

        {/* Sidebar - Quick Actions & History */}
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-4">
              Szybkie akcje
            </h2>
            <div className="flex flex-col gap-3">
              <SessionStarterModal />
              <AIGeneratorButton />
              <Button variant="outline" asChild>
                <Link href="/protected/sets" data-testid="sets-link">
                  Zarządzaj zestawami
                </Link>
              </Button>
            </div>
          </div>
          <RecentSessionsHistory />
        </div>
      </div>
    </div>
  );
};

export default withAuth(ProtectedPage);
