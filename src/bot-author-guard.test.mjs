import assert from "node:assert";
import { test } from "node:test";
import { MessageMock } from "../test/message-mock.mjs";
import { RememberWhenCalled } from "../test/remember-when-called.mjs";
import { BotAuthorGuard } from "./bot-author-guard.mjs";
import { linkChain } from "./util.mjs";

test(BotAuthorGuard.name, async (t) => {
  await t.test("when message is from bot", async (t) => {
    await t.test("does not call next", async (t) => {
      const botGuard = new BotAuthorGuard();
      const remember = new RememberWhenCalled();
      const message = new MessageMock();
      message.author.bot = true;

      await linkChain(botGuard, remember).handle(message);

      assert(!remember.called);
    });
  });

  await t.test("when message is not from bot", async (t) => {
    await t.test("calls next", async (t) => {
      const botGuard = new BotAuthorGuard();
      const remember = new RememberWhenCalled();
      const message = new MessageMock();

      await linkChain(botGuard, remember).handle(message);

      assert(!message.author.bot);
      assert(remember.called);
    });
  });
});
