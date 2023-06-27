import assert from "node:assert";
import { test } from "node:test";
import { MessageMock } from "../test/message-mock.mjs";
import { RememberWhenCalled } from "../test/remember-when-called.mjs";
import { stupid } from "./emojis.mjs";
import { ReplyStupid } from "./reply-stupid.mjs";
import { linkChain } from "./util.mjs";

test(ReplyStupid.name, async (t) => {
  await t.test("when string is non-stupid", async (t) => {
    await t.test("does not reply", async (t) => {
      const sut = new ReplyStupid();
      const message = new MessageMock("JSON HTTP API");

      await sut.handle(message);

      assert.deepEqual(message.replies, []);
    });

    await t.test("calls next", async (t) => {
      const sut = new ReplyStupid();
      const nextInChain = new RememberWhenCalled();
      const message = new MessageMock("JSON HTTP API");

      await linkChain(sut, nextInChain).handle(message);

      assert.ok(nextInChain.called);
    });
  });

  await t.test("replies when string is stupid", async (t) => {
    const sut = new ReplyStupid();
    const message = new MessageMock("Json Http Api");

    await sut.handle(message);

    assert.deepEqual(message.replies, [`JsOn, HtTp, ApI ${stupid}`]);
  });

  await t.test("ignores non-stupid words", async (t) => {
    const sut = new ReplyStupid();
    const message = new MessageMock("Json HTTP Api");

    await sut.handle(message);

    assert.deepEqual(message.replies, [`JsOn, ApI ${stupid}`]);
  });

  await t.test("stupid words", async (t) => {
    const testCases = [
      ["padrao", "PaDrAo " + stupid],
      ["padroes", "PaDrOeS " + stupid],
      ["pattern", "PaTtErN " + stupid],
      ["firebase", "FiReBaSe " + stupid],
      ["simples", "SiMpLeS " + stupid],
      ["Json", "JsOn " + stupid],
      ["Http", "HtTp " + stupid],
      ["Api", "ApI " + stupid],
      ["Dto", "DtO " + stupid],
      ["Url", "UrL " + stupid],
      ["light mode", "LiGhT MoDe " + stupid],
    ];

    for (const [input, expected] of testCases) {
      await t.test(`for '${input}' returns '${expected}'`, async () => {
        const message = new MessageMock(input);

        await new ReplyStupid().handle(message);

        assert.deepEqual(message.replies, [expected]);
      });
    }
  });
});
