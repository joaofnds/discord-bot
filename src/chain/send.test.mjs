import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import { MessageMock } from "../../test/message-mock.mjs";
import { RememberWhenCalled } from "../../test/remember-when-called.mjs";
import { linkChain } from "./link-chain.mjs";
import { Send } from "./send.mjs";

describe(Send.name, async () => {
	let sut;

	beforeEach(() => {
		sut = new Send();
	});

	describe("when matches", async () => {
		const testCases = [
			["channel errado", "channel errado"],
			["CHANNEL ERRADO", "channel errado"],
			["ChAnNeL eRrAdO", "channel errado"],

			["canal errado", "canal errado"],
			["CANAL ERRADO", "canal errado"],
			["CaNaL eRrAdO", "canal errado"],
		];

		for (const [input, expected] of testCases) {
			it(`for '${input}' replies with '${expected}'`, async () => {
				const message = new MessageMock(input);

				await sut.handle(message);

				assert.deepEqual(message.channel.messages, [expected]);
			});
		}
	});

	describe("when does not match", async () => {
		const testCases = ["channel certo", "canal certo"];

		for (const input of testCases) {
			it(`does not reply: ${input}`, async () => {
				const reply = sut;
				const remember = new RememberWhenCalled();
				const message = new MessageMock(input);

				await linkChain(reply, remember).handle(message);

				assert.deepEqual(message.channel.messages, []);
				assert(remember.called);
			});
		}
	});
});
