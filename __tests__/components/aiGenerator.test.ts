import { generateContent } from '../../features/ai-generator/test/aiGenerator';

describe('aiGenerator - generateContent', () => {
  it('should return generated content for valid non-empty input', () => {
    const input = 'Test input';
    const result = generateContent(input);
    expect(result).toBe('Generated Content: Test input');
  });

  it('should return an empty string for empty input', () => {
    expect(generateContent('')).toBe('');
    expect(generateContent('   ')).toBe('');
  });

  it('should throw an error for null input', () => {
    // @ts-ignore: intentionally testing invalid input
    expect(() => generateContent(null)).toThrowError('Input cannot be null or undefined');
  });

  it('should throw an error for undefined input', () => {
    // @ts-ignore: intentionally testing invalid input
    expect(() => generateContent(undefined)).toThrowError('Input cannot be null or undefined');
  });

  it('should return generated content preserving original spaces for input with leading and trailing whitespace', () => {
    const input = '   Hello World   ';
    const result = generateContent(input);
    expect(result).toBe('Generated Content:    Hello World   ');
  });

  it('should return generated content preserving newline characters for multiline input', () => {
    const input = `Line1\nLine2`;
    const result = generateContent(input);
    expect(result).toBe('Generated Content: Line1\nLine2');
  });

  it('should return generated content for very long input', () => {
    const input = 'a'.repeat(1000);
    const result = generateContent(input);
    expect(result).toBe(`Generated Content: ${input}`);
  });
}); 