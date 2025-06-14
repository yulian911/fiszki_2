import { z } from "zod";

export const TagDTOSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const FlashcardDTOSchema = z.object({
  id: z.string().uuid(),
  flashcardsSetId: z.string().uuid(),
  question: z.string(),
  answer: z.string(),
  source: z.enum(["ai-full", "ai-edit", "manual"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  tags: z.array(TagDTOSchema),
});

export const CreateFlashcardCommandSchema = z.object({
  flashcardsSetId: z.string().uuid(),
  question: z.string().min(1),
  answer: z.string().min(1),
  source: z.literal("manual"),
  tags: z.array(z.string().min(1)),
  hint: z.string().optional(),
});

export const CreateBulkFlashcardsCommandSchema = z.object({
  flashcardsSetId: z.string().uuid(),
  flashcards: z.array(
    z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
    })
  ),
});

export const UpdateFlashcardCommandSchema =
  CreateFlashcardCommandSchema.partial();

export const ListFlashcardsQuerySchema = z.object({
  setId: z.string().uuid().optional(),
  source: z.enum(["ai-full", "ai-edit", "manual"]).optional(),
  tags: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "question"]).optional(),
});
