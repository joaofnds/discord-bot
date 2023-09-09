import { CronJob } from "cron";

export class DadJokeBot {
	constructor(bot, rapidAPIURL, rapidAPIKey) {
		this.bot = bot;
		this.rapidAPIURL = rapidAPIURL;
		this.rapidAPIKey = rapidAPIKey;
		this.cron = new CronJob({
			cronTime: "0 11 * * 1-5",
			timeZone: "America/Sao_Paulo",
			onTick: this.run.bind(this),
		});
	}

	start() {
		this.cron.start();
	}

	async run() {
		const response = await fetch(this.rapidAPIURL, {
			headers: {
				"X-Rapidapi-Key": this.rapidAPIKey,
				"X-Rapidapi-Host": "dad-jokes.p.rapidapi.com",
			},
		});
		const {
			body: [{ setup, punchline }],
		} = await response.json();

		await this.bot.send(setup);
		await new Promise((resolve) => setTimeout(resolve, 20_000));
		await this.bot.send(punchline);
	}
}
