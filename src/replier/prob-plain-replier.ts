import { Random } from "../lib/random.ts";
import { Replier } from "./replier.ts";

export class ProbPlainReplier implements Replier {
  private readonly regexes: RegExp[];

  constructor(
    private readonly random: Pick<Random, "chance">,
    private readonly probability: number,
    private readonly response: string,
    ...regexes: RegExp[]
  ) {
    this.regexes = regexes;
  }

  reply(str: string) {
    if (
      this.random.chance(this.probability) &&
      this.regexes.some((regex) => regex.test(str))
    ) {
      return this.response;
    }
  }
}
