import { render, screen } from '@testing-library/react';
import { RecordingTimer } from '../RecordingTimer';

describe('RecordingTimer Component', () => {
  it('renders without crashing', () => {
    render(<RecordingTimer duration={0} />);
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('formats time correctly for seconds and milliseconds', () => {
    render(<RecordingTimer duration={12345} />);
    // 12345ms = 12.345s = "12:34"
    expect(screen.getByText('12:34')).toBeInTheDocument();
  });

  it('handles single digit seconds correctly', () => {
    render(<RecordingTimer duration={5678} />);
    // 5678ms = 5.678s = "05:67"
    expect(screen.getByText('05:67')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<RecordingTimer duration={0} className="custom-class" />);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass('font-mono', 'text-lg', 'custom-class');
  });

  it('handles large duration values', () => {
    render(<RecordingTimer duration={123456} />);
    // 123456ms = 123.456s = "123:45"
    expect(screen.getByText('123:45')).toBeInTheDocument();
  });

  it('handles zero duration', () => {
    render(<RecordingTimer duration={0} />);
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });
});