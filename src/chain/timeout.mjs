import { normalize } from "../lib/normalize.mjs";
import { Chain } from "./chain.mjs";

export class Timeout extends Chain {
  #duration;
  #timeoutUntil = new Date();

  constructor(duration) {
    super();
    this.#duration = duration;
  }

  async handle(message) {
    if (normalize(message.content).includes("!shut")) {
      this.#timeoutUntil = Date.now() + this.#duration;
      return message.react("🙇");
    }

    const timeUntilTimeout = Date.now() - this.#timeoutUntil;
    if (timeUntilTimeout < 0) return;

    return this.next?.handle(message);
  }
}
