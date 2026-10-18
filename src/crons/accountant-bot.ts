import { CronJob, Scheduler } from "../lib/cron.ts";
import { guiasNoEmailIMG, guiasVencemHojeIMG } from "../const.ts";
import { Bot } from "../discord/bot.ts";

export class AccountantBot implements Disposable {
  onEmail: CronJob;
  expire: CronJob;
  constructor(bot: Bot, scheduler: Scheduler) {
    this.onEmail = new CronJob({
      cronTime: "0 14 15 * *",
      timeZone: "America/Sao_Paulo",
      onTick: () => bot.send(guiasNoEmailIMG),
    }, scheduler);
    this.expire = new CronJob({
      cronTime: "0 14 20 * *",
      timeZone: "America/Sao_Paulo",
      onTick: () => bot.send(guiasVencemHojeIMG),
    }, scheduler);
  }

  start() {
    this.onEmail.start();
    this.expire.start();
  }

  stop() {
    this.onEmail.stop();
    this.expire.stop();
  }

  [Symbol.dispose](): void {
    this.stop();
  }
}
