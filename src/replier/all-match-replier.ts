import { Replier } from "./replier.ts";

export class AllMatchReplier implements Replier {
  private readonly regexes: RegExp[];

  constructor(private readonly response: string, ...regexes: RegExp[]) {
    this.regexes = regexes;
  }

  reply(str: string) {
    if (this.regexes.every((regex) => regex.test(str))) {
      return this.response;
    }
  }
}
