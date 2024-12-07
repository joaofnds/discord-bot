import { Msg } from "../discord/types.ts";
import { normalize } from "../lib/normalize.ts";
import time from "../lib/time.ts";
import { Timeout } from "../lib/timeout.ts";
import { SendAndTimeoutReplier } from "../replier/send-and-time-out-replier.ts";
import { Chain } from "./chain.ts";

export class Send extends Chain {
  readonly responses = [
    new SendAndTimeoutReplier(
      Timeout.withDuration(time.Minute),
      "channel errado",
      /^channel errado$/i,
    ),
    new SendAndTimeoutReplier(
      Timeout.withDuration(time.Minute),
      "canal errado",
      /^canal errado$/i,
    ),
  ];

  override async handle(message: Msg) {
    const str = normalize(message.content).trim();

    for (const response of this.responses) {
      const reply = response.reply(str);
      if (reply) return await message.channel.send(reply);
    }

    return this.next?.handle(message);
  }
}
