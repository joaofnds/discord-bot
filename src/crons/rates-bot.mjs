import { CronJob } from "cron";

export class RatesBot {
	constructor(richDadBot, poorDadBot, apiURL, apiKey) {
		this.richDadBot = richDadBot;
		this.poorDadBot = poorDadBot;
		this.apiURL = apiURL;
		this.apiKey = apiKey;
		this.cron = new CronJob({
			cronTime: "0 10,14,18 * * 1-5",
			timeZone: "America/Sao_Paulo",
			onTick: this.run.bind(this),
		});
	}

	start() {
		this.cron.start();
	}

	async run() {
		const response = await fetch(`${this.apiURL}?access_key=${this.apiKey}`);
		const { rates } = await response.json();

		const arsbrl = (1 / rates.ARS) * rates.BRL;
		const eurbrl = (1 / rates.EUR) * rates.BRL;
		const usdbrl = (1 / rates.USD) * rates.BRL;
		const btcbrl = (1 / rates.BTC) * rates.USD;

		const bot = usdbrl >= 5.2 ? this.richDadBot : this.poorDadBot;

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
