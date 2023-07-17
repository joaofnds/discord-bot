import assert from "node:assert";
import { test } from "node:test";
import { MessageMock } from "../../test/message-mock.mjs";
import { RememberWhenCalled } from "../../test/remember-when-called.mjs";
import * as time from "../lib/time.mjs";
import { linkChain } from "./link-chain.mjs";
import { Timeout } from "./timeout.mjs";

test(Timeout.name, async (t) => {
  let timeout, remember, handler;
  const timeoutDuration = 10 * time.Millisecond;

  t.beforeEach(() => {
    timeout = new Timeout(timeoutDuration);
    remember = new RememberWhenCalled();
    handler = linkChain(timeout, remember);
  });

  await t.test("calls next when it does not match", async (t) => {
    let message = new MessageMock("foo");
    await handler.handle(message);
    assert(remember.called);
  });

  for (const msg of ["!shut", "!SHUT", "!ShUt"]) {
    await t.test(`starts timeout when using ${msg}`, async (t) => {
      let message = new MessageMock(msg);
      await handler.handle(message);
      assert.deepEqual(message.reacts, ["🙇"]);
      assert(!remember.called);

      message = new MessageMock("foo");
      await handler.handle(message);
      assert(!remember.called);
    });
  }

  await t.test("removes timeout", async (t) => {
    let message = new MessageMock("!shut");
    await handler.handle(message);
    assert.deepEqual(message.reacts, ["🙇"]);
    assert(!remember.called);

    await new Promise((resolve) => setTimeout(resolve, timeoutDuration));

    message = new MessageMock("foo");
    await handler.handle(message);
    assert(remember.called);
  });

  for (const msg of ["!!shut", "!!SHUT", "!!ShUt"]) {
    await t.test(`manually remove timeout using ${msg}`, async (t) => {
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

  const ignores = ["something !shut", "something else !!shut"];
  for (const msg of ignores) {
    await t.test(`ignores ${msg}`, async (t) => {
      let message = new MessageMock(msg);
      await handler.handle(message);
      assert.deepEqual(message.reacts, []);
    });
  }
});
