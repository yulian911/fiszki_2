import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionsService } from '@/services/SessionsService';
import { type StartSessionInput, type EvaluateCardInput } from '@/features/schemas/session';

// Mock dla SupabaseClient
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn()
  },
  from: vi.fn()
};

describe('SessionsService', () => {
  let service: SessionsService;
  
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();
    
    // Set up default auth mock
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: {
        user: { id: 'test-user-id' }
      }
    });
    
    // Initialize service with mock client
    service = new SessionsService(mockSupabaseClient as any);
  });
  
  describe('start', () => {
    it('should start a new session with cards', async () => {
      // Arrange
      const command: StartSessionInput = {
        flashcardsSetId: 'test-set-id',
        tags: ['tag1', 'tag2'],
        limit: 10
      };
      
      // Mock cards query
      const mockCards = [
        { id: 'card1', question: 'Question 1', tags: [{ name: 'tag1' }] },
        { id: 'card2', question: 'Question 2', tags: [{ name: 'tag2' }] }
      ];
      
      const mockFrom = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockReturnThis();
      const mockInsert = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: 'test-session-id' },
        error: null
      });
      
      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === 'flashcards') {
          return {
            select: mockSelect.mockReturnThis(),
            eq: mockEq.mockReturnThis(),
            order: mockOrder.mockReturnThis(),
            limit: mockLimit.mockResolvedValue({
              data: mockCards,
              error: null
            })
          };
        } else if (table === 'sessions') {
          return {
            insert: mockInsert.mockReturnThis(),
            select: mockSelect.mockReturnThis(),
            single: mockSingle
          };
        } else if (table === 'session_cards') {
          return {
            insert: mockInsert.mockResolvedValue({
              error: null
            })
          };
        }
        return {};
      });
      
      // Act
      const result = await service.start(command);
      
      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('flashcards');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('sessions');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('session_cards');
      expect(result).toEqual({
        sessionId: 'test-session-id',
        cards: [
          { id: 'card1', question: 'Question 1' },
          { id: 'card2', question: 'Question 2' }
        ]
      });
    });
    
    it('should throw an error if user is not authenticated', async () => {
      // Arrange
      const command: StartSessionInput = {
        flashcardsSetId: 'test-set-id',
        tags: [],
        limit: 10
      };
      
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null }
      });
      
      // Act & Assert
      await expect(service.start(command)).rejects.toThrow('Unauthorized');
    });
    
    it('should throw an error if no cards are found', async () => {
      // Arrange
      const command: StartSessionInput = {
        flashcardsSetId: 'test-set-id',
        tags: [],
        limit: 10
      };
      
      mockSupabaseClient.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }));
      
      // Act & Assert
      await expect(service.start(command)).rejects.toThrow('No cards found');
    });
  });
  
  describe('evaluate', () => {
    it('should evaluate a card and return the next card', async () => {
      // Arrange
      const sessionId = 'test-session-id';
      const cardId = 'test-card-id';
      const command: EvaluateCardInput = {
        rating: 'easy'
      };
      
      // Mock session query
      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === 'sessions') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: sessionId, flashcards_set_id: 'set-id', tags: [], created_at: new Date().toISOString() },
              error: null
            }),
            update: vi.fn().mockReturnThis()
          };
        } else if (table === 'session_cards') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({
              data: [{ flashcard_id: 'next-card-id' }],
              error: null
            })
          };
        } else if (table === 'flashcards') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'next-card-id', question: 'Next question' },
              error: null
            })
          };
        }
        return {};
      });
      
      // Act
      const result = await service.evaluate(sessionId, cardId, command);
      
      // Assert
      expect(result).toEqual({
        id: 'next-card-id',
        question: 'Next question'
      });
    });
    
    it('should evaluate the last card and return session summary', async () => {
      // Arrange
      const sessionId = 'test-session-id';
      const cardId = 'test-card-id';
      const command: EvaluateCardInput = {
        rating: 'easy'
      };
      
      const sessionData = {
        id: sessionId,
        flashcards_set_id: 'set-id',
        tags: ['tag1'],
        created_at: new Date().toISOString()
      };
      
      // Mock no more pending cards scenario
      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === 'sessions') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: sessionData,
              error: null
            }),
            update: vi.fn().mockReturnThis()
          };
        } else if (table === 'session_cards') {
          // Different implementations based on the query
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockImplementation((fields) => {
              if (fields === 'flashcard_id') {
                return {
                  eq: vi.fn().mockReturnThis(),
                  limit: vi.fn().mockResolvedValue({
                    data: [], // No more pending cards
                    error: null
                  })
                };
              } else if (fields === 'rating') {
                return {
                  eq: vi.fn().mockReturnThis(),
                  mockResolvedValue: vi.fn().mockResolvedValue({
                    data: [
                      { rating: 'easy' },
                      { rating: 'medium' }
                    ],
                    error: null
                  })
                };
              }
              return vi.fn().mockReturnThis();
            })
          };
        }
        return {};
      });
      
      // Act & Assert
      await expect(service.evaluate(sessionId, cardId, command)).resolves.toEqual({
        sessionId,
        flashcardsSetId: sessionData.flashcards_set_id,
        tags: sessionData.tags,
        score: expect.any(Number),
        createdAt: sessionData.created_at
      });
    });
  });
  
  describe('end', () => {
    it('should end a session successfully', async () => {
      // Arrange
      const sessionId = 'test-session-id';
      
      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === 'sessions') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: sessionId },
              error: null
            }),
            update: vi.fn().mockReturnThis()
          };
        }
        return {};
      });
      
      // Act & Assert
      await expect(service.end(sessionId)).resolves.not.toThrow();
    });
    
    it('should throw an error when session is not found', async () => {
      // Arrange
      const sessionId = 'non-existent-id';
      
      mockSupabaseClient.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' }
        })
      }));
      
      // Act & Assert
      await expect(service.end(sessionId)).rejects.toThrow('Session not found or unauthorized');
    });
  });
}); 