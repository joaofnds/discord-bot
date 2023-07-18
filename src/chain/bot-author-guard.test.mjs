import assert from "node:assert";
import { describe, it } from "node:test";
import { MessageMock } from "../../test/message-mock.mjs";
import { RememberWhenCalled } from "../../test/remember-when-called.mjs";
import { BotAuthorGuard } from "./bot-author-guard.mjs";
import { linkChain } from "./link-chain.mjs";

describe(BotAuthorGuard.name, async () => {
  describe("when message is from bot", async () => {
    it("does not call next", async () => {
      const botGuard = new BotAuthorGuard();
      const remember = new RememberWhenCalled();
      const message = new MessageMock();
      message.author.bot = true;

      await linkChain(botGuard, remember).handle(message);

      assert(!remember.called);
    });
  });

  describe("when message is not from bot", async () => {
    it("calls next", async () => {
      const botGuard = new BotAuthorGuard();
      const remember = new RememberWhenCalled();
      const message = new MessageMock();

      await linkChain(botGuard, remember).handle(message);

      assert(!message.author.bot);
      assert(remember.called);
    });
  });
});
