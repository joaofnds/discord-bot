import { normalize } from "../lib/normalize.mjs";
import { parseDuration } from "../lib/parse-duration.mjs";
import { Chain } from "./chain.mjs";

export class Timeout extends Chain {
	#duration;
	#timeoutUntil = Date.now();
	#shutCommand = /^!shut/i;

	constructor(duration) {
		super();
		this.#duration = duration;
	}

	async handle(message) {
		const content = normalize(message.content);

		if (this.#isRemovingTimeout(content)) {
			this.#timeoutUntil = Date.now();
			return message.react("🙇");
		}

		if (this.#isSettingTimeout(content)) {
			const duration = this.#getTimeoutDuration(message);
			this.#timeoutUntil = Date.now() + duration;
			return message.react("🙇");
		}

		if (!this.#isTimeoutExpired()) return;

		return this.next?.handle(message);
	}

	#isSettingTimeout(content) {
		return this.#shutCommand.test(content);
	}

	#isRemovingTimeout(content) {
		return /^!!shut/i.test(content);
	}

	#isTimeoutExpired() {
		return Date.now() >= this.#timeoutUntil;
	}

	#getTimeoutDuration(message) {
		const messageWithoutCommand = message.content
			.replace(this.#shutCommand, "")
			.trim();

		if (!messageWithoutCommand) return this.#duration;

		return parseDuration(messageWithoutCommand) || this.#duration;
	}
}
