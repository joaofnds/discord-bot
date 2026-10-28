import { Interaction } from "../discord/types.ts";
import { Chain } from "./chain.ts";

export class MP3 extends Chain {
  constructor(
    private readonly handleMp3Autocomplete: (
      interaction: Interaction,
    ) => Promise<void>,
    private readonly handleMp3Command: (
      interaction: Interaction,
    ) => Promise<void>,
  ) {
    super();
  }

  override async handle(interaction: Interaction) {
    if (
      !interaction.isAutocomplete ||
      !interaction.isChatInputCommand ||
      interaction.commandName !== "mp3"
    ) {
      if (this.next) return this.next.handle(interaction);
      return;
    }

    if (interaction.isAutocomplete()) {
      await this.handleMp3Autocomplete(interaction);
      return;
    }

    if (interaction.isChatInputCommand()) {
      await this.handleMp3Command(interaction);
      return;
    }

    if (this.next) return this.next.handle(interaction);
  }
}
