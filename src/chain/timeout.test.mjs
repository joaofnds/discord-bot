import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import { MessageMock } from "../../test/message-mock.mjs";
import { RememberWhenCalled } from "../../test/remember-when-called.mjs";
import { parseDuration } from "../lib/parse-duration.mjs";
import * as time from "../lib/time.mjs";
import { linkChain } from "./link-chain.mjs";
import { Timeout } from "./timeout.mjs";

describe(Timeout.name, () => {
  let timeout, remember, handler;
  const timeoutDuration = 10 * time.Millisecond;
  const customDurationString = "20ms";
  const customDuration = parseDuration(customDurationString);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  beforeEach(() => {
    timeout = new Timeout(timeoutDuration);
    remember = new RememberWhenCalled();
    handler = linkChain(timeout, remember);
  });

  it("calls next when it does not match", async () => {
    let message = new MessageMock("foo");
    await handler.handle(message);
    assert(remember.called);
  });

  for (const msg of ["!shut", "!SHUT", "!ShUt"]) {
    it(`starts timeout when using ${msg}`, async () => {
      let message = new MessageMock(msg);
      await handler.handle(message);
      assert.deepEqual(message.reacts, ["🙇"]);
      assert(!remember.called);

      message = new MessageMock("foo");
      await handler.handle(message);
      assert(!remember.called);
    });
  }

  it("removes timeout", async () => {
    let message = new MessageMock("!shut");
    await handler.handle(message);
    assert.deepEqual(message.reacts, ["🙇"]);
    assert(!remember.called);

    await sleep(timeoutDuration);

    message = new MessageMock("foo");
    await handler.handle(message);
    assert(remember.called);
  });

  for (const msg of ["!!shut", "!!SHUT", "!!ShUt"]) {
    it(`manually remove timeout using ${msg}`, async () => {
      let message = new MessageMock("!shut");
      await handler.handle(message);
      assert.deepEqual(message.reacts, ["🙇"]);
      assert(!remember.called);

      message = new MessageMock(msg);
      await handler.handle(message);
      assert.deepEqual(message.reacts, ["🙇"]);
      assert(!remember.called);

      message = new MessageMock("foo");
      await handler.handle(message);
      assert(remember.called);
    });
  }

  for (const msg of ["something !shut", "something else !!shut"]) {
    it(`ignores ${msg}`, async () => {
      let message = new MessageMock(msg);
      await handler.handle(message);
      assert.deepEqual(message.reacts, []);
    });
  }

  describe("custom timeout duration", () => {
    it("sets the provided duration", async () => {
      let message = new MessageMock(`!shut ${customDurationString}`);
      await handler.handle(message);
      assert.deepEqual(message.reacts, ["🙇"]);
      assert(!remember.called);

      await sleep(timeoutDuration);
      message = new MessageMock("foo");
      await handler.handle(message);
      assert(!remember.called);

      await sleep(customDuration);

      message = new MessageMock("foo");
      await handler.handle(message);
      assert(remember.called);
    });

    describe("when duration is invalid", () => {
      it("uses default duration", async () => {
        let message = new MessageMock("!shut foo");
        await handler.handle(message);
        assert.deepEqual(message.reacts, ["🙇"]);
        assert(!remember.called);

        message = new MessageMock("foo");
        await handler.handle(message);
        assert(!remember.called);

        await sleep(timeoutDuration);

        message = new MessageMock("foo");
        await handler.handle(message);
        assert(remember.called);
      });
    });
  });
});
