import { CronJob } from "cron";
import { guiasNoEmailIMG, guiasVencemHojeIMG } from "../const.mjs";

export class AccountantBot {
	constructor(bot) {
		this.onEmail = new CronJob({
			cronTime: "0 14 15 * *",
			timeZone: "America/Sao_Paulo",
			onTick: () => bot.send(guiasNoEmailIMG),
		});
		this.expire = new CronJob({
			cronTime: "0 14 20 * *",
			timeZone: "America/Sao_Paulo",
			onTick: () => bot.send(guiasVencemHojeIMG),
		});
	}

	start() {
		this.onEmail.start();
		this.expire.start();
	}
}
