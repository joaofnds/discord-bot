import assert from "node:assert";
import { describe, it } from "node:test";
import { MessageMock } from "../../test/message-mock.mjs";
import { RememberWhenCalled } from "../../test/remember-when-called.mjs";
import { GitHubIssue } from "./github-issue.mjs";
import { linkChain } from "./link-chain.mjs";

describe(GitHubIssue.name, () => {
	const baseURL = "https://github.com/joaofnds/dotfiles/issues";
	const channelID = new MessageMock().channel.id;
	const githubIssue = new GitHubIssue(baseURL, channelID);

	const testCases = [
		["#123", `${baseURL}/123`],
		["#456", `${baseURL}/456`],
		["#123 #456", `${baseURL}/123\n${baseURL}/456`],

		["here's the issues #123 #456", `${baseURL}/123\n${baseURL}/456`],
		["#123 #456 are the ones", `${baseURL}/123\n${baseURL}/456`],
		["#123 and #456", `${baseURL}/123\n${baseURL}/456`],
		[
			"you should look at #123, #456, and #789 for reference",
			`${baseURL}/123\n${baseURL}/456\n${baseURL}/789`,
		],
	];

	for (const [input, expected] of testCases) {
		it(`for '${input}' replies '${expected}'`, async () => {
			const message = new MessageMock(input);

			await githubIssue.handle(message);

			assert.deepEqual(message.channel.messages, [expected]);
		});
	}

	it("does not call next when channel and message matches", async () => {
		const remember = new RememberWhenCalled();
		const message = new MessageMock("#123");

		await linkChain(githubIssue, remember).handle(message);

		assert.deepEqual(message.channel.messages, [`${baseURL}/123`]);
		assert(!remember.called);
	});

	it("calls next when channel does not match", async () => {
		const remember = new RememberWhenCalled();
		const message = new MessageMock("#123");
		message.channel.id = "other id";

		await linkChain(githubIssue, remember).handle(message);

		assert.deepEqual(message.channel.messages, []);
		assert(remember.called);
	});

	it("calls next when message does not match", async () => {
		const remember = new RememberWhenCalled();
		const message = new MessageMock("foo");

		await linkChain(githubIssue, remember).handle(message);

		assert.deepEqual(message.channel.messages, []);
		assert(remember.called);
	});
});
