import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import { MessageMock } from "../../test/message-mock.mjs";
import { RememberWhenCalled } from "../../test/remember-when-called.mjs";
import { Die } from "./die.mjs";
import { linkChain } from "./link-chain.mjs";

describe(Die.name, () => {
	let die;
	let callbackCalled;
	function callback() {
		callbackCalled = true;
	}

	beforeEach(() => {
		callbackCalled = false;
		die = new Die(callback);
	});

	const testCases = ["!die", "!die foo", "!die bar", "!die baz", "!die qux"];

	for (const input of testCases) {
		it(`calls callback for ${input}`, async () => {
			assert(!callbackCalled);

			await die.handle(new MessageMock(input));

			assert(callbackCalled);
		});
	}

	it("calls next when it does not match", async () => {
		const remember = new RememberWhenCalled();
		const message = new MessageMock("foo");

		await linkChain(die, remember).handle(message);

		assert.deepEqual(message.channel.messages, []);
		assert(remember.called);
		assert(!callbackCalled);
	});
});
