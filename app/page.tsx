import Hero from "@/components/hero";
import LandingPage from "@/components/landing-page";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";

export default async function Home() {
  return (
    <>
      {/* {hasEnvVars ? (
        <>
          <Hero />
          <main className="flex-1 flex flex-col gap-6 px-4">
            <h2 className="font-medium text-xl mb-4">Next steps</h2>
            <SignUpUserSteps />
          </main>
        </>
      ) : (
        <LandingPage />
      )} */}
      <LandingPage />
    </>
  );
}
