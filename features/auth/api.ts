import { createClient } from "@/utils/supabase/client";
import { SignUpInput, SignInInput, ForgotPasswordInput } from "./schemas";

export async function signUp(data: SignUpInput) {
  const supabase = createClient();
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

export async function signIn(data: SignInInput) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function forgotPassword(data: ForgotPasswordInput) {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${window.location.origin}/auth/callback?redirect_to=/protected/reset-password`,
  });
  if (error) {
    throw new Error(error.message);
  }
}
