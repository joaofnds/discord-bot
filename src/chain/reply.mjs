import { devops } from "../const.mjs";
import { captures } from "../lib/captures.mjs";
import { normalize } from "../lib/normalize.mjs";
import { Chain } from "./chain.mjs";

export class Reply extends Chain {
  constructor(randomFolk) {
    super();
    this.randomFolk = randomFolk;
  }

  responses = [
    { regex: /(bolsonaro)/gi, fn: () => "e o PT hein? e o lula?" },
    { regex: /(citando aleatoriamente)/gi, fn: () => this.randomFolk },
    { regex: /( e devops)/gi, fn: () => devops },
    { regex: /(contrat\w* devops)/gi, fn: () => devops },
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
