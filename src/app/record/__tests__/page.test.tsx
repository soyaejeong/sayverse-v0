import { render, screen } from '@testing-library/react';
import RecordPage from '../page';

// Mock the UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="mock-card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="mock-card-content" className={className}>
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, className, size }: { children: React.ReactNode; className?: string; size?: string }) => (
    <button data-testid="mock-button" className={className} data-size={size}>
      {children}
    </button>
  ),
}));

describe('RecordPage Component', () => {
  it('renders without crashing', () => {
    render(<RecordPage />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('displays correct heading', () => {
    render(<RecordPage />);
    expect(screen.getByText('Record Your Voice')).toBeInTheDocument();
  });

  it('renders Start Recording button', () => {
    render(<RecordPage />);
    const button = screen.getByText('Start Recording');
    expect(button).toBeInTheDocument();
    expect(button.closest('button')).toHaveAttribute('data-size', 'lg');
    expect(button.closest('button')).toHaveClass('w-full');
  });

  it('renders Card with correct structure', () => {
    render(<RecordPage />);
    
    // Check card wrapper
    const card = screen.getByTestId('mock-card');
    expect(card).toHaveClass('max-w-md', 'mx-auto');
    
    // Check card content
    const cardContent = screen.getByTestId('mock-card-content');
    expect(cardContent).toHaveClass('p-6');
    
    // Check container
    const container = card.parentElement;
    expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'py-12');
  });

  it('has correct text alignment', () => {
    render(<RecordPage />);
    const textContainer = screen.getByText('Record Your Voice').parentElement;
    expect(textContainer).toHaveClass('text-center');
  });
});
