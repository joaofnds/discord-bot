export class WebhookBotPlanReplier {
	constructor(bot, response, ...regexes) {
		this.bot = bot;
		this.response = response;
		this.regexes = regexes;
	}

	reply(str) {
		if (this.regexes.some((regex) => regex.test(str))) {
			this.bot.send(this.response);
		}
	}
}
