"use client";

import { VoiceOrb } from "../voice-mode-chat";
import { useAudioLevel } from "./audio-visualizer";

interface VoiceChatIndicatorProps {
  isAgentSpeaking?: boolean;
}

/**
 * LiveKit-aware voice indicator for the VoiceModeChat.
 * Must be rendered inside LiveKitProvider when voice is connected.
 * Uses real-time audio levels from the microphone to drive the VoiceOrb animation.
 */
export function VoiceChatIndicator({
  isAgentSpeaking = false,
}: VoiceChatIndicatorProps) {
  const { level, isActive, isMuted } = useAudioLevel();

  return (
    <VoiceOrb
      audioLevel={level}
      isUserSpeaking={isActive}
      isAgentSpeaking={isAgentSpeaking}
      isMuted={isMuted}
    />
  );
}
