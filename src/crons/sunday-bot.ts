import { CronJob, Scheduler } from "../lib/cron.ts";
import { Bot } from "../discord/bot.ts";
import time from "../lib/time.ts";

export class SundayBot implements Disposable {
  private readonly cron: CronJob;

  constructor(
    private readonly bot: Bot,
    scheduler: Scheduler,
  ) {
    this.cron = new CronJob(
      {
        cronTime: "0 8 * * 0",
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
    throw new Error("Method not implemented.");
  }

  private async run() {
    await this.bot.send(
      `Oficialmente iniciada a semana ${this.week()} do ano! Uma ótima semana a todos!`,
    );
  }

  private week() {
    const today = new Date();
    const janFirst = new Date(today.getFullYear(), 0, 1);

    const diff = today.valueOf() - janFirst.valueOf();
    return Math.ceil((diff / time.Day + 1) / 7);
  }
}
