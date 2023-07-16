import { Chain } from "./chain.mjs";

export class BotAuthorGuard extends Chain {
  async handle(message) {
    if (message.author.bot) return;

    return this.next?.handle(message);
  }
}
