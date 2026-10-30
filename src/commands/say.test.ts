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
      {
        name: "Capitão Pátria",
        value: "capitao-patria",
      },
    ]);
  });

  it("finds Aldo Apache by name", async () => {
    const interaction = new FakeAutocompleteInteraction();
    interaction.query = "aldo";
    await new SayCommand(new FakeSpeechGenerator()).autocomplete(interaction);
    expect(interaction.choices).toEqual([
      { name: "Waldo Moraes", value: "waldo-moraes" },
      { name: "Aldo Apache (en)", value: "inglorious-bsterds-en" },
    ]);
  });

  it("finds Japanese voices by their language label", async () => {
    const interaction = new FakeAutocompleteInteraction();
    interaction.query = "(jp)";
    await new SayCommand(new FakeSpeechGenerator()).autocomplete(interaction);
    expect(interaction.choices).toEqual([
      { name: "Obito 1 (jp)", value: "obito-jp" },
      { name: "Madara (jp)", value: "madara-jp" },
      { name: "Pain 1 (jp)", value: "pain-1-jp" },
      { name: "Pain 2 (jp)", value: "pain-2-jp" },
      { name: "Naruto (jp)", value: "naruto-jp" },
      { name: "Obito 2 (jp)", value: "obito-2-jp" },
    ]);
  });

  it("labels Donald Trump as English", async () => {
    const interaction = new FakeAutocompleteInteraction();
    interaction.query = "donald";
    await new SayCommand(new FakeSpeechGenerator()).autocomplete(interaction);
    expect(interaction.choices).toEqual([
      { name: "Donald Trump (en)", value: "donald-trump" },
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
  const bookmarkedVoices = [
    { slug: "obito-jp", id: "00be8badfdf84dc0839353820d448726" },
    { slug: "madara-jp", id: "6c67208e439b42158c887c79af30a20a" },
    { slug: "pain-1-jp", id: "dd9aaa6a4ec44055bb53ec6a615d1fc5" },
    { slug: "pain-2-jp", id: "edff2a83cfe94bfd8c9abc00499d705d" },
    { slug: "primeagen", id: "06ba5b192f9a49f2942f72febea29fde" },
    { slug: "guerrinha", id: "bfe77956a85f44a9be040ce16e87ecf0" },
    { slug: "samir", id: "2a52afa29cd74ae5802ba7b516c929e7" },
    { slug: "bob-esponja", id: "0d604d0f2e834f7b82f97f6e81ec1bc5" },
    { slug: "sasuke", id: "aedb06f6daa84a1db52c7479c7235910" },
    { slug: "cartman", id: "ba6fb26d7d094e9888ac71c7dba651ee" },
    { slug: "stewie", id: "26f644d9279841c5b41961991c9f9e06" },
    { slug: "itoshi-sae", id: "2bb270d0dc344007b53ae25cd00a4e85" },
    { slug: "satoru-gojo", id: "96a2c896ed7846848cdd83e484b23eb3" },
    { slug: "anya", id: "ffe41701970d4b339ef7906300716f99" },
    { slug: "galvao-bueno", id: "7fe10a00249247aabb495bae57ac80e1" },
    { slug: "naruto-jp", id: "fc30849cffd24f49824775fdeff53ff8" },
    { slug: "obito-2-jp", id: "01cf6bc227f54b6eace8eb2427b2642a" },
  ];

  for (const voice of bookmarkedVoices) {
    it(`uses the bookmarked ID for ${voice.slug}`, async () => {
      const speech = new FakeSpeechGenerator();
      const interaction = new FakeSayInteraction();
      interaction.slug = voice.slug;
      await new SayCommand(speech).handle(interaction);
      expect(speech.requests).toEqual([
        { text: interaction.text, voiceId: voice.id },
      ]);
    });
  }

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
