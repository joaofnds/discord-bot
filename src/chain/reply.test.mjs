import assert from "node:assert";
import { describe, it } from "node:test";
import { MessageMock } from "../../test/message-mock.mjs";
import { RememberWhenCalled } from "../../test/remember-when-called.mjs";
import { devops, linux } from "../const.mjs";
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

      ["fulano é devops", devops],
      ["FuLaNo É DeVoPs", devops],
      ["FULANO É DEVOPS", devops],

      ["estão contratando devops", devops],
      ["contrataram DevOps", devops],
      ["contratar dEVoPS", devops],
    ];

    for (const [input, expected] of testCases) {
      it(`for '${input}' returns '${expected}'`, async () => {
        const message = new MessageMock(input);

        await new Reply(randomFolk).handle(message);

        assert.deepEqual(message.replies, [expected]);
      });
    }
  });

  describe("probable responses", async () => {
    const testCases = [
      ["linux", linux],
      ["LiNuX", linux],
      ["LINUX", linux],
    ];

    for (const [input, expected] of testCases) {
      it(`does not always reply: ${input}`, async () => {
        const message = new MessageMock(input);

        let previousLength = message.replies.length;
        while (true) {
          await new Reply(randomFolk).handle(message);
          if (message.replies.length === previousLength) break;
          previousLength = message.replies.length;
        }
      });

      it(`for '${input}', eventually replies '${expected}'`, async () => {
        const message = new MessageMock(input);

        while (message.replies.length === 0) {
          await new Reply(randomFolk).handle(message);
        }

        assert.deepEqual(message.replies, [expected]);
      });
    }

    const negativeTestCases = [
      ["gnu/linux", linux],
      ["GNU/Linux", linux],
      ["GNU/LINUX", linux],
    ];

    for (const [input, expected] of negativeTestCases) {
      const attempts = 100;
      it(`does not reply ${input} in ${attempts} attempts`, async () => {
        const message = new MessageMock(input);

        for (let i = 0; i < attempts; i++)
          await new Reply(randomFolk).handle(message);

        assert.deepEqual(message.replies, []);
      });
    }
  });

  describe("when does not match", async () => {
    const testCases = ["foo", "the devops movement"];

    for (const input of testCases) {
      it(`does not reply: ${input}`, async () => {
        const reply = new Reply(randomFolk);
        const remember = new RememberWhenCalled();
        const message = new MessageMock(input);

        await linkChain(reply, remember).handle(message);

        assert.deepEqual(message.replies, []);
        assert(remember.called);
      });
    }
  });
});
