import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// This is a simplified example. Replace with your actual component.
interface ExampleButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
}

const ExampleButton = ({ onClick, children }: ExampleButtonProps) => (
  <button onClick={onClick}>{children}</button>
);

describe('ExampleButton Component', () => {
  it('renders the button with the correct text', () => {
    render(<ExampleButton onClick={() => {}}>Click me</ExampleButton>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls the onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    render(<ExampleButton onClick={handleClick}>Click me</ExampleButton>);
    
    await userEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
}); 