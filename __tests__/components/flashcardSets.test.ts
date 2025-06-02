import { Flashcard, FlashcardSet } from '../../features/flashcard-sets/test/flashcardSets';

describe('FlashcardSet', () => {
  let flashcardSet: FlashcardSet;
  const validFlashcard: Flashcard = { id: '1', question: 'What is 2+2?', answer: '4' };

  beforeEach(() => {
    flashcardSet = new FlashcardSet();
  });

  describe('addFlashcard', () => {
    it('should add a valid flashcard', () => {
      flashcardSet.addFlashcard(validFlashcard);
      const flashcards = flashcardSet.getFlashcards();
      expect(flashcards).toHaveLength(1);
      expect(flashcards[0]).toEqual(validFlashcard);
    });

    it('should throw an error if flashcard is missing id', () => {
      const invalidFlashcard = { id: '', question: 'What is your name?', answer: 'John' };
      expect(() => flashcardSet.addFlashcard(invalidFlashcard)).toThrowError('Flashcard must have id, question, and answer');
    });

    it('should throw an error if flashcard is missing question', () => {
      const invalidFlashcard = { id: '2', question: '', answer: 'John' };
      expect(() => flashcardSet.addFlashcard(invalidFlashcard)).toThrowError('Flashcard must have id, question, and answer');
    });

    it('should throw an error if flashcard is missing answer', () => {
      const invalidFlashcard = { id: '3', question: 'What is your name?', answer: '' };
      expect(() => flashcardSet.addFlashcard(invalidFlashcard)).toThrowError('Flashcard must have id, question, and answer');
    });
  });

  describe('removeFlashcard', () => {
    it('should remove an existing flashcard and return true', () => {
      flashcardSet.addFlashcard(validFlashcard);
      const removed = flashcardSet.removeFlashcard(validFlashcard.id);
      expect(removed).toBe(true);
      expect(flashcardSet.getFlashcards()).toHaveLength(0);
    });

    it('should return false when trying to remove a non-existent flashcard', () => {
      const removed = flashcardSet.removeFlashcard('non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('getFlashcards', () => {
    it('should return a copy of the flashcards array, not the internal array', () => {
      flashcardSet.addFlashcard(validFlashcard);
      const flashcardsCopy = flashcardSet.getFlashcards();
      expect(flashcardsCopy).toHaveLength(1);
      flashcardsCopy.push({ id: 'new', question: 'New Q', answer: 'New A' });
      expect(flashcardSet.getFlashcards()).toHaveLength(1);
    });
  });
}); 