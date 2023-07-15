import { Chain } from "./chain.mjs";
import { normalize } from "./util.mjs";

export class Abbrev extends Chain {
  command = /^!abbrev/gi;

  async handle(message) {
    const str = normalize(message.content);

    if (!this.command.test(str)) return this.next?.handle(message);

    const input = str.replace(this.command, "").trim();
    if (input) message.reply(this.abbreviate(input));
  }

  abbreviate(str) {
    const noVowelsAtTheMiddle = str.replace(/(?<=\w)[aeiou]/gi, "");
    const noDupes = noVowelsAtTheMiddle.replace(/(.)\1+/gi, "$1");

    return noDupes;
  }
}
