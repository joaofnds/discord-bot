import { stupid } from "../const.mjs";
import { allCaptures } from "../lib/all-captures.mjs";
import { normalize } from "../lib/normalize.mjs";
import { stupidCase } from "../lib/stupid-case.mjs";

export class StupidReplier {
  constructor(...regexes) {
    this.regexes = regexes;
  }

  reply(str) {
    const captures = allCaptures(this.regexes, str);
    if (captures.length === 0) return;

    return `${captures.map((w) => stupidCase(w)).join(", ")} ${stupid}`;
  }
}
