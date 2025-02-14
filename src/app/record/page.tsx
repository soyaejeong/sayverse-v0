// src/app/record/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WaveformVisualizer } from "@/components/recording/WaveformVisualizer";
import { RecordingTimer } from "@/components/recording/RecordingTimer";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { Mic, Square } from "lucide-react";

export default function RecordPage() {
  const {
    isRecording,
    audioBlob,
    error,
    duration,
    startRecording,
    stopRecording
  } = useAudioRecorder({
    maxDuration: 60000, // 60 seconds
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Record Your Voice</h2>
            
            <WaveformVisualizer 
              isRecording={isRecording} 
              className="mb-6"
            />
            
            <RecordingTimer 
              duration={duration} 
              className="mb-4"
            />

            {error && (
              <div className="text-red-500 mb-4">
                {error}
              </div>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isRecording && duration >= 60000}
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  {duration >= 60000 ? 'Time Limit Reached' : 'Stop Recording'}
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Recording
                </>
              )}
            </Button>

            {audioBlob && !isRecording && (
              <div className="mt-4">
                <audio
                  src={URL.createObjectURL(audioBlob)}
                  controls
                  className="w-full"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}