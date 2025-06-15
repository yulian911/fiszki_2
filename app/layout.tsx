import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Providers } from "@/components/provider";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import { Toaster } from "sonner";
import SupabaseProvider from "@/components/supabase-provider";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <Providers>
          <SupabaseProvider>
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                duration: 5000,
              }}
            />
            <main className="min-h-screen flex flex-col items-center">
              <div className="flex-1 w-full flex flex-col  items-center">
                {/* <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                  <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                    <div className="flex gap-5 items-center font-semibold">
                      <Link href={"/"}>Next.js Supabase Starter</Link>
                      <div className="flex items-center gap-2">
                        <DeployButton />
                      </div>
                    </div>
                    {!hasEnvVars ? <EnvVarWarning /> : null}
                  </div>
                </nav> */}
                <div className="flex flex-col gap-20 max-w-5xl p-4">
                  {children}
                </div>
              </div>
            </main>
          </SupabaseProvider>
        </Providers>
      </body>
    </html>
  );
}
