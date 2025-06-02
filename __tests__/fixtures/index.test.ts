import { mockFlashcardsSet, mockFlashcards, mockUser } from './mockData';

describe('Mock Data', () => {
  it('has valid flashcards set structure', () => {
    expect(mockFlashcardsSet).toHaveProperty('id');
    expect(mockFlashcardsSet).toHaveProperty('name');
    expect(mockFlashcardsSet).toHaveProperty('description');
    expect(mockFlashcardsSet).toHaveProperty('userId');
    expect(mockFlashcardsSet).toHaveProperty('createdAt');
    expect(mockFlashcardsSet).toHaveProperty('updatedAt');
    expect(mockFlashcardsSet).toHaveProperty('isPublic');
    expect(mockFlashcardsSet).toHaveProperty('tags');
    expect(Array.isArray(mockFlashcardsSet.tags)).toBe(true);
  });

  it('has valid flashcards structure', () => {
    expect(Array.isArray(mockFlashcards)).toBe(true);
    expect(mockFlashcards.length).toBeGreaterThan(0);
    
    const flashcard = mockFlashcards[0];
    expect(flashcard).toHaveProperty('id');
    expect(flashcard).toHaveProperty('front');
    expect(flashcard).toHaveProperty('back');
    expect(flashcard).toHaveProperty('setId');
    expect(flashcard).toHaveProperty('createdAt');
    expect(flashcard).toHaveProperty('updatedAt');
  });

  it('has valid user structure', () => {
    expect(mockUser).toHaveProperty('id');
    expect(mockUser).toHaveProperty('email');
    expect(mockUser).toHaveProperty('name');
    expect(mockUser).toHaveProperty('avatarUrl');
  });
}); 