import assert from "node:assert";
import { describe, it } from "node:test";
import { MessageMock } from "../../test/message-mock.mjs";
import { RememberWhenCalled } from "../../test/remember-when-called.mjs";
import { linkChain } from "./link-chain.mjs";
import { Reply } from "./reply.mjs";

describe(Reply.name, async () => {
  const randomFolk = "chuck tesla!";

  describe("when matches", async () => {
    const testCases = [
      ["bolsonaro", "e o PT hein? e o lula?"],
      ["Bolsonaro", "e o PT hein? e o lula?"],
      ["BOLSONARO", "e o PT hein? e o lula?"],
      ["citando aleatoriamente", randomFolk],
      ["CiTaNdO AlEaToRiAmEnTe", randomFolk],
      ["CITANDO ALEATORIAMENTE", randomFolk],
    ];

    for (const [input, expected] of testCases) {
      it(`for '${input}' returns '${expected}'`, async () => {
        const message = new MessageMock(input);

        await new Reply(randomFolk).handle(message);

        assert.deepEqual(message.replies, [expected]);
      });
    }
  });

  describe("when does not match", async () => {
    it("calls next", async () => {
      const reply = new Reply(randomFolk);
      const remember = new RememberWhenCalled();
      const message = new MessageMock("foo");

      await linkChain(reply, remember).handle(message);

      assert.deepEqual(message.replies, []);
      assert(remember.called);
    });
  });
});
