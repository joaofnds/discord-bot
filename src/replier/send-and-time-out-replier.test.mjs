import assert from "node:assert";
import { describe, it } from "node:test";
import { wait } from "../../test/util.mjs";
import * as time from "../lib/time.mjs";
import { SendAndTimeoutReplier } from "./send-and-time-out-replier.mjs";

describe(SendAndTimeoutReplier.name, () => {
	it("replies when matches", async () => {
		const replier = new SendAndTimeoutReplier(1 * time.Second, "bar", /foo/);

		const response = replier.reply("foo");
		assert.equal(response, "bar");
	});

	it("does not reply when does not match", async () => {
		const replier = new SendAndTimeoutReplier(1 * time.Second, "bar", /foo/);

		const response = replier.reply("baz");
		assert.equal(response, undefined);
	});

	it("does not reply when timed out", async () => {
		const replier = new SendAndTimeoutReplier(
			5 * time.Millisecond,
			"bar",
			/foo/,
		);

		assert.equal(replier.reply("foo"), "bar");
		assert.equal(replier.reply("foo"), undefined);
		assert.equal(replier.reply("foo"), undefined);
		assert.equal(replier.reply("foo"), undefined);
	});

	it("replies after timeout", async () => {
		const timeout = 10 * time.Millisecond;
		const replier = new SendAndTimeoutReplier(timeout, "bar", /foo/);

		assert.equal(replier.reply("foo"), "bar");
		assert.equal(replier.reply("foo"), undefined);

		await wait(timeout);

		assert.equal(replier.reply("foo"), "bar");
	});
});
