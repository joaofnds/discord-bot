import { CronJob } from "cron";
import { pragTips } from "../const.ts";
import { Bot } from "../discord/bot.ts";
import { Random } from "../lib/random.ts";

export class PragTipBot implements Disposable {
  private readonly cron: CronJob;

  constructor(
    private readonly bot: Bot,
    private readonly random: Pick<Random, "pick">,
  ) {
    this.cron = new CronJob({
      cronTime: "0 9 * * 1-5",
      timeZone: "America/Sao_Paulo",
      onTick: this.run.bind(this),
    });
  }

  start() {
    this.cron.start();
  }

  stop() {
    this.cron.stop();
  }

  [Symbol.dispose]() {
    this.stop();
  }

  private async run() {
    await this.bot.send(this.random.pick(pragTips));
  }
}
