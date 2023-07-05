import { Chain } from "./chain.mjs";
import { randomFolk } from "./emojis.mjs";
import { captures, normalize } from "./util.mjs";

export class Reply extends Chain {
  responses = [
    { regex: /(bolsonaro)/gi, fn: () => "e o PT hein? e o lula?" },
    { regex: /(citando aleatoriamente)/gi, fn: () => randomFolk },
  ];

  async handle(message) {
    const str = normalize(message.content);

    for (const { regex, fn } of this.responses) {
      const match = captures(regex, str);
      if (match.length === 0) continue;

      return message.reply(fn(...match));
    }

    this.next?.handle(message);
  }
}
