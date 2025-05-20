import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { QueryProviders } from "./query-provider";


interface ProvidersProps {
    children: React.ReactNode;
  }
  
  export function Providers({ children }: ProvidersProps) {
    return (
      <NuqsAdapter>
          <QueryProviders>
          <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
          </QueryProviders>
             
      </NuqsAdapter>
    );
  }
  