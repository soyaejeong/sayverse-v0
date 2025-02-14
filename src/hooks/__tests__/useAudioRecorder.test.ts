import { renderHook, act } from '@testing-library/react';
import { useAudioRecorder } from '../useAudioRecorder';

// Mock MediaRecorder events
let mockMediaRecorder: MockMediaRecorder | null = null;
let dataAvailableCallback: ((e: { data: Blob }) => void) | null = null;
let stopCallback: (() => void) | null = null;

// Mock MediaRecorder implementation
class MockMediaRecorder {
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  state: 'inactive' | 'recording' = 'inactive';

  constructor(public stream: MediaStream, public options: { mimeType: string }) {
    mockMediaRecorder = this;
  }

  start(timeslice?: number) {
    this.state = 'recording';
    if (this.ondataavailable) {
      dataAvailableCallback = this.ondataavailable;
    }
    if (this.onstop) {
      stopCallback = this.onstop;
    }
  }

  stop() {
    this.state = 'inactive';
    if (this.onstop) {
      this.onstop();
    }
  }
}

// Mock MediaStream
const mockTrack = { stop: jest.fn() };
const mockMediaStream = { getTracks: () => [mockTrack] };

// Mock getUserMedia
const mockGetUserMedia = jest.fn(() => Promise.resolve(mockMediaStream));

// Mock setInterval implementation
let intervalCallback: (() => void) | null = null;
const mockSetInterval = jest.fn((callback, delay) => {
  intervalCallback = callback;
  return 123; // Return a dummy timer ID
});

const mockClearInterval = jest.fn();

// Setup global mocks
global.MediaRecorder = MockMediaRecorder as unknown as typeof MediaRecorder;
global.window.setInterval = mockSetInterval as unknown as typeof setInterval;
global.window.clearInterval = mockClearInterval;

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: { getUserMedia: mockGetUserMedia },
  configurable: true,
});

// Mock Date.now
let currentTime = 1000;
const mockNow = jest.fn(() => currentTime);
global.Date.now = mockNow;

describe('useAudioRecorder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMediaRecorder = null;
    dataAvailableCallback = null;
    stopCallback = null;
    mockTrack.stop.mockClear();
    intervalCallback = null;
    currentTime = 1000;
  });

  // ... (keep other test cases the same)

  it('updates duration while recording', async () => {
    const onTimeUpdate = jest.fn();
    const { result } = renderHook(() => 
      useAudioRecorder({ onTimeUpdate })
    );

    await act(async () => {
      await result.current.startRecording();
    });

    // Wait for interval to be set up
    await act(async () => {
      await Promise.resolve();
    });

    // Simulate time passing
    currentTime = 2000; // Advance 1 second
    
    await act(async () => {
      if (intervalCallback) {
        intervalCallback();
      }
      // Wait for state updates to propagate
      await Promise.resolve();
    });

    expect(result.current.duration).toBe(1000);
    expect(onTimeUpdate).toHaveBeenCalledWith(1000);
  });

  it('stops recording when maxDuration is reached', async () => {
    const maxDuration = 2000;
    const { result } = renderHook(() => 
      useAudioRecorder({ maxDuration })
    );

    await act(async () => {
      await result.current.startRecording();
    });

    // Simulate time passing beyond maxDuration
    currentTime = 3100;
    
    await act(async () => {
      if (intervalCallback) {
        intervalCallback();
      }
      // Wait for state updates to propagate
      await Promise.resolve();
      
      // Simulate the MediaRecorder stop completing
      if (stopCallback) {
        stopCallback();
      }
    });

    expect(mockMediaRecorder?.state).toBe('inactive');
    expect(result.current.isRecording).toBe(false);
    expect(result.current.duration).toBe(0);
    expect(mockClearInterval).toHaveBeenCalled();
  });

  it('resets duration when stopping recording', async () => {
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    // Check state after starting
    expect(result.current.duration).toBe(0);

    // Simulate time passing
    currentTime = 2000;
    
    await act(async () => {
      if (intervalCallback) { 
        intervalCallback();
      }
      // Wait for state updates to propagate
      await Promise.resolve();
    });

    // Check state after time passed
    expect(result.current.duration).toBe(1000);

    await act(async () => {
      result.current.stopRecording();
      // Simulate the MediaRecorder stop completing
      if (stopCallback) {
        stopCallback();
      }
      // Wait for state updates to propagate
      await Promise.resolve();
    });

    // Check final state
    expect(result.current.duration).toBe(0);
    expect(mockClearInterval).toHaveBeenCalled();
  });
});
