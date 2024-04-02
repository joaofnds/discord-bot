import assert from "node:assert";
import { describe, it } from "node:test";
import { MessageMock } from "../../test/message-mock.mjs";
import { RememberWhenCalled } from "../../test/remember-when-called.mjs";
import { pragTips } from "../const.mjs";
import { linkChain } from "./link-chain.mjs";
import { PragTip } from "./pragtip.mjs";

describe(PragTip.name, () => {
	const sut = new PragTip();

	const testCases = pragTips.map((content, i) => [
		`!pragtip ${i + 1}`,
		content,
	]);

	for (const [i, expected] of testCases) {
		it(`for '${i}' returns correct tip`, async () => {
			const message = new MessageMock(i);

			await sut.handle(message);

			assert.deepEqual(message.channel.messages, [expected]);
		});
	}

	it("calls next when it does not match", async () => {
		const remember = new RememberWhenCalled();
		const message = new MessageMock("foo");

		await linkChain(sut, remember).handle(message);

		assert.deepEqual(message.channel.messages, []);
		assert(remember.called);
	});
});
