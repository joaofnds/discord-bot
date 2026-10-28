import { Speech } from "@mistralai/mistralai/sdk/speech.js";
import { HTTPClient } from "@mistralai/mistralai/lib/http.js";
import { describe, expect, it } from "bun:test";
import {
  InvalidSpeechAudioError,
  InvalidSpeechRequestError,
  MistralSpeech,
  SpeechGenerationError,
} from "./mistral-speech.ts";

class FakeHTTPClient extends HTTPClient {
  requests: Request[] = [];
  response = Response.json({ audio_data: "SUQz" });

  override request(request: Request): Promise<Response> {
    this.requests.push(request);
    return Promise.resolve(this.response);
  }
}

function setup() {
  const httpClient = new FakeHTTPClient();
  const sdk = new Speech({ apiKey: "test-key", httpClient });
  return { httpClient, speech: new MistralSpeech(sdk) };
}

describe("MistralSpeech", () => {
  it("requests WAV speech with the UI model and decodes the audio", async () => {
    const { httpClient, speech } = setup();

    expect(await speech.generate("Olá", "custom-voice")).toEqual(
      new Uint8Array([73, 68, 51]),
    );
    expect(httpClient.requests.length).toEqual(1);
    const request = httpClient.requests[0];
    expect(request.url).toEqual("https://api.mistral.ai/v1/audio/speech");
    expect(request.method).toEqual("POST");
    expect(request.headers.get("authorization")).toEqual("Bearer test-key");
    expect(await request.json()).toEqual({
      model: "voxtral-mini-tts-latest",
      input: "Olá",
      voice_id: "custom-voice",
      response_format: "wav",
      stream: false,
    });
  });

  describe("invalid input", () => {
    for (const [text, voiceId] of [
      [" ", "voice"],
      ["hello", " "],
    ]) {
      it(`rejects ${JSON.stringify([text, voiceId])} before HTTP`, async () => {
        const { httpClient, speech } = setup();
        await expect(speech.generate(text, voiceId)).rejects.toThrow(
          InvalidSpeechRequestError,
        );
        expect(httpClient.requests).toEqual([]);
      });
    }
  });

  describe("invalid audio", () => {
    for (const audioData of ["", "not base64!", "Zg", "===="]) {
      it(`rejects ${JSON.stringify(audioData)}`, async () => {
        const { httpClient, speech } = setup();
        httpClient.response = Response.json({ audio_data: audioData });
        await expect(speech.generate("hello", "voice")).rejects.toThrow(
          InvalidSpeechAudioError,
        );
      });
    }
  });

  describe("provider failures", () => {
    for (const status of [401, 429, 500]) {
      it(`maps HTTP ${status} without retries`, async () => {
        const { httpClient, speech } = setup();
        httpClient.response = Response.json({ message: "failed" }, { status });
        await expect(speech.generate("hello", "voice")).rejects.toThrow(
          SpeechGenerationError,
        );
        expect(httpClient.requests.length).toEqual(1);
      });
    }

    it("maps an invalid response shape", async () => {
      const { httpClient, speech } = setup();
      httpClient.response = Response.json({ unexpected: true });
      await expect(speech.generate("hello", "voice")).rejects.toThrow(
        SpeechGenerationError,
      );
    });
  });
});
