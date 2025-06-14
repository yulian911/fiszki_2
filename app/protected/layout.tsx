import { ToastProvider } from "@/features/ai-generator/components/ToastProvider";
import OpenEditDeleteFlashcardSetModal from "@/features/flashcard-sets/components/OpenEditDeleteFlashcardSetModal";
import HeaderAuth from "@/components/header-auth";
import React from "react";
import { Toaster } from "sonner";

// import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const LayoutProtected = async ({ children }: { children: React.ReactNode }) => {
  //

  return (
    <main className="flex h-screen flex-col">
      {/* Header z nawigacją i przyciskiem wylogowania */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-background">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <span>Fiszki App</span>
          </div>
          <HeaderAuth />
        </div>
      </nav>

      <div className="flex flex-1">
        <OpenEditDeleteFlashcardSetModal />
        <section className="flex h-full flex-1 flex-col p-4">
          {children}
        </section>
      </div>

      {/* <ToastProvider /> */}
    </main>
  );
};
export default LayoutProtected;
