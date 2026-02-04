'use client';

import { cn } from '@/lib/utils';
import {
  useConnectionState,
  useLocalParticipant,
} from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import { Mic, MicOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AudioVisualizerProps {
  className?: string;
  barCount?: number;
  minBarHeight?: number;
  maxBarHeight?: number;
}

// Helper to create audio context (handles webkit prefix)
function createAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  try {
    if (window.AudioContext) {
      return new window.AudioContext();
    }

    // Fallback for older webkit browsers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const webkitAC = (window as any).webkitAudioContext as
      | typeof AudioContext
      | undefined;
    if (webkitAC) {
      return new webkitAC();
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Real-time audio visualizer component for microphone input.
 * Shows animated bars that respond to the user's voice volume.
 *
 * FEATURES:
 * - Real-time audio level visualization
 * - Smooth animation using requestAnimationFrame
 * - Visual indication when muted
 * - Automatic cleanup on disconnect
 */
export function AudioVisualizer({
  className,
  barCount = 5,
  minBarHeight = 4,
  maxBarHeight = 24,
}: AudioVisualizerProps) {
  const { localParticipant, microphoneTrack } = useLocalParticipant();
  const connectionState = useConnectionState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);

  const isConnected = connectionState === ConnectionState.Connected;
  const isMicrophoneEnabled = localParticipant?.isMicrophoneEnabled ?? false;

  // Initialize audio analysis
  useEffect(() => {
    if (!isConnected || !isMicrophoneEnabled || !microphoneTrack) {
      setHasAudio(false);
      return;
    }

    const track = microphoneTrack.track;
    if (!track || !track.mediaStream) {
      setHasAudio(false);
      return;
    }

    setHasAudio(true);

    // Create audio context and analyser
    const audioContext = createAudioContext();
    if (!audioContext) {
      setHasAudio(false);
      return;
    }
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 64; // Small size for performance
    analyser.smoothingTimeConstant = 0.8; // Smooth transitions
    analyserRef.current = analyser;

    // Connect the microphone stream
    const source = audioContext.createMediaStreamSource(track.mediaStream);
    source.connect(analyser);
    sourceRef.current = source;

    return () => {
      // Cleanup
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      source?.disconnect();
      analyser?.disconnect();
      void audioContext?.close();
      audioContextRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
    };
  }, [isConnected, isMicrophoneEnabled, microphoneTrack]);

  // Animation loop
  useEffect(() => {
    if (!hasAudio || !analyserRef.current || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      // Get audio data
      analyser.getByteFrequencyData(dataArray);

      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const volume = average / 255; // Normalize to 0-1

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw bars
      const barWidth = (canvas.width / barCount) * 0.6;
      const gap = (canvas.width / barCount) * 0.4;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      for (let i = 0; i < barCount; i++) {
        // Calculate bar height based on volume with some variation per bar
        const barIndex = Math.floor((i / barCount) * bufferLength);
        const barValue = dataArray[barIndex] || 0;
        const barVolume = barValue / 255;

        // Smooth height calculation
        const targetHeight =
          minBarHeight + barVolume * (maxBarHeight - minBarHeight);
        const height = Math.max(minBarHeight, targetHeight);

        const x =
          centerX -
          (barCount * (barWidth + gap)) / 2 +
          i * (barWidth + gap) +
          gap / 2;
        const y = centerY - height / 2;

        // Draw bar with gradient
        const gradient = ctx.createLinearGradient(0, y + height, 0, y);
        gradient.addColorStop(0, 'rgb(99, 102, 241)'); // Indigo-500
        gradient.addColorStop(1, 'rgb(168, 85, 247)'); // Purple-500

        ctx.fillStyle = gradient;

        // Rounded rectangle
        const radius = barWidth / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, height, radius);
        ctx.fill();
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [hasAudio, barCount, minBarHeight, maxBarHeight]);

  // Update muted state
  useEffect(() => {
    setIsMuted(!isMicrophoneEnabled);
  }, [isMicrophoneEnabled]);

  // Show muted state
  if (isMuted || !isConnected) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <MicOff className="w-4 h-4 text-muted-foreground" />
        </div>
        <span className="text-xs text-muted-foreground">Muted</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <canvas
        ref={canvasRef}
        width={barCount * 8}
        height={maxBarHeight + 4}
        className="rounded"
      />
      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
        <Mic className="w-3 h-3 text-primary" />
      </div>
    </div>
  );
}

/**
 * Simple audio level indicator (dot that pulses with audio)
 */
export function AudioLevelIndicator({
  className,
}: {
  className?: string;
}) {
  const { localParticipant, microphoneTrack } = useLocalParticipant();
  const connectionState = useConnectionState();
  const [level, setLevel] = useState(0);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const isConnected = connectionState === ConnectionState.Connected;
  const isMicrophoneEnabled = localParticipant?.isMicrophoneEnabled ?? false;

  useEffect(() => {
    if (!isConnected || !isMicrophoneEnabled || !microphoneTrack) {
      setLevel(0);
      return;
    }

    const track = microphoneTrack.track;
    if (!track || !track.mediaStream) {
      setLevel(0);
      return;
    }

    // Create audio context and analyser
    const audioContext = createAudioContext();
    if (!audioContext) {
      setLevel(0);
      return;
    }

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 32;
    analyser.smoothingTimeConstant = 0.5;
    analyserRef.current = analyser;

    // Connect the microphone stream
    const source = audioContext.createMediaStreamSource(track.mediaStream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      animationRef.current = requestAnimationFrame(updateLevel);

      analyser.getByteFrequencyData(dataArray);

      // Calculate average
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      setLevel(average / 255);
    };

    updateLevel();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      source.disconnect();
      void audioContext.close();
    };
  }, [isConnected, isMicrophoneEnabled, microphoneTrack]);

  const isActive = level > 0.1;
  const scale = 0.5 + level * 0.5; // Scale from 0.5 to 1.0

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Outer ring that pulses */}
      {isActive && (
        <span
          className="absolute inline-flex h-full w-full rounded-full bg-primary/30 animate-ping"
          style={{
            opacity: level * 0.6,
            transform: `scale(${1 + level * 0.3})`,
          }}
        />
      )}

      {/* Main dot */}
      <span
        className={cn(
          'relative inline-flex rounded-full h-3 w-3 transition-all duration-75',
          isMicrophoneEnabled
            ? isActive
              ? 'bg-primary'
              : 'bg-primary/50'
            : 'bg-muted-foreground/30'
        )}
        style={{
          transform: `scale(${isMicrophoneEnabled ? scale : 1})`,
        }}
      />
    </div>
  );
}

