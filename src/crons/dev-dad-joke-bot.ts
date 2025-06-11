import { CronJob } from "cron";
import { Bot } from "../discord/bot.ts";

export class DevDadJokeBot implements Disposable {
  private readonly cron: CronJob;

  constructor(
    private readonly bot: Bot,
    private readonly apiURL: string,
  ) {
    this.cron = CronJob.from({
      cronTime: "0 15 * * 1-5",
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

  private async run() {
    const response = await fetch(this.apiURL);
    const body = await response.json();

    if (body.type === "single") {
      await this.bot.send(body.joke);
    } else {
      await this.bot.send(body.setup);
      await new Promise((resolve) => setTimeout(resolve, 20_000));
      await this.bot.send(body.delivery);
    }
  }
}
