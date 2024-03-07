import { CronJob } from "cron";
import { pragtips } from "../const.mjs";

export class PragTipBot {
	constructor(bot) {
		this.bot = bot;
		this.cron = new CronJob({
			cronTime: "0 9 * * 1-5",
			timeZone: "America/Sao_Paulo",
			onTick: this.run.bind(this),
		});
	}

	start() {
		this.cron.start();
	}

	async run() {
		const randomTip = pragtips[Math.floor(Math.random() * tips.length)];
		await this.bot.send(randomTip);
	}
}
