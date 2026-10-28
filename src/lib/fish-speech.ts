import { SpeechGenerator } from "./speech-generator.ts";

export class FishSpeechHTTPError extends Error {
  constructor(readonly status: number) {
    super(`Fish Audio returned HTTP ${status}`);
    this.name = "FishSpeechHTTPError";
  }
}

export class SpeechGenerationError extends Error {
  constructor(cause: unknown) {
    super("Fish speech generation failed", { cause });
    this.name = "SpeechGenerationError";
  }
}

export class FishSpeech implements SpeechGenerator {
  constructor(
    private readonly apiKey: string,
    private readonly fetch: (request: Request) => Promise<Response>,
  ) {}

  async generate(text: string, voiceId: string): Promise<Uint8Array> {
    const response = await this.fetch(
      new Request("https://api.fish.audio/v1/tts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          model: "drama-3",
        },
        body: JSON.stringify({
          text,
          reference_id: voiceId,
          format: "wav",
          latency: "normal",
        }),
        signal: AbortSignal.timeout(30_000),
      }),
    ).catch((cause: unknown) => {
      throw new SpeechGenerationError(cause);
    });
    if (!response.ok) throw new FishSpeechHTTPError(response.status);

    return await response
      .arrayBuffer()
      .then((buffer) => new Uint8Array(buffer))
      .catch((cause: unknown) => {
        throw new SpeechGenerationError(cause);
      });
  }
}
