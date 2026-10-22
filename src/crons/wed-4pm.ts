import { CronJob, Scheduler } from "../lib/cron.ts";
import { wed4pm } from "../const.ts";
import { Bot } from "../discord/bot.ts";

export class Wed4pmCron implements Disposable {
  private readonly cron: CronJob;

  constructor(
    private readonly bot: Bot,
    scheduler: Scheduler,
  ) {
    this.cron = new CronJob(
      {
        cronTime: "0 16 * * 3",
        timeZone: "America/Sao_Paulo",
        onTick: this.run.bind(this),
      },
      scheduler,
    );
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
