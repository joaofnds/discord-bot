import { pragtips, stupidID } from "../const.mjs";
import { captures } from "../lib/captures.mjs";
import { normalize } from "../lib/normalize.mjs";
import { Chain } from "./chain.mjs";

export class PragTip extends Chain {
	command = /^!pragtip (\d+)/i;

	async handle(message) {
		const str = normalize(message.content);

		if (!this.command.test(str)) return this.next?.handle(message);

		const matches = captures(this.command, str);
		if (matches.length !== 1) {
			message.react(stupidID);
			return;
		}

		const tipNumber = Number.parseInt(matches[0]);

		const tip = pragtips[tipNumber - 1];
		if (!tip) {
			message.react(stupidID);
			return;
		}

		await message.channel.send(tip);
	}
}
