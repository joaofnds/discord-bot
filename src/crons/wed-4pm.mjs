import { CronJob } from "cron";
import { wed4pm } from "../const.mjs";

export class Web4pmCron {
	constructor(bot) {
		this.bot = bot;
		this.cron = new CronJob({
			cronTime: "0 16 * * 3",
			timeZone: "America/Sao_Paulo",
			onTick: this.run.bind(this),
		});
	}

	start() {
		this.cron.start();
	}

	async run() {
		await this.bot.send(wed4pm);
	}
}
