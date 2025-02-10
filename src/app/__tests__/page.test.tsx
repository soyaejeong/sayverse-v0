import { render, screen } from '@testing-library/react';
import HomePage from '../page';

describe('HomePage Component', () => {
  it('renders without crashing', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('displays correct heading and description', () => {
    render(<HomePage />);
    expect(screen.getByText('Share Your Voice with the World')).toBeInTheDocument();
    expect(screen.getByText('Record and share your voice moments easily.')).toBeInTheDocument();
  });

  it('renders Start Recording button with correct link', () => {
    render(<HomePage />);
    const recordButton = screen.getByText('Start Recording');
    expect(recordButton).toBeInTheDocument();
    expect(recordButton.closest('a')).toHaveAttribute('href', '/record');
  });

  it('has correct styling classes', () => {
    render(<HomePage />);
    
    // Check container classes
    const container = screen.getByText('Share Your Voice with the World').closest('div');
    expect(container?.parentElement).toHaveClass('container', 'mx-auto', 'px-4', 'py-12');
    
    // Check content wrapper classes
    expect(container).toHaveClass('max-w-2xl', 'mx-auto', 'text-center');
    
    // Check heading classes
    const heading = screen.getByRole('heading');
    expect(heading).toHaveClass('text-4xl', 'font-bold', 'mb-6');
    
    // Check description classes
    const description = screen.getByText('Record and share your voice moments easily.');
    expect(description).toHaveClass('text-lg', 'text-gray-600', 'mb-8');
  });
});
