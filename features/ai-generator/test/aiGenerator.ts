export function generateContent(input: string | null | undefined): string {
  if (input == null) {
    throw new Error('Input cannot be null or undefined');
  }
  if (input.trim() === '') {
    return '';
  }
  return `Generated Content: ${input}`;
} 