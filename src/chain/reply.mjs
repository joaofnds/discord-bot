import { devops, linux } from "../const.mjs";
import { normalize } from "../lib/normalize.mjs";
import { PlainReplier } from "../replier/plain-replier.mjs";
import { ProbPlainReplier } from "../replier/prob-plain-replier.mjs";
import { Chain } from "./chain.mjs";

export class Reply extends Chain {
  constructor(randomFolk) {
    super();
    this.responses = [
      new PlainReplier("e o PT hein? e o lula?", /(bolsonaro)/gi),
      new PlainReplier(randomFolk, /(citando aleatoriamente)/gi),
      new PlainReplier(devops, /( e devops)/gi, /(contrat\w* devops)/gi),
      new ProbPlainReplier(0.1, linux, /((?<!\/)linux)/gi),
    ];
  }

  async handle(message) {
    const str = normalize(message.content);

    for (const response of this.responses) {
      const reply = response.reply(str);
      if (reply) return message.reply(reply);
    }

    this.next?.handle(message);
  }
}
