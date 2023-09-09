import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import { MessageMock } from "../../test/message-mock.mjs";
import { neuralizer } from "../const.mjs";
import { DeleteReply } from "./delete-reply.mjs";

describe(DeleteReply.name, async () => {
	let sut;

	beforeEach(() => {
		sut = new DeleteReply();
	});

	const testCases = [
		["1", "foo", `<@1>\n${neuralizer}`],
		["2", "bar", `<@2>\n${neuralizer}`],
		["3", "baz", `<@3>\n${neuralizer}`],
	];

	for (const [authorId, content, expected] of testCases) {
		it(`for '${content}' from ${authorId} replies with '${expected}'`, async () => {
			const message = new MessageMock(content);
			message.setAuthorId(authorId);

			await sut.handle(message);

			assert.deepEqual(message.channel.messages, [expected]);
		});
	}
});
