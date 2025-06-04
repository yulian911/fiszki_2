import { z } from "zod";

export const signUpSchema = z
  .object({
    email: z.string().email({ message: "Niepoprawny email" }),
    password: z
      .string()
      .min(6, { message: "Hasło musi mieć co najmniej 6 znaków" }),
    passwordConfirmation: z
      .string()
      .min(6, { message: "Hasła musi mieć co najmniej 6 znaków" }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Hasła nie pasują",
    path: ["passwordConfirmation"],
  });
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email({ message: "Niepoprawny email" }),
  password: z
    .string()
    .min(6, { message: "Hasło musi mieć co najmniej 6 znaków" }),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Niepoprawny email" }),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
