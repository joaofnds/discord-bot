import { SayCommand } from "../commands/say.ts";
import { Interaction } from "../discord/types.ts";
import { Chain } from "./chain.ts";

export class Say extends Chain {
  private readonly commandName = "say";

  constructor(private readonly command: SayCommand) {
    super();
  }

  override async handle(interaction: Interaction): Promise<unknown> {
    if (interaction.commandName !== this.commandName)
      return this.next?.handle(interaction);

    if (interaction.isAutocomplete()) {
      await this.command.autocomplete(interaction);
      return;
    }

    if (interaction.isChatInputCommand())
      await this.command.handle(interaction);
  }
}
