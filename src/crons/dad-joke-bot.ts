import { CronJob } from "cron";
import { Bot } from "../discord/bot.ts";

export class DadJokeBot implements Disposable {
  private readonly cron: CronJob;

  constructor(
    private readonly bot: Bot,
    private readonly rapidAPIURL: string,
    private readonly rapidAPIKey: string,
  ) {
    this.cron = CronJob.from({
      cronTime: "0 11 * * 1-5",
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
    const response = await fetch(this.rapidAPIURL, {
      headers: {
        "X-Rapidapi-Key": this.rapidAPIKey,
        "X-Rapidapi-Host": "dad-jokes.p.rapidapi.com",
      },
    });
    const {
      body: [{ setup, punchline }],
    } = await response.json();

    await this.bot.send(setup);
    await new Promise((resolve) => setTimeout(resolve, 20_000));
    await this.bot.send(punchline);
  }
}
