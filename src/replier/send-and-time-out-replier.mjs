export class SendAndTimeoutReplier {
	#timeout;
	#response;
	#regexes;

	constructor(timeout, response, ...regexes) {
		this.#timeout = timeout;
		this.#response = response;
		this.#regexes = regexes;
	}

	reply(str) {
		if (this.#timeout.isActive()) return;

		if (this.#regexes.some((regex) => regex.test(str))) {
			this.#timeout.start();
			return this.#response;
		}
	}
}
