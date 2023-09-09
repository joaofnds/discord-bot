import { CronJob } from "cron";

export class Stanley5pmCron {
	constructor(client, bot) {
		this.client = client;
		this.bot = bot;
		this.cron = new CronJob({
			cronTime: "0 18 * * 1-5",
			timeZone: "America/Sao_Paulo",
			onTick: this.run.bind(this),
		});
	}

	start() {
		this.cron.start();
	}

	async run() {
		await this.client.voiceDisconnect("trabalho", "sthefanoss");
		await this.bot.send("então tá pessoal, tchau tchau!");
		await this.bot.send(
			"https://tenor.com/view/the-office-stanley-time-to-go-work-life-got-to-go-gif-4242766",
		);
	}
}
