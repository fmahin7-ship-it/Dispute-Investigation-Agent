import { env } from "../../config/env.js";
import { AppError } from "../../middleware/errorHandler.js";

/** Default ElevenLabs voice (Rachel) when ELEVENLABS_VOICE_ID unset. */
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const TTS_MODEL = "eleven_multilingual_v2";

export type BriefAudioResult = {
  stub: boolean;
  audio_url: string | null;
  audio_base64: string | null;
  mime_type: string;
  message: string;
  script: string;
};

/**
 * ElevenLabs TTS for manager "Brief me".
 * Returns a data URL so the desk can play audio without object storage.
 */
export async function synthesizeBrief(script: string): Promise<BriefAudioResult> {
  if (!env.elevenLabsApiKey) {
    return {
      stub: true,
      audio_url: null,
      audio_base64: null,
      mime_type: "audio/mpeg",
      message:
        "ELEVENLABS_API_KEY not set — showing script only. Add the key to backend/.env for live voice.",
      script,
    };
  }

  const voiceId = env.elevenLabsVoiceId?.trim() || DEFAULT_VOICE_ID;
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": env.elevenLabsApiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: script,
      model_id: TTS_MODEL,
      voice_settings: {
        stability: 0.45,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new AppError(
      502,
      `ElevenLabs TTS failed (${res.status}): ${detail.slice(0, 240) || res.statusText}`,
      "ELEVENLABS_TTS_FAILED"
    );
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const audio_base64 = buffer.toString("base64");
  const mime_type = "audio/mpeg";
  const audio_url = `data:${mime_type};base64,${audio_base64}`;

  return {
    stub: false,
    audio_url,
    audio_base64,
    mime_type,
    message: "Voice brief ready",
    script,
  };
}
