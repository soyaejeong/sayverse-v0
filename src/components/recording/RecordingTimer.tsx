interface RecordingTimerProps {
    duration: number;
    className?: string;
  }
  
  export function RecordingTimer({ duration, className = '' }: RecordingTimerProps) {
    const seconds = Math.floor(duration / 1000);
    const milliseconds = Math.floor((duration % 1000) / 10);
  
    return (
      <div className={`font-mono text-lg ${className}`}>
        {String(seconds).padStart(2, '0')}:
        {String(milliseconds).padStart(2, '0')}
      </div>
    );
  }