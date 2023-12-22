import { normalize } from "../lib/normalize.mjs";
import * as time from "../lib/time.mjs";
import { SendAndTimeoutReplier } from "../replier/send-and-time-out-replier.mjs";
import { Chain } from "./chain.mjs";

export class Send extends Chain {
	constructor() {
		super();
		this.responses = [
			new SendAndTimeoutReplier(
				1 * time.Minute,
				"channel errado",
				/^channel errado$/i,
			),
			new SendAndTimeoutReplier(
				1 * time.Minute,
				"canal errado",
				/^canal errado$/i,
			),
		];
	}

	async handle(message) {
		const str = normalize(message.content).trim();

		for (const response of this.responses) {
			const reply = response.reply(str);
			if (reply) return message.channel.send(reply);
		}

		this.next?.handle(message);
	}
}
