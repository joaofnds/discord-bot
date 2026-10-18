import { CronJob, Scheduler } from "../lib/cron.ts";
import { Bot } from "../discord/bot.ts";
import { ClientWrapper } from "../discord/client-wrapper.ts";

export class Stanley5pmCron implements Disposable {
  private readonly cron: CronJob;

  constructor(
    private readonly client: ClientWrapper,
    private readonly bot: Bot,
    scheduler: Scheduler,
  ) {
    this.cron = new CronJob({
      cronTime: "0 18 * * 1-5",
      timeZone: "America/Sao_Paulo",
      onTick: this.run.bind(this),
    }, scheduler);
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
    await this.bot.send("https://klipy.com/gifs/stanley-run");
  }
}
