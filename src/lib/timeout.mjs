export class Timeout {
	#now;
	#duration;
	#start;

	constructor(now, duration) {
		this.#now = now;
		this.#duration = duration;
		this.#start = Number.MIN_SAFE_INTEGER;
	}

	static withDuration(duration) {
		return new Timeout(() => Date.now(), duration);
	}

	start() {
		this.#start = this.#now();
	}

	isActive() {
		const elapsed = this.#now() - this.#start;
		return elapsed <= this.#duration;
	}
}
