import { CronJob, Scheduler } from "../lib/cron.ts";
import { Bot } from "../discord/bot.ts";

type ExchangeRates = {
  fetchLatest(): Promise<Record<string, number>>;
};

export class RatesBot implements Disposable {
  private readonly cron: CronJob;

  constructor(
    private readonly billionaireDadBot: Bot,
    private readonly richDadBot: Bot,
    private readonly poorDadBot: Bot,
    private readonly brokeDadBot: Bot,
    private readonly exchangeRates: ExchangeRates,
    scheduler: Scheduler,
  ) {
    this.cron = new CronJob(
      {
        cronTime: "0 10,14,18 * * 1-5",
        timeZone: "America/Sao_Paulo",
        onTick: async () => {
          try {
            await this.run();
          } catch (error) {
            console.error(error);
          }
        },
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
    const rates = await this.exchangeRates.fetchLatest();

    const arsbrl = (1 / rates.ARS) * rates.BRL;
    const eurbrl = (1 / rates.EUR) * rates.BRL;
    const usdbrl = (1 / rates.USD) * rates.BRL;
    const btcbrl = (1 / rates.BTC) * rates.USD;

    const bot = this.pickBot(usdbrl);

    await bot.send(
      [
        `USD: R$${usdbrl.toFixed(2)}`,
        `EUR: R$${eurbrl.toFixed(2)}`,
        `ARS: R$${arsbrl.toFixed(4)}`,
        `BTC: $${(btcbrl / 1000).toFixed(2)}k`,
      ].join("\n"),
    );
  }

  private pickBot(usdbrl: number): Bot {
    if (usdbrl > 5.8) return this.billionaireDadBot;
    if (usdbrl >= 5.5) return this.richDadBot;
    if (usdbrl < 5) return this.brokeDadBot;
    return this.poorDadBot;
  }
}