/**
 * Hook to get current audio level (0-1)
 */
export function useAudioLevel() {
  const { localParticipant, microphoneTrack } = useLocalParticipant();
  const connectionState = useConnectionState();
  const [level, setLevel] = useState(0);
  const animationRef = useRef<number | null>(null);

  const isConnected = connectionState === ConnectionState.Connected;
  const isMicrophoneEnabled = localParticipant?.isMicrophoneEnabled ?? false;

  useEffect(() => {
    if (!isConnected || !isMicrophoneEnabled || !microphoneTrack) {
      setLevel(0);
      return;
    }

    const track = microphoneTrack.track;
    if (!track || !track.mediaStream) {
      setLevel(0);
      return;
    }

    const audioContext = createAudioContext();
    if (!audioContext) {
      setLevel(0);
      return;
    }

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 32;
    analyser.smoothingTimeConstant = 0.5;

    const source = audioContext.createMediaStreamSource(track.mediaStream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      animationRef.current = requestAnimationFrame(updateLevel);

      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      setLevel(average / 255);
    };

    updateLevel();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      source.disconnect();
      void audioContext.close();
    };
  }, [isConnected, isMicrophoneEnabled, microphoneTrack]);

  return {
    level,
    isActive: level > 0.1,
    isMuted: !isMicrophoneEnabled || !isConnected,
  };
}
