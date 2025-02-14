import { Replier } from "./replier.ts";

export type Response = (message?: string) => string;

export class PlainReplier implements Replier {
  private readonly regexes: RegExp[];

  constructor(private readonly response: Response, ...regexes: RegExp[]) {
    this.regexes = regexes;
  }

  reply(str: string) {
    if (this.regexes.some((regex) => regex.test(str))) {
      return this.response(str);
    }
  }
}
