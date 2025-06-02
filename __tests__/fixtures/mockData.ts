// Mock data for testing
export const mockFlashcardsSet = {
  id: '1',
  name: 'Test Set',
  description: 'This is a test flashcards set',
  userId: 'user123',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  isPublic: true,
  tags: ['test', 'example']
};

export const mockFlashcards = [
  {
    id: '1',
    front: 'Question 1',
    back: 'Answer 1',
    setId: '1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    front: 'Question 2',
    back: 'Answer 2',
    setId: '1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  }
];

export const mockUser = {
  id: 'user123',
  email: 'test@example.com',
  name: 'Test User',
  avatarUrl: 'https://example.com/avatar.jpg'
}; 