// useAudioRecorder.ts
import { useState, useRef, useCallback } from 'react';

interface UseAudioRecorderProps {
  maxDuration?: number; // Maximum recording duration in milliseconds (default: 60000ms/60s)
  onTimeUpdate?: (time: number) => void; // Callback function to handle time updates
}

export function useAudioRecorder({ 
  maxDuration = 60000,
  onTimeUpdate 
}: UseAudioRecorderProps = {}) {
  // State management for recording status and data
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  // Refs to persist values across renders without causing re-renders
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]); // Store audio chunks during recording
  const startTime = useRef<number>(0); // Track when recording started
  const timer = useRef<number>(0); // Store interval ID for cleanup
  const shouldResetDuration = useRef(false); // Flag to determine if duration should reset on stop

  // Common function to handle cleanup when stopping recording
  const cleanupRecording = useCallback((shouldResetOnStop: boolean = false, skipStop: boolean = false) => {
    if (mediaRecorder.current?.state === 'recording') {
      // Only call stop() if not skipping (for maxDuration case)
      if (!skipStop) {
        mediaRecorder.current.stop();
      }
      
      // Stop all audio tracks
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      
      // Clear the update interval
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = 0;
      }
      
      // Update recording state
      setIsRecording(false);
      
      // Set flag for duration reset if needed
      shouldResetDuration.current = shouldResetOnStop;
    }
  }, []);

  // Function to stop recording and cleanup resources
  // When manually stopping recording:
  // - We want to reset the duration to 0
  // - We want to execute the MediaRecorder's stop method
  // - We want to clean up all resources (tracks, intervals)
  const stopRecording = useCallback(() => {
    cleanupRecording(true, false); // Set shouldResetOnStop to true to ensure duration resets
  }, [cleanupRecording]);

  // Function to update recording duration and check for max duration
  const updateTime = useCallback(() => {
    // Only update if we have a start time and MediaRecorder is actually recording
    if (!startTime.current || mediaRecorder.current?.state !== 'recording') return;
    
    const currentTime = Date.now();
    const elapsed = currentTime - startTime.current;
    
    // If we've exceeded maxDuration:
    // 1. Stop the MediaRecorder (skipStop = false)
    // 2. Reset the duration (shouldResetOnStop = true)
    // 3. Clean up resources (tracks, intervals)
    if (elapsed >= maxDuration) {
      cleanupRecording(true, false);
      return;
    }
    
    // Update duration state and call onTimeUpdate callback
    setDuration(elapsed);
    onTimeUpdate?.(elapsed);
  }, [maxDuration, onTimeUpdate, cleanupRecording]);

  // Function to start recording
  const startRecording = useCallback(async () => {
    try {
      // Reset audio chunks array
      chunks.current = [];
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create new MediaRecorder instance
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });

      // Handle data available event
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      // Handle recording stop event
      mediaRecorder.current.onstop = () => {
        // Combine all chunks into final audio blob
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // Reset duration immediately if needed
        if (shouldResetDuration.current) {
          setDuration(0);
          shouldResetDuration.current = false;
        }
      };

      // Start recording
      mediaRecorder.current.start(100); // Collect data every 100ms
      startTime.current = Date.now();
      // Set up interval for duration updates
      timer.current = window.setInterval(updateTime, 100);
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  }, [updateTime]);

  return {
    isRecording,
    audioBlob,
    error,
    duration,
    startRecording,
    stopRecording
  };
}
