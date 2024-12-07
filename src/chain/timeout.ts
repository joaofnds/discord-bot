import { Msg } from "../discord/types.ts";
import { normalize } from "../lib/normalize.ts";
import { parseDuration } from "../lib/parse-duration.ts";
import { Chain } from "./chain.ts";

export class Timeout extends Chain {
  private timeoutUntil = Date.now();
  private readonly shutCommand = /^!shut/i;

  constructor(private readonly duration: number) {
    super();
  }

  override async handle(message: Msg) {
    const content = normalize(message.content);

    if (this.isRemovingTimeout(content)) {
      this.timeoutUntil = Date.now();
      return await message.react("🙇");
    }

    if (this.isSettingTimeout(content)) {
      const duration = this.getTimeoutDuration(message);
      this.timeoutUntil = Date.now() + duration;
      return await message.react("🙇");
    }

    if (!this.isTimeoutExpired()) return;

    return this.next?.handle(message);
  }

  private isSettingTimeout(content: string) {
    return this.shutCommand.test(content);
  }

  private isRemovingTimeout(content: string) {
    return /^!!shut/i.test(content);
  }

  private isTimeoutExpired() {
    return Date.now() >= this.timeoutUntil;
  }

  private getTimeoutDuration(message: Msg) {
    const messageWithoutCommand = message.content
      .replace(this.shutCommand, "")
      .trim();

    if (!messageWithoutCommand) return this.duration;

    return parseDuration(messageWithoutCommand) || this.duration;
  }
}
