import { expect } from "@std/expect";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { MockTimeout } from "../../test/timeout-mock.ts";
import { SendAndTimeoutReplier } from "./send-and-time-out-replier.ts";

describe(SendAndTimeoutReplier.name, () => {
  const timeout = new MockTimeout();

  beforeEach(() => timeout.reset());

  describe("when matches", () => {
    it("replies", () => {
      const replier = new SendAndTimeoutReplier(timeout, "bar", /foo/);

      const response = replier.reply("foo");
      expect(response).toEqual("bar");
    });

    it("starts timeout", () => {
      const replier = new SendAndTimeoutReplier(timeout, "bar", /foo/);
      expect(timeout.startCalls).toEqual(0);

      replier.reply("foo");

      expect(timeout.startCalls).toEqual(1);
    });

    it("stops replying", () => {
      const replier = new SendAndTimeoutReplier(timeout, "bar", /foo/);

      expect(replier.reply("foo")).toEqual("bar");

      expect(replier.reply("foo")).toEqual(undefined);
      expect(replier.reply("foo")).toEqual(undefined);
      expect(replier.reply("foo")).toEqual(undefined);
    });
  });

  describe("when does not match", () => {
    it("does not reply", () => {
      const replier = new SendAndTimeoutReplier(timeout, "bar", /foo/);

      const response = replier.reply("baz");
      expect(response).toEqual(undefined);
    });

    it("does not start timeout", () => {
      const replier = new SendAndTimeoutReplier(timeout, "bar", /foo/);

      replier.reply("baz");

      expect(timeout.startCalls).toEqual(0);
    });
  });

  describe("when timeout expires", () => {
    it("replies", () => {
      const replier = new SendAndTimeoutReplier(timeout, "bar", /foo/);

      expect(replier.reply("foo")).toEqual("bar");
      expect(replier.reply("foo")).toEqual(undefined);

      timeout.expire();

      expect(replier.reply("foo")).toEqual("bar");
    });
  });
});
