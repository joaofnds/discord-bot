import { beforeEach, describe, expect, it } from "bun:test";
import { MessageMock } from "../../test/message-mock.ts";
import { RememberWhenCalled } from "../../test/remember-when-called.ts";
import { linkChain } from "./link-chain.ts";
import { Repeat } from "./repeat.ts";

describe(Repeat.name, () => {
  let bot: Repeat;

  beforeEach(() => {
    bot = new Repeat();
  });

  const replyCases = [
    ["some message", "some message"],
    ["spaces don't matter", " spaces  don't  matter "],
    ["punctuation doesn't matter", "punctuation doesnt matter"],
    ["case doesn't matter", "CASE DOESNT MATTER"],
    ["diacritics don't matter áèïõû", "diacritics don't matter aeiou"],
    ["😐", "😐"],
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

  const notReplyCases = [
    ["some message", "some other message"],
    ["", "some message"],
    ["some message", ""],
    ["", ""],
    [" ", " "],
    ["~", "~"],
    ["~", "-"],
  ];
  for (const [last, current] of notReplyCases) {
    it(`does not reply if last message was '${last}' and current message is '${current}'`, async () => {
      const remember = new RememberWhenCalled();
      const firstMessage = new MessageMock(last);
      const secondMessage = new MessageMock(current);

      await linkChain(bot, remember).handle(firstMessage);
      expect(firstMessage.channel.messages).toEqual([]);
      expect(remember.count).toEqual(1);

      await linkChain(bot, remember).handle(secondMessage);
      expect(secondMessage.channel.messages).toEqual([]);
      expect(remember.count).toEqual(2);
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

  it("echoes a run once, however many times it repeats", async () => {
    const remember = new RememberWhenCalled();
    const chain = linkChain(bot, remember);
    const message = new MessageMock("some message");
    await chain.handle(message);
    await chain.handle(message);

    await chain.handle(message);
    await chain.handle(message);

    expect(message.channel.messages).toEqual([message.content]);
    expect(remember.count).toEqual(3);
  });

  it("echoes the same text again after a different message ends the run", async () => {
    const message = new MessageMock("some message");
    const otherMessage = new MessageMock("some other message");
    otherMessage.channel.id = message.channel.id;
    await bot.handle(message);
    await bot.handle(message);

    await bot.handle(otherMessage);
    await bot.handle(message);
    await bot.handle(message);

    expect(message.channel.messages).toEqual([
      message.content,
      message.content,
    ]);
  });

  it("echoes each run on its own", async () => {
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

  it("echoes a run in each channel", async () => {
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
