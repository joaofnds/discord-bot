import { Msg } from "../discord/types.ts";
import { normalize } from "../lib/normalize.ts";
import { Chain } from "./chain.ts";

export class Abbrev extends Chain<Msg> {
  command = /^!abbrev/gi;

  override async handle(message: Msg) {
    const str = normalize(message.content);

    if (!this.command.test(str)) return this.next?.handle(message);

    const input = str.replace(this.command, "").trim();
    if (input) await message.reply(this.abbreviate(input));
  }

  abbreviate(str: string) {
    const noVowelsAtTheMiddle = str.replace(/(?<=\w)[aeiou]/gi, "");
    const noDupes = noVowelsAtTheMiddle.replace(/(.)\1+/gi, "$1");

    return noDupes;
  }
}
