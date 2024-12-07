import { pragTips, stupidID } from "../const.ts";
import { Msg } from "../discord/types.ts";
import { captures } from "../lib/captures.ts";
import { normalize } from "../lib/normalize.ts";
import { Chain } from "./chain.ts";

export class PragTip extends Chain {
  command = /^!pragtip (\d+)/i;

  override async handle(message: Msg) {
    const str = normalize(message.content);

    if (!this.command.test(str)) return this.next?.handle(message);

    const matches = captures(this.command, str);
    if (matches.length !== 1) {
      message.react(stupidID);
      return;
    }

    const tipNumber = Number.parseInt(matches[0]);

    const tip = pragTips[tipNumber - 1];
    if (!tip) {
      message.react(stupidID);
      return;
    }

    await message.channel.send(tip);
  }
}
