import { normalize } from "../lib/normalize.mjs";
import { Chain } from "./chain.mjs";

export class Timeout extends Chain {
  #duration;
  #timeoutUntil = Date.now();

  constructor(duration) {
    super();
    this.#duration = duration;
  }

  async handle(message) {
    const content = normalize(message.content);

    if (this.#isRemovingTimeout(content)) {
      this.#timeoutUntil = Date.now();
      return message.react("🙇");
    }

    if (this.#isSettingTimeout(content)) {
      this.#timeoutUntil = Date.now() + this.#duration;
      return message.react("🙇");
    }

    if (!this.#isTimeoutExpired()) return;

    return this.next?.handle(message);
  }

  #isSettingTimeout(content) {
    return /^!shut/i.test(content);
  }

  #isRemovingTimeout(content) {
    return /^!!shut/i.test(content);
  }

  #isTimeoutExpired() {
    return Date.now() >= this.#timeoutUntil;
  }
}
