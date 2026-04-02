import React, { useState } from 'react';
import { Volume2, Loader2, VolumeX } from 'lucide-react';
import { playSpeech } from '../services/ttsService';
import { toast } from 'sonner';

interface SpeakButtonProps {
  text: string;
  voiceId?: string;
  className?: string;
}

export const SpeakButton: React.FC<SpeakButtonProps> = ({ text, voiceId, className }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = async () => {
    if (!text) return;
    setIsPlaying(true);
    try {
      await playSpeech(text, voiceId);
    } catch (error) {
      console.error("TTS playback error:", error);
      toast.error("Failed to play speech");
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <button
      onClick={handleSpeak}
      disabled={isPlaying}
      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
      title="Read Aloud"
    >
      {isPlaying ? (
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
      ) : (
        <Volume2 className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
};
