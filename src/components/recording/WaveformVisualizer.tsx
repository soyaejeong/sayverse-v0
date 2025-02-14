// src/components/recording/WaveformVisualizer.tsx
import { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isRecording: boolean;
  className?: string;
}

export function WaveformVisualizer({ isRecording, className = '' }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!isRecording) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const setupAnalyzer = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyzer = audioContext.createAnalyser();
        
        analyzer.fftSize = 256;
        source.connect(analyzer);
        
        analyzerRef.current = analyzer;
        dataArrayRef.current = new Uint8Array(analyzer.frequencyBinCount);
        
        draw();
      } catch (error) {
        console.error('Failed to setup audio analyzer:', error);
      }
    };

    setupAnalyzer();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording]);

  const draw = () => {
    if (!canvasRef.current || !analyzerRef.current || !dataArrayRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyzer = analyzerRef.current;
    const dataArray = dataArrayRef.current;

    analyzer.getByteTimeDomainData(dataArray);

    ctx.fillStyle = 'rgb(249, 250, 251)'; // gray-50
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(59, 130, 246)'; // blue-500
    ctx.beginPath();

    const sliceWidth = canvas.width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    animationRef.current = requestAnimationFrame(draw);
  };

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-24 ${className}`}
      width={300}
      height={96}
    />
  );
}