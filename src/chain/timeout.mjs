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
    const content = normalize(message.content);

    if (this.isRemovingTimeout(content)) {
      this.#timeoutUntil = Date.now();
      return message.react("🙇");
    }

    if (this.isSettingTimeout(content)) {
      this.#timeoutUntil = Date.now() + this.#duration;
      return message.react("🙇");
    }

    const timeUntilTimeout = Date.now() - this.#timeoutUntil;
    if (timeUntilTimeout < 0) return;

    return this.next?.handle(message);
  }

  isSettingTimeout(content) {
    return content.includes("!shut");
  }

  isRemovingTimeout(content) {
    return content.includes("!!shut");
  }
}
