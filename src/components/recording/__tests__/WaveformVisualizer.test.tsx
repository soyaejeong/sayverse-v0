import { render, act } from '@testing-library/react';
import { WaveformVisualizer } from '../WaveformVisualizer';

// Mock canvas context
const mockCanvasContext = {
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  fillRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  canvas: { width: 300, height: 96 },
  getContextAttributes: jest.fn(),
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'low' as ImageSmoothingQuality,
  getTransform: jest.fn(),
  resetTransform: jest.fn(),
  setTransform: jest.fn(),
} as unknown as CanvasRenderingContext2D;

// Mock Web Audio API
const mockAnalyser = {
  fftSize: 0,
  frequencyBinCount: 128,
  getByteTimeDomainData: jest.fn((array) => {
    // Fill with mock waveform data
    for (let i = 0; i < array.length; i++) {
      array[i] = 128; // Midpoint value
    }
  }),
} as unknown as AnalyserNode;

class MockAudioContext {
  destination: AudioDestinationNode;
  currentTime: number;
  state: AudioContextState;
  sampleRate: number;
  baseLatency: number;
  outputLatency: number;

  constructor() {
    this.destination = {} as AudioDestinationNode;
    this.currentTime = 0;
    this.state = 'running';
    this.sampleRate = 44100;
    this.baseLatency = 0;
    this.outputLatency = 0;
  }

  createAnalyser() {
    return mockAnalyser;
  }

  createMediaStreamSource() {
    return {
      connect: jest.fn(),
    } as unknown as MediaStreamAudioSourceNode;
  }

  close() {
    return Promise.resolve();
  }
}

const mockMediaStream = {} as MediaStream;

// Set up fake timers globally for the test file
jest.useFakeTimers();

// Mock requestAnimationFrame and cancelAnimationFrame
const mockRequestAnimationFrame = jest.fn((callback) => {
  return setTimeout(callback, 16) as unknown as number;
});

const mockCancelAnimationFrame = jest.fn((id) => {
  clearTimeout(id);
});

// Global mocks
global.AudioContext = MockAudioContext as unknown as typeof AudioContext;
global.requestAnimationFrame = mockRequestAnimationFrame;
global.cancelAnimationFrame = mockCancelAnimationFrame;

// Mock getUserMedia
const mockGetUserMedia = jest.fn(() =>
  Promise.resolve(mockMediaStream)
);

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
});

describe('WaveformVisualizer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset timers before each test
    jest.clearAllTimers();
    // Mock canvas ref
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((contextId) => {
      if (contextId === '2d') {
        return mockCanvasContext;
      }
      return null;
    });
  });

  it('renders canvas element with correct classes', () => {
    const { container } = render(<WaveformVisualizer isRecording={false} className="custom-class" />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveClass('w-full', 'h-24', 'custom-class');
  });

  it('initializes audio context and analyzer when recording starts', async () => {
    await act(async () => {
      render(<WaveformVisualizer isRecording={true} />);
      // Wait for all promises to resolve
      await Promise.resolve();
      // Advance timers to trigger initial animation frame
      jest.advanceTimersByTime(16);
    });

    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(mockAnalyser.fftSize).toBe(256);
  });

  it('does not initialize audio when not recording', () => {
    render(<WaveformVisualizer isRecording={false} />);
    expect(mockGetUserMedia).not.toHaveBeenCalled();
  });

  it('cleans up animation frame when unmounted', async () => {
    let animationFrameId: number = 0;
    
    mockRequestAnimationFrame.mockImplementation((callback) => {
      animationFrameId = setTimeout(callback, 16) as unknown as number;
      return animationFrameId;
    });

    const { unmount } = render(<WaveformVisualizer isRecording={true} />);

    await act(async () => {
      await Promise.resolve();
      jest.advanceTimersByTime(16);
      unmount();
    });

    expect(mockCancelAnimationFrame).toHaveBeenCalledWith(animationFrameId);
  });

  it('handles getUserMedia errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'));

    await act(async () => {
      render(<WaveformVisualizer isRecording={true} />);
      await Promise.resolve();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to setup audio analyzer:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('starts drawing when recording begins', async () => {
    await act(async () => {
      render(<WaveformVisualizer isRecording={true} />);
      await Promise.resolve();
      jest.advanceTimersByTime(16);
    });

    expect(mockCanvasContext.fillRect).toHaveBeenCalled();
    expect(mockCanvasContext.beginPath).toHaveBeenCalled();
    expect(mockCanvasContext.stroke).toHaveBeenCalled();
    expect(mockRequestAnimationFrame).toHaveBeenCalled();
  });

  it('stops animation when recording stops', async () => {
    let animationFrameId: number = 0;
    
    mockRequestAnimationFrame.mockImplementation((callback) => {
      animationFrameId = setTimeout(callback, 16) as unknown as number;
      return animationFrameId;
    });

    const { rerender } = render(<WaveformVisualizer isRecording={true} />);

    await act(async () => {
      await Promise.resolve();
      jest.advanceTimersByTime(16);
      rerender(<WaveformVisualizer isRecording={false} />);
    });

    
    expect(mockCancelAnimationFrame).toHaveBeenCalledWith(animationFrameId);
  });
});