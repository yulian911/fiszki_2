import { z } from "zod";
import { FlashcardsSetStatus } from "../../types";

// Schemat walidacji dla parametrów listy zestawów
export const flashcardsSetListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  status: z.enum(["pending", "accepted", "rejected"]).optional(),
  name: z.string().optional(),
});

// Schemat walidacji dla tworzenia zestawu
export const createFlashcardsSetSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  description: z.string().max(1000).trim().optional(),
});

// Schemat walidacji dla aktualizacji zestawu
export const updateFlashcardsSetSchema = z
  .object({
    name: z.string().min(1).max(255).trim().optional(),
    status: z.enum(["pending", "accepted", "rejected"]).optional(),
    description: z.string().max(1000).trim().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Przynajmniej jedno pole musi być zaktualizowane",
  });

// Schemat walidacji dla parametru ID
export const idParamSchema = z.object({
  setId: z.string().uuid(),
});

// Schemat dla odpowiedzi z pojedynczym zestawem
export const flashcardsSetResponseSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  name: z.string(),
  status: z.enum(["pending", "accepted", "rejected"]),
  description: z.string().optional(),
  flashcardCount: z.number().int().nonnegative().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schemat dla fiszki
export const flashcardSchema = z.object({
  id: z.string().uuid(),
  flashcardsSetId: z.string().uuid(),
  question: z.string(),
  answer: z.string(),
  source: z.enum(["ai-full", "ai-edit", "manual"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  tags: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
    })
  ),
});

// Schemat dla odpowiedzi z zestawem zawierającym fiszki
export const flashcardsSetWithCardsResponseSchema =
  flashcardsSetResponseSchema.extend({
    flashcards: z.array(flashcardSchema),
  });

// Schemat dla paginacji
export const metaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

// Schemat dla paginowanej odpowiedzi zestawów
export const paginatedFlashcardsSetsResponseSchema = z.object({
  data: z.array(flashcardsSetResponseSchema),
  meta: metaSchema,
});
