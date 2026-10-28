import { Mistral } from "@mistralai/mistralai";
import { Buffer } from "node:buffer";
import { z } from "zod";

export const MistralVoicesEnum = {
  Kiko: "01a17e32-e7e9-7722-9822-f2e798c609ad",
  MarceloAvila: "01a17d80-0525-757c-8811-9f361e001946",
  Eneas: "01a17d69-88e8-74d1-8046-30ec5f15a8c9",
  Bolsonaro: "afab6cf3-b24b-4939-a533-8d8ceec35442",
} as const;

export type MistralVoicesEnum =
  (typeof MistralVoicesEnum)[keyof typeof MistralVoicesEnum];

const requestSchema = z.object({
  input: z.string().trim().min(1),
  voiceId: z.string().trim().min(1),
});
const audioSchema = z
  .string()
  .min(1)
  .regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/);

export interface SpeechGenerator {
  generate(text: string, voiceId: string): Promise<Uint8Array>;
}

export class InvalidSpeechRequestError extends Error {
  constructor() {
    super("Speech text and voice ID must not be empty");
    this.name = "InvalidSpeechRequestError";
  }
}

export class InvalidSpeechAudioError extends Error {
  constructor() {
    super("Mistral returned invalid base64 audio");
    this.name = "InvalidSpeechAudioError";
  }
}

export class SpeechGenerationError extends Error {
  constructor(cause: unknown) {
    super("Mistral speech generation failed", { cause });
    this.name = "SpeechGenerationError";
  }
}

export class MistralSpeech implements SpeechGenerator {
  constructor(private readonly client: Pick<Mistral, "audio">) {}

  async generate(text: string, voiceId: string): Promise<Uint8Array> {
    const request = requestSchema.safeParse({ input: text, voiceId });
    if (!request.success) throw new InvalidSpeechRequestError();

    const response = await this.client.audio.speech
      .complete(
        {
          ...request.data,
          model: "voxtral-mini-tts-3-0",
          responseFormat: "mp3",
          stream: false,
        },
        { timeoutMs: 30_000, retries: { strategy: "none" } },
      )
      .catch((cause: unknown) => {
        throw new SpeechGenerationError(cause);
      });

    const audio = audioSchema.safeParse(response.audioData);
    if (!audio.success) throw new InvalidSpeechAudioError();

    const bytes = Buffer.from(audio.data, "base64");
    if (bytes.toString("base64") !== audio.data)
      throw new InvalidSpeechAudioError();

    return new Uint8Array(bytes);
  }
}
