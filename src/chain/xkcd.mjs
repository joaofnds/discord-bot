import { stupidID } from "../const.mjs";
import { normalize } from "../lib/normalize.mjs";
import { Chain } from "./chain.mjs";

export class XKCD extends Chain {
	command = /^!xkcd/gi;

	constructor(api) {
		super();
		this.api = api;
	}

	async handle(message) {
		const str = normalize(message.content);

		if (!this.command.test(str)) return this.next?.handle(message);

		const input = str.replace(this.command, "").trim();

		if (input === "random") {
			const comic = await this.api.random();
			await message.channel.send({ content: comic.title, files: [comic.img] });
			return;
		}

		const number = parseInt(input);
		if (isNaN(number)) {
			message.react(stupidID);
			return;
		}

		const comic = await this.api.comic(number);
		await message.channel.send({ content: comic.title, files: [comic.img] });
	}
}
