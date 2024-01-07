export class MockTimeout {
	#active = false;
	#startCalls = 0;
	#isActiveCalls = 0;

	get startCalls() {
		return this.#startCalls;
	}

	get isActiveCalls() {
		return this.#isActiveCalls;
	}

	start() {
		this.#startCalls++;
		this.#active = true;
	}

	isActive() {
		this.#isActiveCalls++;
		return this.#active;
	}

	expire() {
		this.#active = false;
	}

	reset() {
		this.#active = false;
		this.#startCalls = 0;
		this.#isActiveCalls = 0;
	}
}
