import { z } from 'zod';

// Card rating schema used across multiple features
export const cardRatingSchema = z.enum(['again', 'hard', 'good', 'easy']); 