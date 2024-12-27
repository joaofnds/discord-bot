import { CronJob } from "cron";
import { Bot } from "../discord/bot.ts";

export class RatesBot implements Disposable {
  private readonly cron: CronJob;

  constructor(
    private readonly richDadBot: Bot,
    private readonly poorDadBot: Bot,
    private readonly apiURL: string,
    private readonly apiKey: string,
  ) {
    this.cron = new CronJob({
      cronTime: "0 10,14,18 * * 1-5",
      timeZone: "America/Sao_Paulo",
      onTick: async () => {
        try {
          await this.run();
        } catch (error) {
          console.error(error);
        }
      },
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
    const response = await fetch(`${this.apiURL}?app_id=${this.apiKey}`);
    const { rates } = await response.json();

    const arsbrl = (1 / rates.ARS) * rates.BRL;
    const eurbrl = (1 / rates.EUR) * rates.BRL;
    const usdbrl = (1 / rates.USD) * rates.BRL;
    const btcbrl = (1 / rates.BTC) * rates.USD;

    const bot = usdbrl >= 6 ? this.richDadBot : this.poorDadBot;

    await bot.send(
      [
        `USD: R$${usdbrl.toFixed(2)}`,
        `EUR: R$${eurbrl.toFixed(2)}`,
        `ARS: R$${arsbrl.toFixed(4)}`,
        `BTC: $${(btcbrl / 1000).toFixed(2)}k`,
      ].join("\n"),
    );
  }
}
