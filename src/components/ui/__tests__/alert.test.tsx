import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from '../alert';

describe('Alert Components', () => {
  describe('Alert', () => {
    it('renders with default variant', () => {
      render(<Alert>Test alert</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveClass('bg-background', 'text-foreground');
    });

    it('renders with destructive variant', () => {
      render(<Alert variant="destructive">Test alert</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveClass('border-destructive/50', 'text-destructive');
    });

    it('merges custom className with default classes', () => {
      render(<Alert className="custom-class">Test alert</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('custom-class');
      expect(alert).toHaveClass('rounded-lg', 'border', 'p-4');
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(<Alert ref={ref}>Test alert</Alert>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('AlertTitle', () => {
    it('renders with correct tag and styling', () => {
      render(<AlertTitle>Test Title</AlertTitle>);
      const title = screen.getByText('Test Title');
      expect(title.tagName).toBe('H5');
      expect(title).toHaveClass('mb-1', 'font-medium', 'leading-none', 'tracking-tight');
    });

    it('merges custom className', () => {
      render(<AlertTitle className="custom-class">Test Title</AlertTitle>);
      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('custom-class');
      expect(title).toHaveClass('mb-1', 'font-medium');
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(<AlertTitle ref={ref}>Test Title</AlertTitle>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('AlertDescription', () => {
    it('renders with correct styling', () => {
      render(<AlertDescription>Test Description</AlertDescription>);
      const description = screen.getByText('Test Description');
      expect(description).toHaveClass('text-sm');
    });

    it('merges custom className', () => {
      render(<AlertDescription className="custom-class">Test Description</AlertDescription>);
      const description = screen.getByText('Test Description');
      expect(description).toHaveClass('custom-class');
      expect(description).toHaveClass('text-sm');
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(<AlertDescription ref={ref}>Test Description</AlertDescription>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Integration', () => {
    it('renders full alert with all components', () => {
      render(
        <Alert>
          <AlertTitle>Alert Title</AlertTitle>
          <AlertDescription>Alert Description</AlertDescription>
        </Alert>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Alert Title')).toBeInTheDocument();
      expect(screen.getByText('Alert Description')).toBeInTheDocument();
    });
  });
});
