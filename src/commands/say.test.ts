import { describe, expect, it } from "bun:test";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  MessageFlags,
} from "discord.js";
import { Buffer } from "node:buffer";
import { SpeechGenerationError } from "../lib/fish-speech.ts";
import { fishVoices } from "../lib/fish-voices.ts";
import { SpeechGenerator } from "../lib/speech-generator.ts";
import {
  SayAutocompleteInteraction,
  SayCommand,
  SayDeliveryError,
  SayInteraction,
  SayReply,
  sayCommand,
} from "./say.ts";

class FakeSpeechGenerator implements SpeechGenerator {
  requests: { text: string; voiceId: string }[] = [];
  audio = new Uint8Array([73, 68, 51]);
  fail = false;

  generate(text: string, voiceId: string): Promise<Uint8Array> {
    this.requests.push({ text, voiceId });
    if (this.fail)
      return Promise.reject(
        new SpeechGenerationError("private provider details"),
      );
    return Promise.resolve(this.audio);
  }
}

class FakeSayInteraction implements SayInteraction {
  slug = "eneas";
  text = "Olá pessoal!";
  attachmentSizeLimit = 1024;
  events: unknown[] = [];
  failDefer = false;
  failEdit = false;
  options = {
    getString: (name: string): string => {
      if (name === "voice") return this.slug;
      return this.text;
    },
  };

  deferReply(): Promise<void> {
    this.events.push("defer");
    if (this.failDefer) return Promise.reject(new SayDeliveryError());
    return Promise.resolve();
  }

  reply(payload: {
    content: string;
    flags: typeof MessageFlags.Ephemeral;
  }): Promise<void> {
    this.events.push({ reply: payload });
    return Promise.resolve();
  }

  editReply(payload: SayReply): Promise<void> {
    this.events.push({ edit: payload });
    if (this.failEdit) return Promise.reject(new SayDeliveryError());
    return Promise.resolve();
  }
}

class FakeAutocompleteInteraction implements SayAutocompleteInteraction {
  query = "";
  choices: { name: string; value: string }[] = [];
  fail = false;
  options = { getFocused: (): string => this.query };

  respond(choices: { name: string; value: string }[]): Promise<void> {
    if (this.fail) return Promise.reject(new SayDeliveryError());
    this.choices = choices;
    return Promise.resolve();
  }
}

const voices = Object.entries(fishVoices).map(([slug, voice]) => ({
  slug,
  ...voice,
}));

function choice(voice: { slug: string; name: string }) {
  return { name: voice.name, value: voice.slug };
}

describe("say command definition", () => {
  it("registers required voice autocomplete and text options", () => {
    expect(JSON.parse(JSON.stringify(sayCommand.toJSON()))).toEqual({
      type: ApplicationCommandType.ChatInput,
      name: "say",
      description: "Generate a speech audio file",
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: "voice",
          description: "The voice slug to use",
          required: true,
          autocomplete: true,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: "text",
          description: "The text to speak (up to 4000 characters)",
          required: true,
          min_length: 1,
          max_length: 4000,
        },
      ],
    });
  });
});

describe("SayCommand autocomplete", () => {
  it("limits empty searches to Discord's 25 choices", async () => {
    const interaction = new FakeAutocompleteInteraction();
    const speech = new FakeSpeechGenerator();
    await new SayCommand(speech).autocomplete(interaction);
    expect(interaction.choices).toEqual(voices.slice(0, 25).map(choice));
    expect(speech.requests).toEqual([]);
  });

  for (const voice of voices) {
    it(`finds ${voice.slug}`, async () => {
      const interaction = new FakeAutocompleteInteraction();
      interaction.query = voice.slug;
      await new SayCommand(new FakeSpeechGenerator()).autocomplete(interaction);
      expect(interaction.choices).toEqual(
        voices
          .filter((candidate) => candidate.slug.includes(voice.slug))
          .map(choice),
      );
    });
  }

  it("matches display names without case or accent differences", async () => {
    const interaction = new FakeAutocompleteInteraction();
    interaction.query = "  CAPITÃO  ";
    await new SayCommand(new FakeSpeechGenerator()).autocomplete(interaction);
    expect(interaction.choices).toEqual([
      {
        name: "Capitão Nascimento",
        value: "capitao-nascimento",
      },
    ]);
  });

  it("returns no choices for an unknown query", async () => {
    const interaction = new FakeAutocompleteInteraction();
    interaction.query = "unknown";
    await new SayCommand(new FakeSpeechGenerator()).autocomplete(interaction);
    expect(interaction.choices).toEqual([]);
  });

  it("maps Discord response failures", async () => {
    const interaction = new FakeAutocompleteInteraction();
    interaction.fail = true;
    await expect(
      new SayCommand(new FakeSpeechGenerator()).autocomplete(interaction),
    ).rejects.toThrow(SayDeliveryError);
  });
});

