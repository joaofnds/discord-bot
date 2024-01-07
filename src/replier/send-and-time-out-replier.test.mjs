import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import { MockTimeout } from "../../test/timeout-mock.mjs";
import { SendAndTimeoutReplier } from "./send-and-time-out-replier.mjs";

describe(SendAndTimeoutReplier.name, () => {
	const timeout = new MockTimeout();

	beforeEach(() => timeout.reset());

	describe("when matches", () => {
		it("replies", async () => {
			const replier = new SendAndTimeoutReplier(timeout, "bar", /foo/);

			const response = replier.reply("foo");
			assert.equal(response, "bar");
		});

		it("starts timeout", async () => {
			const replier = new SendAndTimeoutReplier(timeout, "bar", /foo/);
			assert.equal(timeout.startCalls, 0);

			replier.reply("foo");

			assert.equal(timeout.startCalls, 1);
		});

		it("stops replying", async () => {
			const replier = new SendAndTimeoutReplier(timeout, "bar", /foo/);

			assert.equal(replier.reply("foo"), "bar");

			assert.equal(replier.reply("foo"), undefined);
			assert.equal(replier.reply("foo"), undefined);
			assert.equal(replier.reply("foo"), undefined);
		});
	});

	describe("when does not match", () => {
		it("does not reply", async () => {
			const replier = new SendAndTimeoutReplier(timeout, "bar", /foo/);

			const response = replier.reply("baz");
			assert.equal(response, undefined);
		});

		it("does not start timeout", async () => {
			const replier = new SendAndTimeoutReplier(timeout, "bar", /foo/);

			replier.reply("baz");

			assert.equal(timeout.startCalls, 0);
		});
	});

	describe("when timeout expires", () => {
		it("replies", async () => {
			const replier = new SendAndTimeoutReplier(timeout, "bar", /foo/);

			assert.equal(replier.reply("foo"), "bar");
			assert.equal(replier.reply("foo"), undefined);

			timeout.expire();

			assert.equal(replier.reply("foo"), "bar");
		});
	});
});
