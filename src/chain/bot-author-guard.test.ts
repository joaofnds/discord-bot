import { describe, expect, it } from "bun:test";
import { MessageMock } from "../../test/message-mock.ts";
import { RememberWhenCalled } from "../../test/remember-when-called.ts";
import { BotAuthorGuard } from "./bot-author-guard.ts";
import { linkChain } from "./link-chain.ts";

describe(BotAuthorGuard.name, () => {
  describe("when message is from bot", () => {
    it("does not call next", async () => {
      const botGuard = new BotAuthorGuard();
      const remember = new RememberWhenCalled();
      const message = new MessageMock("hi");
      message.author.bot = true;

      await linkChain(botGuard, remember).handle(message);

      expect(remember.called).toBeFalsy();
    });
  });

  describe("when message is not from bot", () => {
    it("calls next", async () => {
      const botGuard = new BotAuthorGuard();
      const remember = new RememberWhenCalled();
      const message = new MessageMock("hi");

      await linkChain(botGuard, remember).handle(message);

      expect(message.author.bot).toBeFalsy();
      expect(remember.called).toBeTruthy();
    });
  });
});
