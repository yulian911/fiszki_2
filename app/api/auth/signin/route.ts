import { signInAction } from "@/features/auth/actions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email i hasło są wymagane" },
        { status: 400 }
      );
    }

    // Create FormData for server action
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    // Call the server action
    const result = await signInAction(formData);

    // If we get here, login was successful
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.log("Login API result:", error);

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
          urlParams.get("error") || "Wystąpił błąd podczas logowania";
        console.log("Error message from redirect:", errorMessage);

        return NextResponse.json({ error: errorMessage }, { status: 401 });
      } else if (redirectUrl.includes("/protected")) {
        // Successful login redirects to /protected
        console.log("Login successful - redirect to protected");
        return NextResponse.json({ success: true, redirect: "/protected" });
      }
    }

    console.error("Unexpected login error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas logowania" },
      { status: 500 }
    );
  }
}
