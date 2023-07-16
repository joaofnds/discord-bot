import assert from "node:assert";
import { test } from "node:test";
import { MessageMock } from "../../test/message-mock.mjs";
import { RememberWhenCalled } from "../../test/remember-when-called.mjs";
import { linkChain } from "./link-chain.mjs";
import { Reply } from "./reply.mjs";

test(Reply.name, async (t) => {
  const randomFolk = "chuck tesla!";

  await t.test("matches", async (t) => {
    const testCases = [
      ["bolsonaro", "e o PT hein? e o lula?"],
      ["Bolsonaro", "e o PT hein? e o lula?"],
      ["BOLSONARO", "e o PT hein? e o lula?"],
      ["citando aleatoriamente", randomFolk],
      ["CiTaNdO AlEaToRiAmEnTe", randomFolk],
      ["CITANDO ALEATORIAMENTE", randomFolk],
    ];

    for (const [input, expected] of testCases) {
      await t.test(`for '${input}' returns '${expected}'`, async () => {
        const message = new MessageMock(input);

        await new Reply(randomFolk).handle(message);

        assert.deepEqual(message.replies, [expected]);
      });
    }
  });

  await t.test("calls next when it does not match", async (t) => {
    const reply = new Reply(randomFolk);
    const remember = new RememberWhenCalled();
    const message = new MessageMock("foo");

    await linkChain(reply, remember).handle(message);

    assert.deepEqual(message.replies, []);
    assert(remember.called);
  });
});
