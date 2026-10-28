import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { Buffer } from "node:buffer";
import { z } from "zod";
import { fishVoices, fishVoiceSlugSchema } from "../lib/fish-voices.ts";
import { SpeechGenerator } from "../lib/speech-generator.ts";

const inputSchema = z.object({
  voice: fishVoiceSlugSchema,
  text: z.string().max(4000).trim().min(1),
});

export type SayReply =
  | string
  | {
      files: { attachment: Buffer; name: string }[];
      allowedMentions: { parse: [] };
    };

export interface SayInteraction {
  attachmentSizeLimit: number;
  options: {
    getString(name: string, required: true): string;
  };
  deferReply(): Promise<unknown>;
  reply(payload: {
    content: string;
    flags: typeof MessageFlags.Ephemeral;
  }): Promise<unknown>;
  editReply(payload: SayReply): Promise<unknown>;
}

export interface SayAutocompleteInteraction {
  options: { getFocused(): string };
  respond(choices: { name: string; value: string }[]): Promise<unknown>;
}

export class SayDeliveryError extends Error {
  constructor() {
    super("Could not send the speech command response to Discord");
    this.name = "SayDeliveryError";
  }
}

export const sayCommand = new SlashCommandBuilder()
  .setName("say")
  .setDescription("Generate a speech audio file")
  .addStringOption((option) =>
    option
      .setName("voice")
      .setDescription("The voice slug to use")
      .setRequired(true)
      .setAutocomplete(true),
  )
  .addStringOption((option) =>
    option
      .setName("text")
      .setDescription("The text to speak (up to 4000 characters)")
      .setRequired(true)
      .setMinLength(1)
      .setMaxLength(4000),
  );

function normalizeSearch(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export class SayCommand {
  constructor(private readonly speech: SpeechGenerator) {}

  async autocomplete(interaction: SayAutocompleteInteraction): Promise<void> {
    const query = normalizeSearch(interaction.options.getFocused());
    const choices = Object.entries(fishVoices)
      .filter(([slug, voice]) =>
        normalizeSearch(`${slug} ${voice.name}`).includes(query),
      )
      .slice(0, 25)
      .map(([slug, voice]) => ({
        name: voice.name,
        value: slug,
      }));

    await interaction.respond(choices).catch(() => {
      throw new SayDeliveryError();
    });
  }

  async handle(interaction: SayInteraction): Promise<void> {
    try {
      await this.respond(interaction);
    } catch {
      throw new SayDeliveryError();
    }
  }

  private async respond(interaction: SayInteraction): Promise<void> {
    const input = inputSchema.safeParse({
      voice: interaction.options.getString("voice", true),
      text: interaction.options.getString("text", true),
    });

    if (!input.success) {
      await interaction.reply({
        content:
          "Choose a supported voice and enter 1 to 4000 characters of text.",
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    await interaction.deferReply();

    let audio: Uint8Array;
    try {
      audio = await this.speech.generate(
        input.data.text,
        fishVoices[input.data.voice].id,
      );
    } catch {
      await interaction.editReply(
        "Speech generation failed. Please try again later.",
      );
      return;
    }

    if (audio.byteLength > interaction.attachmentSizeLimit) {
      await interaction.editReply(
        "The audio exceeds this channel's upload limit. Please use shorter text.",
      );
      return;
    }

    await interaction.editReply({
      files: [{ attachment: Buffer.from(audio), name: "speech.wav" }],
      allowedMentions: { parse: [] },
    });
  }
}
