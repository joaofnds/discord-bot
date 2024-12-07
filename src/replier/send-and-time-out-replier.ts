import { Replier } from "./replier.ts";

export class SendAndTimeoutReplier implements Replier {
  private readonly regexes: RegExp[];

  constructor(
    private readonly timeout: { start: () => void; isActive: () => boolean },
    private readonly response: string,
    ...regexes: RegExp[]
  ) {
    this.regexes = regexes;
  }

  reply(str: string) {
    if (this.timeout.isActive()) return;

    if (this.regexes.some((regex) => regex.test(str))) {
      this.timeout.start();
      return this.response;
    }
  }
}
