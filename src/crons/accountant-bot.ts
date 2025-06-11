import { CronJob } from "cron";
import { guiasNoEmailIMG, guiasVencemHojeIMG } from "../const.ts";
import { Bot } from "../discord/bot.ts";

export class AccountantBot implements Disposable {
  onEmail: CronJob;
  expire: CronJob;
  constructor(bot: Bot) {
    this.onEmail = CronJob.from({
      cronTime: "0 14 15 * *",
      timeZone: "America/Sao_Paulo",
      onTick: () => bot.send(guiasNoEmailIMG),
    });
    this.expire = CronJob.from({
      cronTime: "0 14 20 * *",
      timeZone: "America/Sao_Paulo",
      onTick: () => bot.send(guiasVencemHojeIMG),
    });
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
