import { Replier } from "./replier.ts";

export class PlainReplier implements Replier {
  private readonly regexes: RegExp[];

  constructor(private readonly response: string, ...regexes: RegExp[]) {
    this.regexes = regexes;
  }

  reply(str: string) {
    if (this.regexes.some((regex) => regex.test(str))) {
      return this.response;
    }
  }
}
