import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === "undefined") return [];

          return document.cookie
            .split(";")
            .map((cookie) => cookie.trim().split("="))
            .filter(([name]) => name)
            .map(([name, value]) => ({
              name,
              value: decodeURIComponent(value || ""),
            }));
        },
        setAll(cookiesToSet) {
          if (typeof document === "undefined") return;

          cookiesToSet.forEach(({ name, value, options }) => {
            let cookieString = `${name}=${encodeURIComponent(value)}`;

            if (options?.path) cookieString += `; path=${options.path}`;
            if (options?.domain) cookieString += `; domain=${options.domain}`;
            if (options?.maxAge) cookieString += `; max-age=${options.maxAge}`;
            if (options?.expires)
              cookieString += `; expires=${options.expires.toUTCString()}`;
            if (options?.httpOnly) cookieString += "; httponly";
            if (options?.secure) cookieString += "; secure";
            if (options?.sameSite)
              cookieString += `; samesite=${options.sameSite}`;

            document.cookie = cookieString;
          });
        },
      },
    }
  );
