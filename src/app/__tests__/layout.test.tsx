import { render, screen } from '@testing-library/react';
import RootLayout from '../layout';

// Mock the Header component since we're testing it separately
jest.mock('@/components/shared/header', () => ({
  Header: () => <div data-testid="mock-header">Mock Header</div>,
}));

describe('RootLayout Component', () => {
  it('renders without crashing', () => {
    render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );
    expect(document.querySelector('html')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('includes Header component', () => {
    render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
  });

  it('has correct HTML structure and attributes', () => {
    render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );
    
    const html = document.querySelector('html');
    expect(html).toHaveAttribute('lang', 'en');
    
    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveClass('flex-1');
    
    const container = mainContent.parentElement;
    expect(container).toHaveClass('min-h-screen', 'flex', 'flex-col');
  });
});
