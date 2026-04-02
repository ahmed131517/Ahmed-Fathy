export const generateSpeech = async (text: string, voiceId?: string): Promise<string> => {
  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, voiceId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate speech");
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error("TTS service error:", error);
    throw error;
  }
};

export const playSpeech = async (text: string, voiceId?: string): Promise<void> => {
  try {
    const audioUrl = await generateSpeech(text, voiceId);
    const audio = new Audio(audioUrl);
    await audio.play();
  } catch (error) {
    console.error("Play speech error:", error);
    throw error;
  }
};
