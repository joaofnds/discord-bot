import assert from "node:assert";
import { describe, it } from "node:test";
import { MessageMock } from "../../test/message-mock.mjs";
import { RememberWhenCalled } from "../../test/remember-when-called.mjs";
import { stupidID } from "../const.mjs";
import { Abbrev } from "./abbrev.mjs";
import { linkChain } from "./link-chain.mjs";
import { XKCD } from "./xkcd.mjs";

describe(XKCD.name, () => {
	const random = {
		title: "Random Number",
		img: "https://imgs.xkcd.com/comics/random_number.png",
	};
	const comic = (n) => ({
		title: `Duty Calls - ${n}`,
		img: "https://imgs.xkcd.com/comics/duty_calls.png",
	});
	const api = { random: async () => random, comic: async (n) => comic(n) };

	const xkcd = new XKCD(api);

	const testCases = [
		["!xkcd random", { content: random.title, files: [random.img] }],
		["!xkcd 221", { content: comic(221).title, files: [comic(221).img] }],
		["!xkcd 386", { content: comic(386).title, files: [comic(386).img] }],
		["!xkcd 2.1", { content: comic(2).title, files: [comic(2).img] }],
	];

	for (const [input, expected] of testCases) {
		it(`for '${input}' returns '${expected}'`, async () => {
			const message = new MessageMock(input);

			await xkcd.handle(message);

			assert.deepEqual(message.channel.messages, [expected]);
		});
	}

	it("calls next when it does not match", async () => {
		const remember = new RememberWhenCalled();
		const message = new MessageMock("foo");

		await linkChain(xkcd, remember).handle(message);

		assert.deepEqual(message.channel.messages, []);
		assert(remember.called);
	});

	it("reacts with stupidID when input is not a number", async () => {
		const message = new MessageMock("!xkcd foo");

		await xkcd.handle(message);

		assert.deepEqual(message.channel.messages, []);
		assert.deepEqual(message.reacts, [stupidID]);
	});
});
