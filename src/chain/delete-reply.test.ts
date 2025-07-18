import { expect } from "@std/expect";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { MessageMock } from "../../test/message-mock.ts";
import { censored } from "../const.ts";
import { DeleteReply } from "./delete-reply.ts";

describe(DeleteReply.name, () => {
  let sut: DeleteReply;

  beforeEach(() => {
    sut = new DeleteReply();
  });

  const testCases = [
    ["1", "foo", `<@1>\n${censored}`],
    ["2", "bar", `<@2>\n${censored}`],
    ["3", "baz", `<@3>\n${censored}`],
  ];

  for (const [authorId, content, expected] of testCases) {
    it(`for '${content}' from ${authorId} replies with '${expected}'`, async () => {
      const message = new MessageMock(content);
      message.author.id = authorId;

      await sut.handle(message);

      expect(message.channel.messages).toEqual([expected]);
    });
  }
});
