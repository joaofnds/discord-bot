import { Msg } from "../discord/types.ts";
import { Chain } from "./chain.ts";

export class BotAuthorGuard extends Chain {
  override handle(message: Msg) {
    if (message.author.bot) return;

    return this.next?.handle(message);
  }
}
