import { CronJob } from "cron";
import { wed4pm } from "../const.ts";
import { Bot } from "../discord/bot.ts";

export class Wed4pmCron implements Disposable {
  private readonly cron: CronJob;

  constructor(private readonly bot: Bot) {
    this.cron = CronJob.from({
      cronTime: "0 16 * * 3",
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

  [Symbol.dispose](): void {
    this.stop();
  }

  async run() {
    await this.bot.send(wed4pm);
  }
}
