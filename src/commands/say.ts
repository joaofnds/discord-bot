import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { Buffer } from "node:buffer";
import { z } from "zod";
import {
  MistralVoicesEnum,
  MistralVoicesIDsEnum,
  SpeechGenerator,
} from "../lib/mistral-speech.ts";

const voices = {
  [MistralVoicesEnum.Kiko]: { name: "Kiko", id: MistralVoicesIDsEnum.Kiko },
  [MistralVoicesEnum.MarceloAvila]: {
    name: "Marcelo Avila",
    id: MistralVoicesIDsEnum.MarceloAvila,
  },
  [MistralVoicesEnum.Eneas]: { name: "Eneas", id: MistralVoicesIDsEnum.Eneas },
  [MistralVoicesEnum.Bolsonaro]: {
    name: "Bolsonaro",
    id: MistralVoicesIDsEnum.Bolsonaro,
  },
};
const inputSchema = z.object({
  voice: z.nativeEnum(MistralVoicesEnum),
  text: z.string().max(2000).trim().min(1),
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
    getSubcommand(): string;
    getString(name: string, required: true): string;
  };
  deferReply(): Promise<unknown>;
  reply(payload: {
    content: string;
    flags: typeof MessageFlags.Ephemeral;
  }): Promise<unknown>;
  editReply(payload: SayReply): Promise<unknown>;
}

export class SayDeliveryError extends Error {
  constructor() {
    super("Could not send the speech command response to Discord");
    this.name = "SayDeliveryError";
  }
}

export const sayCommand = new SlashCommandBuilder()
  .setName("say")
  .setDescription("Generate a speech audio file");

for (const [slug, voice] of Object.entries(voices)) {
  sayCommand.addSubcommand((subcommand) =>
    subcommand
      .setName(slug)
      .setDescription(`Speak with ${voice.name}'s voice`)
      .addStringOption((option) =>
        option
          .setName("text")
          .setDescription("The text to speak (up to 2000 characters)")
          .setRequired(true)
          .setMinLength(1)
          .setMaxLength(2000),
      ),
  );
}

export class SayCommand {
  constructor(private readonly speech: SpeechGenerator) {}

  async handle(interaction: SayInteraction): Promise<void> {
    try {
      await this.respond(interaction);
    } catch {
      throw new SayDeliveryError();
    }
  }

  private async respond(interaction: SayInteraction): Promise<void> {
    const input = inputSchema.safeParse({
      voice: interaction.options.getSubcommand(),
      text: interaction.options.getString("text", true),
    });

    if (!input.success) {
      await interaction.reply({
        content:
          "Choose a supported voice and enter 1 to 2000 characters of text.",
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    await interaction.deferReply();

    let audio: Uint8Array;
    try {
      audio = await this.speech.generate(
        input.data.text,
        voices[input.data.voice].id,
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
      files: [{ attachment: Buffer.from(audio), name: "speech.mp3" }],
      allowedMentions: { parse: [] },
    });
  }
}
