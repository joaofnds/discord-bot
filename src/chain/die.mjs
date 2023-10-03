import { normalize } from "../lib/normalize.mjs";
import { Chain } from "./chain.mjs";

export class Die extends Chain {
	command = /^!die/gi;

	constructor(callback) {
		super();
		this.callback = callback;
	}

	async handle(message) {
		const str = normalize(message.content);

		if (!this.command.test(str)) return this.next?.handle(message);

		this.callback();
	}
}
