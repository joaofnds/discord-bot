import { devops, linux } from "../const.mjs";
import { normalize } from "../lib/normalize.mjs";
import { Chain } from "./chain.mjs";
import { PlainResponse } from "./plain-response.mjs";
import { ProbPlainResponse } from "./prob-plain-response.mjs";

export class Reply extends Chain {
  constructor(randomFolk) {
    super();
    this.responses = [
      new PlainResponse("e o PT hein? e o lula?", /(bolsonaro)/gi),
      new PlainResponse(randomFolk, /(citando aleatoriamente)/gi),
      new PlainResponse(devops, /( e devops)/gi, /(contrat\w* devops)/gi),
      new ProbPlainResponse(0.1, linux, /((?<!\/)linux)/gi),
    ];
  }

  async handle(message) {
    const str = normalize(message.content);

    for (const response of this.responses) {
      const reply = response.replyIfMatches(str);
      if (reply) return message.reply(reply);
    }

    this.next?.handle(message);
  }
}
