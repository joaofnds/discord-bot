import { Chain } from "../src/chain/chain.mjs";

export class RememberWhenCalled extends Chain {
	constructor() {
		super();
		this.called = false;
	}

	async handle(_message) {
		this.called = true;
	}

	reset() {
		this.called = false;
	}
}
