import { CronJob } from "cron";
import * as time from "../lib/time.mjs";

export class SundayBot {
  constructor(bot) {
    this.bot = bot;
    this.cron = new CronJob({
      cronTime: "0 8 * * 0",
      timeZone: "America/Sao_Paulo",
      onTick: this.run.bind(this),
    });
  }

  start() {
    this.cron.start();
  }

  async run() {
    await this.bot.sendMessage(
      `Oficialmente iniciada a semana ${this.week()} do ano! Uma ótima semana a todos!`
    );
  }

  week() {
    const today = new Date();
    const janFirst = new Date(today.getFullYear(), 0, 1);
    return Math.ceil(((today - janFirst) / time.Day + 1) / 7);
  }
}
