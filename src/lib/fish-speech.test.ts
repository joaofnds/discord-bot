import { describe, expect, it } from "bun:test";
import {
  FishSpeech,
  FishSpeechHTTPError,
  SpeechGenerationError,
} from "./fish-speech.ts";

const audio = new Uint8Array([82, 73, 70, 70, 4, 0, 0, 0, 87, 65, 86, 69]);
const referenceId = "3ac673c5ea474038bed1b11f6dc95974";

class FakeHTTPClient {
  requests: Request[] = [];
  response = new Response(audio, { headers: { "content-type": "audio/wav" } });
  failure?: DOMException;

  request(request: Request): Promise<Response> {
    this.requests.push(request);
    if (this.failure) return Promise.reject(this.failure);
    return Promise.resolve(this.response);
  }
}

function setup() {
  const http = new FakeHTTPClient();
  const speech = new FishSpeech("test-key", (request) => http.request(request));
  return { http, speech };
}

describe("FishSpeech", () => {
  it("requests Drama 3 WAV audio and preserves direction tags", async () => {
    const { http, speech } = setup();
    const text = "[playful] Olá! [angry][speaking quickly] Até amanhã!";

    expect(await speech.generate(text, referenceId)).toEqual(audio);
    expect(http.requests.length).toEqual(1);
    const request = http.requests[0];
    expect({
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers),
    }).toEqual({
      url: "https://api.fish.audio/v1/tts",
      method: "POST",
      headers: {
        authorization: "Bearer test-key",
        "content-type": "application/json",
        model: "drama-3",
      },
    });
    expect(await request.json()).toEqual({
      text,
      reference_id: referenceId,
      format: "wav",
      latency: "normal",
    });
    expect(request.signal.aborted).toEqual(false);
  });

  it("returns the response bytes without inspecting their format", async () => {
    const { http, speech } = setup();
    const bytes = new Uint8Array([1, 2, 3]);
    http.response = new Response(bytes);

    expect(await speech.generate("hello", referenceId)).toEqual(bytes);
  });

  describe("provider failures", () => {
    for (const status of [401, 402, 429, 500, 503]) {
      it(`rejects HTTP ${status} without retrying`, async () => {
        const { http, speech } = setup();
        http.response = new Response("private provider details", { status });
        await expect(speech.generate("hello", referenceId)).rejects.toThrow(
          new FishSpeechHTTPError(status),
        );
        expect(http.requests.length).toEqual(1);
      });
    }

    for (const name of ["NetworkError", "TimeoutError", "AbortError"]) {
      it(`maps ${name} without retrying`, async () => {
        const { http, speech } = setup();
        http.failure = new DOMException("request failed", name);
        await expect(speech.generate("hello", referenceId)).rejects.toThrow(
          SpeechGenerationError,
        );
        expect(http.requests.length).toEqual(1);
      });
    }

    it("maps failures while reading the response body", async () => {
      const { http, speech } = setup();
      http.response = new Response(
        new ReadableStream({
          start(controller) {
            controller.error(
              new DOMException("stream interrupted", "NetworkError"),
            );
          },
        }),
      );
      await expect(speech.generate("hello", referenceId)).rejects.toThrow(
        SpeechGenerationError,
      );
    });
  });
});
