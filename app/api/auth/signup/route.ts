import { signUpAction } from "@/features/auth/actions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, passwordConfirmation } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email i hasło są wymagane" },
        { status: 400 }
      );
    }

    if (password !== passwordConfirmation) {
      return NextResponse.json({ error: "Hasła nie pasują" }, { status: 400 });
    }

    // Create FormData for server action
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("passwordConfirmation", passwordConfirmation);

    // Call the server action
    const result = await signUpAction(formData);

    // If we get here, signup was successful
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.log("Signup API result:", error);

    // Check if it's a Next.js redirect
    if (
      error?.message === "NEXT_REDIRECT" ||
      error?.digest?.startsWith("NEXT_REDIRECT")
    ) {
      // Get the redirect URL from the error (it should be in error.digest)
      const redirectUrl = error?.digest?.replace("NEXT_REDIRECT;", "") || "";
      console.log("Redirect URL:", redirectUrl);

      // Check if redirect URL contains error or success
      if (redirectUrl.includes("error=")) {
        // Extract error message
        const urlParams = new URLSearchParams(redirectUrl.split("?")[1] || "");
        const errorMessage =
          urlParams.get("error") || "Wystąpił błąd podczas rejestracji";
        console.log("Error message from redirect:", errorMessage);

        // Return appropriate status based on error type
        if (errorMessage.includes("Email już istnieje")) {
          return NextResponse.json({ error: errorMessage }, { status: 409 });
        }

        return NextResponse.json({ error: errorMessage }, { status: 400 });
      } else if (redirectUrl.includes("/protected")) {
        // Successful signup redirects to /protected
        console.log("Signup successful - redirect to protected");
        return NextResponse.json({ success: true, redirect: "/protected" });
      }
    }

    console.error("Unexpected signup error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas rejestracji" },
      { status: 500 }
    );
  }
}
