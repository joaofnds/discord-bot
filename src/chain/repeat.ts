import { Msg } from "../discord/types.ts";
import { Chain } from "./chain.ts";

type Run = { readonly content: string; readonly echoed: boolean };

export class Repeat extends Chain {
  private readonly runByChannelId = new Map<string, Run>();

  override async handle(message: Msg) {
    const content = this.normalize(message.content);
    if (content.length === 0) {
      return this.next?.handle(message);
    }

    const run = this.runByChannelId.get(message.channel.id);
    if (run?.content !== content) {
      this.runByChannelId.set(message.channel.id, { content, echoed: false });
      return this.next?.handle(message);
    }

    if (run.echoed) {
      return this.next?.handle(message);
    }

    this.runByChannelId.set(message.channel.id, { content, echoed: true });
    return await message.channel.send(message.content);
  }

  private normalize(str: string) {
    const normalized = str.normalize("NFD").replaceAll(/[\u0300-\u036f]/g, "");

    const withoutSpecialChars = normalized.replaceAll(
      /[^\p{L}\p{N}\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}\s]/gu,
      "",
    );

    const withoutMultipleSpaces = withoutSpecialChars.replaceAll(/\s+/g, " ");

    return withoutMultipleSpaces.trim().toLowerCase();
  }
}
