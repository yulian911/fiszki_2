import { z } from "zod";

export const listFlashcardsSetsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z
    .enum(["name", "createdAt", "updatedAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  status: z.enum(["pending", "accepted", "rejected"]).optional(),
  name: z.string().min(1).optional(),
  view: z.enum(["all", "owned", "shared"]).default("all").optional(),
});

export const createFlashcardsSetCommandSchema = z.object({
  name: z
    .string()
    .min(3, "Nazwa musi mieć co najmniej 3 znaki")
    .max(100, "Nazwa nie może być dłuższa niż 100 znaków"),
  description: z
    .string()
    .max(500, "Opis nie może być dłuższy niż 500 znaków")
    .optional(),
});

export const updateFlashcardsSetCommandSchema = z
  .object({
    name: z.string().min(3).max(100).optional(),
    status: z.enum(["pending", "accepted", "rejected"]).optional(),
    description: z.string().max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Przynajmniej jedno pole musi być zdefiniowane do aktualizacji",
  });

export const cloneFlashcardsSetCommandSchema = z.object({
  targetUserId: z.string().uuid().optional(),
});

export const createShareCommandSchema = z.object({
  userId: z.string().uuid("Nieprawidłowy format identyfikatora użytkownika"),
  role: z.enum(["learning"]),
  expiresAt: z.string().datetime("Nieprawidłowy format daty").optional(),
});
