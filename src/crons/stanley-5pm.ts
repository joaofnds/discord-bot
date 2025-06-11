import { CronJob } from "cron";
import { Bot } from "../discord/bot.ts";
import { ClientWrapper } from "../discord/client-wrapper.ts";

export class Stanley5pmCron implements Disposable {
  private readonly cron: CronJob;

  constructor(
    private readonly client: ClientWrapper,
    private readonly bot: Bot,
  ) {
    this.cron = CronJob.from({
      cronTime: "0 18 * * 1-5",
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
    throw new Error("Method not implemented.");
  }

  async run() {
    await this.client.voiceDisconnect(
      "1133135683897262191",
      "189624819807944704",
    );
    await this.bot.send("então tá pessoal, tchau tchau!");
    await this.bot.send(
      "https://tenor.com/view/the-office-stanley-time-to-go-work-life-got-to-go-gif-4242766",
    );
  }
}