describe("SayCommand", () => {
  for (const voice of voices) {
    it(`sends a WAV file using ${voice.slug}`, async () => {
      const speech = new FakeSpeechGenerator();
      const interaction = new FakeSayInteraction();
      interaction.slug = voice.slug;
      await new SayCommand(speech).handle(interaction);
      expect(speech.requests).toEqual([
        { text: interaction.text, voiceId: voice.id },
      ]);
      expect(interaction.events).toEqual([
        "defer",
        {
          edit: {
            files: [
              { attachment: Buffer.from(speech.audio), name: "speech.wav" },
            ],
            allowedMentions: { parse: [] },
          },
        },
      ]);
    });
  }

  it("accepts exactly 4000 characters", async () => {
    const speech = new FakeSpeechGenerator();
    const interaction = new FakeSayInteraction();
    interaction.text = "a".repeat(4000);
    await new SayCommand(speech).handle(interaction);
    expect(speech.requests).toEqual([
      { text: interaction.text, voiceId: fishVoices.eneas.id },
    ]);
  });

  it("preserves performance cues and trims outer whitespace", async () => {
    const speech = new FakeSpeechGenerator();
    const interaction = new FakeSayInteraction();
    interaction.text = "  [angry] Olá! [speaking quickly] Tudo bem?  ";
    await new SayCommand(speech).handle(interaction);
    expect(speech.requests).toEqual([
      {
        text: "[angry] Olá! [speaking quickly] Tudo bem?",
        voiceId: fishVoices.eneas.id,
      },
    ]);
  });

  describe("invalid input", () => {
    for (const text of ["", "   ", "a".repeat(4001), ` ${"a".repeat(4000)}`]) {
      it(`rejects text with length ${text.length} and trimmed length ${text.trim().length}`, async () => {
        const speech = new FakeSpeechGenerator();
        const interaction = new FakeSayInteraction();
        interaction.text = text;
        await new SayCommand(speech).handle(interaction);
        expect(speech.requests).toEqual([]);
        expect(interaction.events).toEqual([
          {
            reply: {
              content:
                "Choose a supported voice and enter 1 to 4000 characters of text.",
              flags: MessageFlags.Ephemeral,
            },
          },
        ]);
      });
    }

    for (const slug of [
      "unknown",
      "constructor",
      "toString",
      "__proto__",
      "",
      "kiko",
    ]) {
      it(`rejects unsupported voice ${JSON.stringify(slug)}`, async () => {
        const speech = new FakeSpeechGenerator();
        const interaction = new FakeSayInteraction();
        interaction.slug = slug;
        await new SayCommand(speech).handle(interaction);
        expect(speech.requests).toEqual([]);
        expect(interaction.events).toEqual([
          {
            reply: {
              content:
                "Choose a supported voice and enter 1 to 4000 characters of text.",
              flags: MessageFlags.Ephemeral,
            },
          },
        ]);
      });
    }
  });

  it("reports a provider failure without exposing its details", async () => {
    const speech = new FakeSpeechGenerator();
    speech.fail = true;
    const interaction = new FakeSayInteraction();
    await new SayCommand(speech).handle(interaction);
    expect(interaction.events).toEqual([
      "defer",
      { edit: "Speech generation failed. Please try again later." },
    ]);
  });

  it("rejects audio above the interaction upload limit", async () => {
    const speech = new FakeSpeechGenerator();
    const interaction = new FakeSayInteraction();
    interaction.attachmentSizeLimit = 2;
    await new SayCommand(speech).handle(interaction);
    expect(interaction.events).toEqual([
      "defer",
      {
        edit: "The audio exceeds this channel's upload limit. Please use shorter text.",
      },
    ]);
  });

  it("accepts audio at the interaction upload limit", async () => {
    const speech = new FakeSpeechGenerator();
    const interaction = new FakeSayInteraction();
    interaction.attachmentSizeLimit = 3;
    await new SayCommand(speech).handle(interaction);
    expect(interaction.events).toEqual([
      "defer",
      {
        edit: {
          files: [
            { attachment: Buffer.from(speech.audio), name: "speech.wav" },
          ],
          allowedMentions: { parse: [] },
        },
      },
    ]);
  });

  it("does not generate speech if deferring the reply fails", async () => {
    const speech = new FakeSpeechGenerator();
    const interaction = new FakeSayInteraction();
    interaction.failDefer = true;
    await expect(new SayCommand(speech).handle(interaction)).rejects.toThrow(
      SayDeliveryError,
    );
    expect(speech.requests).toEqual([]);
    expect(interaction.events).toEqual(["defer"]);
  });

  it("does not retry generation or delivery when uploading fails", async () => {
    const speech = new FakeSpeechGenerator();
    const interaction = new FakeSayInteraction();
    interaction.failEdit = true;
    await expect(new SayCommand(speech).handle(interaction)).rejects.toThrow(
      SayDeliveryError,
    );
    expect(speech.requests).toEqual([
      { text: interaction.text, voiceId: fishVoices.eneas.id },
    ]);
    expect(interaction.events.length).toEqual(2);
  });
});
