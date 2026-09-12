import { env } from "../../config/env.js";

/**
 * Person D — ElevenLabs TTS.
 * Skeleton returns script-only until API key is configured.
 */
export async function synthesizeBrief(script: string) {
  if (!env.elevenLabsApiKey) {
    return {
      stub: true,
      audio_url: null as string | null,
      message: "TODO Person D: call ElevenLabs when ELEVENLABS_API_KEY is set",
      script,
    };
  }

  // TODO: POST to ElevenLabs text-to-speech, store/return audio URL
  return {
    stub: true,
    audio_url: null as string | null,
    message: "ElevenLabs client not implemented yet",
    script,
  };
}
