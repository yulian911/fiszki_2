import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const { data, error } = await supabase.auth.getUser();

    // Debug logging for protected routes
    if (request.nextUrl.pathname.startsWith("/protected")) {
      console.log(
        "🔍 Middleware checking protected route:",
        request.nextUrl.pathname
      );
      console.log(
        "🍪 Request cookies:",
        request.cookies
          .getAll()
          .map((c) => `${c.name}=${c.value.slice(0, 20)}...`)
      );
      console.log(
        "👤 User data:",
        data.user ? `User ID: ${data.user.id}` : "No user"
      );
      console.log("❌ Auth error:", error?.message || "No error");
    }

    // Dla żądań API, upewnij się, że odpowiedź zawiera nagłówki autoryzacji
    if (request.nextUrl.pathname.startsWith("/api/")) {
      // Wyklucz endpointy autoryzacji z sprawdzania
      const authEndpoints = [
        "/api/auth/signin",
        "/api/auth/signup",
        "/api/auth/callback",
      ];
      const isAuthEndpoint = authEndpoints.some((endpoint) =>
        request.nextUrl.pathname.startsWith(endpoint)
      );

      if (!isAuthEndpoint) {
        // Sprawdź, czy użytkownik jest zalogowany dla zapytań do API (poza autoryzacją)
        if (error || !data.user) {
          // Jeśli brak autoryzacji i to POST/PUT/DELETE - zwróć 401
          if (["POST", "PUT", "DELETE"].includes(request.method)) {
            return NextResponse.json(
              {
                error: "Nieautoryzowany dostęp",
                details: "Musisz być zalogowany, aby wykonać tę operację.",
              },
              { status: 401 }
            );
          }
        }
      }

      // Przekaż wszystkie ciasteczka sesji do następnego handlera
      return response;
    }

    // protected routes
    if (request.nextUrl.pathname.startsWith("/protected") && !data.user) {
      console.log("🚫 Redirecting to sign-in due to no user");
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if (request.nextUrl.pathname === "/" && data.user) {
      console.log("🏠 Redirecting authenticated user to protected area");
      return NextResponse.redirect(new URL("/protected", request.url));
    }

    return response;
  } catch (e) {
    console.error("Błąd middleware Supabase:", e);
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
