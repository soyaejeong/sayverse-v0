import { render, screen, fireEvent } from '@testing-library/react';
import RecordPage from '../page';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Mic: () => <span data-testid="mic-icon">Mic Icon</span>,
  Square: () => <span data-testid="square-icon">Square Icon</span>,
}));

// Mock the hooks
jest.mock('@/hooks/useAudioRecorder');

// Mock the UI components
jest.mock('@/components/recording/WaveformVisualizer', () => ({
  WaveformVisualizer: ({ className }: { isRecording: boolean; className?: string }) => (
    <div data-testid="mock-waveform" className={className}>Waveform</div>
  ),
}));

jest.mock('@/components/recording/RecordingTimer', () => ({
  RecordingTimer: ({ className }: { duration: number; className?: string }) => (
    <div data-testid="mock-timer" className={className}>Timer</div>
  ),
}));

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
  Button: ({ children, className, size, onClick, disabled }: { 
    children: React.ReactNode; 
    className?: string; 
    size?: string;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button 
      data-testid="mock-button" 
      className={className} 
      data-size={size}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

describe('RecordPage Component', () => {
  const mockStartRecording = jest.fn();
  const mockStopRecording = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAudioRecorder as jest.Mock).mockReturnValue({
      isRecording: false,
      audioBlob: null,
      error: null,
      duration: 0,
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
    });
  });

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

  it('renders WaveformVisualizer and RecordingTimer', () => {
    render(<RecordPage />);
    expect(screen.getByTestId('mock-waveform')).toBeInTheDocument();
    expect(screen.getByTestId('mock-timer')).toBeInTheDocument();
  });

  it('handles start recording click', () => {
    render(<RecordPage />);
    const button = screen.getByText('Start Recording');
    fireEvent.click(button);
    expect(mockStartRecording).toHaveBeenCalled();
  });

  it('handles stop recording click when recording', () => {
    (useAudioRecorder as jest.Mock).mockReturnValue({
      isRecording: true,
      audioBlob: null,
      error: null,
      duration: 5000,
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
    });

    render(<RecordPage />);
    const button = screen.getByText('Stop Recording');
    fireEvent.click(button);
    expect(mockStopRecording).toHaveBeenCalled();
  });

  it('displays error message when error occurs', () => {
    const errorMessage = 'Failed to access microphone';
    (useAudioRecorder as jest.Mock).mockReturnValue({
      isRecording: false,
      audioBlob: null,
      error: errorMessage,
      duration: 0,
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
    });

    render(<RecordPage />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveClass('text-red-500');
  });

  it('displays audio player when recording is complete', () => {
    const mockAudioBlob = new Blob(['mock audio data'], { type: 'audio/webm' });
    const mockUrl = 'blob:mock-url';
    URL.createObjectURL = jest.fn(() => mockUrl);

    (useAudioRecorder as jest.Mock).mockReturnValue({
      isRecording: false,
      audioBlob: mockAudioBlob,
      error: null,
      duration: 0,
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
    });

    render(<RecordPage />);
    const audioElement = screen.getByTestId('mock-button').parentElement?.querySelector('audio');
    expect(audioElement).toBeInTheDocument();
    expect(audioElement?.getAttribute('src')).toBe(mockUrl);
    expect(audioElement).toHaveClass('w-full');
  });

  it('passes correct maxDuration to useAudioRecorder', () => {
    render(<RecordPage />);
    expect(useAudioRecorder).toHaveBeenCalledWith({
      maxDuration: 60000,
    });
  });

  it('shows Time Limit Reached text when duration reaches 60000ms', () => {
    (useAudioRecorder as jest.Mock).mockReturnValue({
      isRecording: true,
      audioBlob: null,
      error: null,
      duration: 60000,
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
    });

    render(<RecordPage />);
    expect(screen.getByText('Time Limit Reached')).toBeInTheDocument();
  });

  it('disables the button when recording reaches time limit', () => {
    (useAudioRecorder as jest.Mock).mockReturnValue({
      isRecording: true,
      audioBlob: null,
      error: null,
      duration: 60000,
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
    });

    render(<RecordPage />);
    const button = screen.getByTestId('mock-button');
    expect(button).toBeDisabled();
  });

  it('continues to show Stop Recording text before reaching time limit', () => {
    (useAudioRecorder as jest.Mock).mockReturnValue({
      isRecording: true,
      audioBlob: null,
      error: null,
      duration: 59999,
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
    });

    render(<RecordPage />);
    expect(screen.getByText('Stop Recording')).toBeInTheDocument();
    const button = screen.getByTestId('mock-button');
    expect(button).not.toBeDisabled();
  });
});
