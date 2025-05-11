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

    // Dla żądań API, upewnij się, że odpowiedź zawiera nagłówki autoryzacji
    if (request.nextUrl.pathname.startsWith("/api/")) {
      // Sprawdź, czy użytkownik jest zalogowany dla zapytań do API
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

      // Przekaż wszystkie ciasteczka sesji do następnego handlera
      return response;
    }

    // protected routes
    if (request.nextUrl.pathname.startsWith("/protected") && !data.user) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if (request.nextUrl.pathname === "/" && data.user) {
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
