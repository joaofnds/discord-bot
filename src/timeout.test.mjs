import assert from "node:assert";
import { test } from "node:test";
import { MessageMock } from "../test/message-mock.mjs";
import { RememberWhenCalled } from "../test/remember-when-called.mjs";
import { timeSpanInMs } from "./time.mjs";
import { Timeout } from "./timeout.mjs";
import { linkChain } from "./util.mjs";

test(Timeout.name, async (t) => {
  await t.test("calls next when it does not match", async (t) => {
    const timeoutDuration = timeSpanInMs(5, "milliseconds");
    const timeout = new Timeout(timeoutDuration);
    const remember = new RememberWhenCalled();
    const handler = linkChain(timeout, remember);

    let message = new MessageMock("foo");
    await handler.handle(message);
    assert(remember.called);

    remember.reset();
    message = new MessageMock("!shut");
    await handler.handle(message);
    assert.deepEqual(message.reacts, ["🙇"]);
    assert(!remember.called);

    message = new MessageMock("foo");
    await handler.handle(message);
    assert(!remember.called);

    await new Promise((resolve) => setTimeout(resolve, timeoutDuration));

    message = new MessageMock("foo");
    await handler.handle(message);
    assert(remember.called);
  });
});
