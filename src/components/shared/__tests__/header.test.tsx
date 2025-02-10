import { render, screen } from '@testing-library/react';
import { Header } from '../header';

describe('Header Component', () => {
  it('renders without crashing', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders logo with correct link', () => {
    render(<Header />);
    const logoLink = screen.getByText('SayVerse');
    expect(logoLink).toBeInTheDocument();
    expect(logoLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders Record link with correct href', () => {
    render(<Header />);
    const recordLink = screen.getByText('Record');
    expect(recordLink).toBeInTheDocument();
    expect(recordLink.closest('a')).toHaveAttribute('href', '/record');
  });

  it('has correct styling classes', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('border-b');
    
    const container = header.firstChild;
    expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'h-16', 'flex', 'items-center', 'justify-between');
  });
});
