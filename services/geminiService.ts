import { GoogleGenAI, Modality } from "@google/genai";

// Singleton to hold the AudioContext
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 24000,
    });
  }
  return audioContext;
};

// Simple Base64 decoding for raw PCM
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const speakText = async (text: string): Promise<void> => {
  try {
    if (!process.env.API_KEY) {
      console.warn("No API Key available for TTS");
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using flash-preview-tts for speech
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Friendly female voice
          },
        },
      },
    });

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return;

    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      ctx,
      24000,
      1,
    );

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start();

  } catch (error) {
    console.error("Error generating speech:", error);
  }
};

export const getEncouragement = async (score: number, gameType: string): Promise<string> => {
    if (!process.env.API_KEY) return "Great job!";
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a very short, single sentence enthusiastic praise for a 5-year-old child who just scored ${score} in a mouse game called ${gameType}. Keep it simple like "Wow, you popped 5 bubbles!"`,
        });
        return response.text || "Good job!";
    } catch (e) {
        console.error(e);
        return "You are doing great!";
    }
}
