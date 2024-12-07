import { stupid } from "../const.ts";
import { allCaptures } from "../lib/all-captures.ts";
import { stupidCase } from "../lib/stupid-case.ts";
import { Replier } from "./replier.ts";

export class StupidReplier implements Replier {
  private readonly regexes: RegExp[];

  constructor(...regexes: RegExp[]) {
    this.regexes = regexes;
  }

  reply(str: string) {
    const captures = allCaptures(this.regexes, str);
    if (captures.length === 0) return;

    return `${captures.map((w) => stupidCase(w)).join(", ")} ${stupid}`;
  }
}
