import type { SupabaseClient } from "@supabase/supabase-js";
import { SignUpInput, SignInInput, ForgotPasswordInput } from "./schemas";

export async function signUp(supabase: SupabaseClient, data: SignUpInput) {
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signIn(supabase: SupabaseClient, data: SignInInput) {
  const { error } = await supabase.auth.signInWithPassword(data);
  if (error) {
    throw new Error(error.message);
  }
}

export async function forgotPassword(
  supabase: SupabaseClient,
  data: ForgotPasswordInput
) {
  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${window.location.origin}/auth/update-password`,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export const signInWithGoogle = async (supabase: SupabaseClient) => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Error signing in with Google:", error);
    // Handle error appropriately
  }
};

export const signOut = async (supabase: SupabaseClient) => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error signing out:", error);
    // Handle error appropriately
  }
};
