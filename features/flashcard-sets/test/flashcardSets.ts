export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export class FlashcardSet {
  private flashcards: Flashcard[] = [];

  addFlashcard(flashcard: Flashcard): void {
    if (!flashcard.id || !flashcard.question || !flashcard.answer) {
      throw new Error('Flashcard must have id, question, and answer');
    }
    this.flashcards.push(flashcard);
  }

  removeFlashcard(id: string): boolean {
    const initialLength = this.flashcards.length;
    this.flashcards = this.flashcards.filter(f => f.id !== id);
    return this.flashcards.length < initialLength;
  }

  getFlashcards(): Flashcard[] {
    return [...this.flashcards];
  }
} 