import { z } from 'zod';
import { cardRatingSchema } from './common';


// Schema for StartSessionCommand
export const startSessionSchema = z.object({
  flashcardsSetId: z.string().uuid(),
  tags: z.array(z.string()),
  limit: z.number().int().positive().max(100),
});

// Schema for EvaluateCardCommand
export const evaluateCardSchema = z.object({
  rating: cardRatingSchema,
});

// Response schemas
export const sessionCardSchema = z.object({
  id: z.string().uuid(),
  question: z.string(),
});

export const startSessionResponseSchema = z.object({
  sessionId: z.string().uuid(),
  cards: z.array(sessionCardSchema),
});

export const sessionSummarySchema = z.object({
  sessionId: z.string().uuid(),
  flashcardsSetId: z.string().uuid(),
  tags: z.array(z.string()),
  score: z.number().min(0).max(100),
  createdAt: z.string().datetime(),
});

// Schema for ending a session
export const endSessionResponseSchema = z.object({
  sessionId: z.string().uuid(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime(),
  durationSeconds: z.number().int().nonnegative(),
  cardsReviewed: z.number().int().nonnegative(),
  score: z.number().min(0).max(100).optional(),
});

// Schema for evaluate card response (union type)
export const evaluateCardResponseSchema = z.union([
  sessionCardSchema,
  sessionSummarySchema,
]);

// Types derived from schemas
export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type EvaluateCardInput = z.infer<typeof evaluateCardSchema>;

// DTO interfaces for use in service methods
export interface SessionCardDTO {
  id: string;
  question: string;
}

export interface SessionSummaryDTO {
  sessionId: string;
  flashcardsSetId: string;
  tags: string[];
  score: number;
  createdAt: string;
}

export interface EndSessionResponseDTO {
  sessionId: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  cardsReviewed: number;
  score?: number;
} 