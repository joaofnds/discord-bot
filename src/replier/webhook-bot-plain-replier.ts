import { Bot } from "../discord/bot.ts";
import { Replier } from "./replier.ts";

export class WebhookBotPlanReplier implements Replier {
  readonly regexes: RegExp[];
  constructor(
    readonly bot: Bot,
    readonly response: string,
    ...regexes: RegExp[]
  ) {
    this.regexes = regexes;
  }

  reply(str: string) {
    if (this.regexes.some((regex) => regex.test(str))) {
      this.bot.send(this.response);
    }

    return undefined;
  }
}
