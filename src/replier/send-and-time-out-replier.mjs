export class SendAndTimeoutReplier {
	#timeout;
	#response;
	#regexes;
	#lastReply;

	constructor(timeout, response, ...regexes) {
		this.#timeout = timeout;
		this.#response = response;
		this.#regexes = regexes;
		this.#lastReply = 0;
	}

	reply(str) {
		if (this.isTimedOut()) return;

		if (this.#regexes.some((regex) => regex.test(str))) {
			this.#lastReply = Date.now();
			return this.#response;
		}
	}

	isTimedOut() {
		const elapsedSinceLastReply = Date.now() - this.#lastReply;
		return elapsedSinceLastReply < this.#timeout;
	}
}
