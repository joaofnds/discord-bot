import { describe, expect, it } from "bun:test";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  MessageFlags,
} from "discord.js";
import { Buffer } from "node:buffer";
import {
  MistralVoicesIDsEnum,
  SpeechGenerationError,
  SpeechGenerator,
} from "../lib/mistral-speech.ts";
import {
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
  slug = "kiko";
  text = "Olá pessoal!";
  attachmentSizeLimit = 1024;
  events: unknown[] = [];
  failDefer = false;
  failEdit = false;
  options = {
    getSubcommand: (): string => this.slug,
    getString: (): string => this.text,
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

const voices = [
  { slug: "kiko", name: "Kiko", id: MistralVoicesIDsEnum.Kiko },
  {
    slug: "marcelo-avila",
    name: "Marcelo Avila",
    id: MistralVoicesIDsEnum.MarceloAvila,
  },
  { slug: "eneas", name: "Eneas", id: MistralVoicesIDsEnum.Eneas },
  { slug: "bolsonaro", name: "Bolsonaro", id: MistralVoicesIDsEnum.Bolsonaro },
];

describe("say command definition", () => {
  it("registers four voice subcommands with required text", () => {
    const definition = JSON.parse(JSON.stringify(sayCommand.toJSON()));
    expect(definition).toEqual({
      type: ApplicationCommandType.ChatInput,
      name: "say",
      description: "Generate a speech audio file",
      options: voices.map((voice) => ({
        type: ApplicationCommandOptionType.Subcommand,
        name: voice.slug,
        description: `Speak with ${voice.name}'s voice`,
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: "text",
            description: "The text to speak (up to 2000 characters)",
            required: true,
            min_length: 1,
            max_length: 2000,
          },
        ],
      })),
    });
  });
});

describe("SayCommand", () => {
  for (const voice of voices) {
    it(`sends a WAV file using ${voice.name}`, async () => {
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

  it("accepts exactly 2000 characters", async () => {
    const speech = new FakeSpeechGenerator();
    const interaction = new FakeSayInteraction();
    interaction.text = "a".repeat(2000);

    await new SayCommand(speech).handle(interaction);

    expect(speech.requests).toEqual([
      { text: interaction.text, voiceId: MistralVoicesIDsEnum.Kiko },
    ]);
  });

  describe("invalid input", () => {
    for (const text of ["", "   ", "a".repeat(2001), ` ${"a".repeat(2000)}`]) {
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
                "Choose a supported voice and enter 1 to 2000 characters of text.",
              flags: MessageFlags.Ephemeral,
            },
          },
        ]);
      });
    }

    it("rejects an unknown voice", async () => {
      const speech = new FakeSpeechGenerator();
      const interaction = new FakeSayInteraction();
      interaction.slug = "unknown";
      await new SayCommand(speech).handle(interaction);
      expect(speech.requests).toEqual([]);
      expect(interaction.events).toEqual([
        {
          reply: {
            content:
              "Choose a supported voice and enter 1 to 2000 characters of text.",
            flags: MessageFlags.Ephemeral,
          },
        },
      ]);
    });
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
      { text: interaction.text, voiceId: MistralVoicesIDsEnum.Kiko },
    ]);
    expect(interaction.events.length).toEqual(2);
  });
});
