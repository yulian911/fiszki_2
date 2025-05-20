import { ToastProvider } from "@/features/ai-generator/components/ToastProvider";
import OpenEditDeleteFlashcardSetModal from "@/features/flashcard-sets/components/OpenEditDeleteFlashcardSetModal";
import React from "react";
import { Toaster } from "sonner";

// import { redirect } from "next/navigation";


export const dynamic = "force-dynamic";

const LayoutProtected = async ({ children }: { children: React.ReactNode }) => {
  //

  return (
    <main className="flex h-screen">
              <OpenEditDeleteFlashcardSetModal />
<section className="flex h-full flex-1 flex-col ">
    {children}
</section>

      <ToastProvider /> 
    </main>
  );
};
export default LayoutProtected;
