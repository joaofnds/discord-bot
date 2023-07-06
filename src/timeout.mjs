import { Chain } from "./chain.mjs";
import { dateAdd } from "./time.mjs";
import { normalize } from "./util.mjs";

export class Timeout extends Chain {
  #timeoutUntil = new Date();

  async handle(message) {
    if (normalize(message.content).includes("!shut")) {
      this.#timeoutUntil = dateAdd(new Date(), 5, "minutes");
      return message.react("🙇");
    }

    const timeUntilTimeout = new Date() - this.#timeoutUntil;
    if (timeUntilTimeout < 0) return;

    return this.next?.handle(message);
  }
}
