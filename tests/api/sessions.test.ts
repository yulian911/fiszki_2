import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/sessions/route';
import { PATCH } from '@/app/api/sessions/[sessionId]/cards/[cardId]/evaluate/route';
import { DELETE } from '@/app/api/sessions/[sessionId]/route';

// Mock SessionsService
vi.mock('@/services/SessionsService', () => {
  return {
    SessionsService: vi.fn().mockImplementation(() => ({
      start: vi.fn(),
      evaluate: vi.fn(),
      end: vi.fn()
    }))
  };
});

// Mock createClient from server.ts
vi.mock('@/utils/supabase/server', () => {
  return {
    createClient: vi.fn().mockResolvedValue({})
  };
});

import { SessionsService } from '@/services/SessionsService';

describe('Sessions API', () => {
  let mockSessionsService: any;
  
  beforeEach(() => {
    vi.resetAllMocks();
    mockSessionsService = new SessionsService({} as any);
  });
  
  describe('POST /api/sessions', () => {
    it('should create a new session and return 201 status', async () => {
      // Arrange
      const mockRequest = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          flashcardsSetId: 'test-set-id',
          tags: ['tag1'],
          limit: 10
        })
      });
      
      const mockResponse = {
        sessionId: 'new-session-id',
        cards: [
          { id: 'card1', question: 'Question 1' },
          { id: 'card2', question: 'Question 2' }
        ]
      };
      
      mockSessionsService.start.mockResolvedValue(mockResponse);
      
      // Act
      const response = await POST(mockRequest);
      const responseBody = await response.json();
      
      // Assert
      expect(response.status).toBe(201);
      expect(responseBody).toEqual(mockResponse);
      expect(mockSessionsService.start).toHaveBeenCalledWith({
        flashcardsSetId: 'test-set-id',
        tags: ['tag1'],
        limit: 10
      });
    });
    
    it('should return 400 for invalid input', async () => {
      // Arrange
      const mockRequest = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required fields
          tags: []
        })
      });
      
      // Act
      const response = await POST(mockRequest);
      
      // Assert
      expect(response.status).toBe(400);
      expect(await response.json()).toHaveProperty('error', 'Validation failed');
    });
    
    it('should return 404 if no cards are found', async () => {
      // Arrange
      const mockRequest = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          flashcardsSetId: 'empty-set-id',
          tags: [],
          limit: 10
        })
      });
      
      mockSessionsService.start.mockRejectedValue(new Error('No cards found for the given set and tags'));
      
      // Act
      const response = await POST(mockRequest);
      
      // Assert
      expect(response.status).toBe(404);
      expect(await response.json()).toHaveProperty('error', 'No cards found for the given set and tags');
    });
  });
  
  describe('PATCH /api/sessions/[sessionId]/cards/[cardId]/evaluate', () => {
    it('should evaluate a card and return the next card with 200 status', async () => {
      // Arrange
      const mockRequest = new NextRequest(
        'http://localhost:3000/api/sessions/session-id/cards/card-id/evaluate',
        {
          method: 'PATCH',
          body: JSON.stringify({
            rating: 'easy'
          })
        }
      );
      
      const mockParams = {
        sessionId: 'session-id',
        cardId: 'card-id'
      };
      
      const mockNextCard = {
        id: 'next-card-id',
        question: 'Next Question'
      };
      
      mockSessionsService.evaluate.mockResolvedValue(mockNextCard);
      
      // Act
      const response = await PATCH(mockRequest, { params: mockParams });
      const responseBody = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(responseBody).toEqual(mockNextCard);
      expect(mockSessionsService.evaluate).toHaveBeenCalledWith(
        'session-id', 
        'card-id', 
        { rating: 'easy' }
      );
    });
    
    it('should return 400 for invalid rating', async () => {
      // Arrange
      const mockRequest = new NextRequest(
        'http://localhost:3000/api/sessions/session-id/cards/card-id/evaluate',
        {
          method: 'PATCH',
          body: JSON.stringify({
            rating: 'invalid-rating' // Invalid rating
          })
        }
      );
      
      const mockParams = {
        sessionId: 'session-id',
        cardId: 'card-id'
      };
      
      // Act
      const response = await PATCH(mockRequest, { params: mockParams });
      
      // Assert
      expect(response.status).toBe(400);
      expect(await response.json()).toHaveProperty('error', 'Validation failed');
    });
    
    it('should return 403 if session not found or unauthorized', async () => {
      // Arrange
      const mockRequest = new NextRequest(
        'http://localhost:3000/api/sessions/invalid-session/cards/card-id/evaluate',
        {
          method: 'PATCH',
          body: JSON.stringify({
            rating: 'easy'
          })
        }
      );
      
      const mockParams = {
        sessionId: 'invalid-session',
        cardId: 'card-id'
      };
      
      mockSessionsService.evaluate.mockRejectedValue(new Error('Session not found or unauthorized'));
      
      // Act
      const response = await PATCH(mockRequest, { params: mockParams });
      
      // Assert
      expect(response.status).toBe(403);
      expect(await response.json()).toHaveProperty('error', 'Session not found or unauthorized');
    });
  });
  
  describe('DELETE /api/sessions/[sessionId]', () => {
    it('should end a session and return 204 status', async () => {
      // Arrange
      const mockRequest = new NextRequest(
        'http://localhost:3000/api/sessions/session-id',
        {
          method: 'DELETE'
        }
      );
      
      const mockParams = {
        sessionId: 'session-id'
      };
      
      mockSessionsService.end.mockResolvedValue(undefined);
      
      // Act
      const response = await DELETE(mockRequest, { params: mockParams });
      
      // Assert
      expect(response.status).toBe(204);
      expect(mockSessionsService.end).toHaveBeenCalledWith('session-id');
    });
    
    it('should return 403 if session not found or unauthorized', async () => {
      // Arrange
      const mockRequest = new NextRequest(
        'http://localhost:3000/api/sessions/invalid-session',
        {
          method: 'DELETE'
        }
      );
      
      const mockParams = {
        sessionId: 'invalid-session'
      };
      
      mockSessionsService.end.mockRejectedValue(new Error('Session not found or unauthorized'));
      
      // Act
      const response = await DELETE(mockRequest, { params: mockParams });
      
      // Assert
      expect(response.status).toBe(403);
      expect(await response.json()).toHaveProperty('error', 'Session not found or unauthorized');
    });
  });
}); 