import { expect } from "@std/expect";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { MessageMock } from "../../test/message-mock.ts";
import { RememberWhenCalled } from "../../test/remember-when-called.ts";
import { parseDuration } from "../lib/parse-duration.ts";
import time from "../lib/time.ts";
import { Chain } from "./chain.ts";
import { linkChain } from "./link-chain.ts";
import { Timeout } from "./timeout.ts";

describe(Timeout.name, () => {
  let timeout;
  let remember: RememberWhenCalled;
  let handler: Chain;
  const timeoutDuration = 10 * time.Millisecond;
  const customDurationString = "20ms";
  const customDuration = parseDuration(customDurationString)!;

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  beforeEach(() => {
    timeout = new Timeout(timeoutDuration);
    remember = new RememberWhenCalled();
    handler = linkChain(timeout, remember);
  });

  it("calls next when it does not match", async () => {
    const message = new MessageMock("foo");
    await handler.handle(message);
    expect(remember.called).toEqual(true);
  });

  for (const msg of ["!shut", "!SHUT", "!ShUt"]) {
    it(`starts timeout when using ${msg}`, async () => {
      let message = new MessageMock(msg);
      await handler.handle(message);
      expect(message.reacts).toEqual(["🙇"]);
      expect(remember.called).toEqual(false);

      message = new MessageMock("foo");
      await handler.handle(message);
      expect(remember.called).toEqual(false);
    });
  }

  it("removes timeout", async () => {
    let message = new MessageMock("!shut");
    await handler.handle(message);
    expect(message.reacts).toEqual(["🙇"]);
    expect(remember.called).toEqual(false);

    await sleep(timeoutDuration);

    message = new MessageMock("foo");
    await handler.handle(message);
    expect(remember.called).toEqual(true);
  });

  for (const msg of ["!!shut", "!!SHUT", "!!ShUt"]) {
    it(`manually remove timeout using ${msg}`, async () => {
      let message = new MessageMock("!shut");
      await handler.handle(message);
      expect(message.reacts).toEqual(["🙇"]);
      expect(remember.called).toEqual(false);

      message = new MessageMock(msg);
      await handler.handle(message);
      expect(message.reacts).toEqual(["🙇"]);
      expect(remember.called).toEqual(false);

      message = new MessageMock("foo");
      await handler.handle(message);
      expect(remember.called).toEqual(true);
    });
  }

  for (const msg of ["something !shut", "something else !!shut"]) {
    it(`ignores ${msg}`, async () => {
      const message = new MessageMock(msg);
      await handler.handle(message);
      expect(message.reacts).toEqual([]);
    });
  }

  describe("custom timeout duration", () => {
    it("sets the provided duration", async () => {
      let message = new MessageMock(`!shut ${customDurationString}`);
      await handler.handle(message);
      expect(message.reacts).toEqual(["🙇"]);
      expect(remember.called).toEqual(false);

      await sleep(timeoutDuration);
      message = new MessageMock("foo");
      await handler.handle(message);
      expect(remember.called).toEqual(false);

      await sleep(customDuration);

      message = new MessageMock("foo");
      await handler.handle(message);
      expect(remember.called).toEqual(true);
    });

    describe("when duration is invalid", () => {
      it("uses default duration", async () => {
        let message = new MessageMock("!shut foo");
        await handler.handle(message);
        expect(message.reacts).toEqual(["🙇"]);
        expect(remember.called).toEqual(false);

        message = new MessageMock("foo");
        await handler.handle(message);
        expect(remember.called).toEqual(false);

        await sleep(timeoutDuration);

        message = new MessageMock("foo");
        await handler.handle(message);
        expect(remember.called).toEqual(true);
      });
    });
  });
});
