import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://edi:edi@localhost:5432/edi"),
  OPENAI_API_KEY: z.string().optional(),
  AI_CHAT_MODEL: z.string().default("gpt-4o-mini"),
  AI_EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_VOICE_ID: z.string().optional(),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(parsed.error.flatten());
  throw new Error("Invalid environment configuration");
}

export const env = {
  port: parsed.data.PORT,
  nodeEnv: parsed.data.NODE_ENV,
  databaseUrl: parsed.data.DATABASE_URL,
  openaiApiKey: parsed.data.OPENAI_API_KEY,
  chatModel: parsed.data.AI_CHAT_MODEL,
  embeddingModel: parsed.data.AI_EMBEDDING_MODEL,
  elevenLabsApiKey: parsed.data.ELEVENLABS_API_KEY,
  elevenLabsVoiceId: parsed.data.ELEVENLABS_VOICE_ID,
  corsOrigin: parsed.data.CORS_ORIGIN,
};
