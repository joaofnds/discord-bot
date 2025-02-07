import { expect } from "@std/expect";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { FakeClock } from "../../test/fake-clock.ts";
import { MessageMock } from "../../test/message-mock.ts";
import { RememberWhenCalled } from "../../test/remember-when-called.ts";
import { linkChain } from "./link-chain.ts";
import { Repeat } from "./repeat.ts";

describe(Repeat.name, () => {
  let bot: Repeat;
  let clock: FakeClock;
  const timeout = 5;

  beforeEach(() => {
    clock = new FakeClock(new Date());
    bot = new Repeat(clock, timeout);
  });

  const replyCases = [
    ["some message", "some message"],
    ["spaces don't matter", " spaces  don't  matter "],
    ["punctuation doesn't matter", "punctuation doesnt matter"],
    ["case doesn't matter", "CASE DOESNT MATTER"],
    ["diacritics don't matter áèïõû", "diacritics don't matter aeiou"],
  ];

  for (const [last, current] of replyCases) {
    it(`replies if last message was '${last}' and current message is '${current}`, async () => {
      const remember = new RememberWhenCalled();
      const firstMessage = new MessageMock(last);
      const secondMessage = new MessageMock(current);

      await linkChain(bot, remember).handle(firstMessage);
      expect(firstMessage.channel.messages).toEqual([]);
      expect(remember.count).toEqual(1);

      await linkChain(bot, remember).handle(secondMessage);
      expect(secondMessage.channel.messages).toEqual([current]);
      expect(remember.count).toEqual(1);
    });
  }

  describe("when channel is different", () => {
    it("does not reply", async () => {
      const remember = new RememberWhenCalled();
      const firstMessage = new MessageMock("some message");
      firstMessage.channel.id = "0";

      const secondMessage = new MessageMock(firstMessage.content);
      secondMessage.channel.id = "1";

      await linkChain(bot, remember).handle(firstMessage);
      expect(remember.count).toEqual(1);
      await linkChain(bot, remember).handle(secondMessage);
      expect(remember.count).toEqual(2);

      expect(firstMessage.channel.messages).toEqual([]);
      expect(secondMessage.channel.messages).toEqual([]);
    });
  });

  it("stops replying for the duration of the timeout", async () => {
    const remember = new RememberWhenCalled();
    const chain = linkChain(bot, remember);
    const message = new MessageMock("some message");

    await chain.handle(message);
    expect(remember.count).toEqual(1);
    expect(message.channel.messages).toEqual([]);

    await chain.handle(message);
    expect(remember.count).toEqual(1);
    expect(message.channel.messages).toEqual([message.content]);

    for (let i = 1; i <= timeout; i++) {
      clock.tick();
      await chain.handle(message);
      expect(remember.count).toEqual(i + 1);
      expect(message.channel.messages).toEqual([message.content]);
    }

    clock.tick();
    await chain.handle(message);
    expect(message.channel.messages).toEqual([
      message.content,
      message.content,
    ]);
    expect(remember.count).toEqual(timeout + 1);
  });

  it("times out per message", async () => {
    const firstMessage = new MessageMock("some message");
    const secondMessage = new MessageMock("some other message");

    await bot.handle(firstMessage);
    expect(firstMessage.channel.messages).toEqual([]);
    await bot.handle(firstMessage);
    expect(firstMessage.channel.messages).toEqual([firstMessage.content]);

    await bot.handle(secondMessage);
    expect(secondMessage.channel.messages).toEqual([]);
    await bot.handle(secondMessage);
    expect(secondMessage.channel.messages).toEqual([secondMessage.content]);
  });

  it("times out per channel", async () => {
    const firstMessage = new MessageMock("some message");
    firstMessage.channel.id = "0";
    const secondMessage = new MessageMock(firstMessage.content);
    secondMessage.channel.id = "1";

    await bot.handle(firstMessage);
    expect(firstMessage.channel.messages).toEqual([]);
    await bot.handle(firstMessage);
    expect(firstMessage.channel.messages).toEqual([firstMessage.content]);

    await bot.handle(secondMessage);
    expect(secondMessage.channel.messages).toEqual([]);
    await bot.handle(secondMessage);
    expect(secondMessage.channel.messages).toEqual([secondMessage.content]);
  });
});
