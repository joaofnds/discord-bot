import { assert } from "@std/assert";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { MessageMock } from "../../test/message-mock.ts";
import { RememberWhenCalled } from "../../test/remember-when-called.ts";
import { pragTips } from "../const.ts";
import { linkChain } from "./link-chain.ts";
import { PragTip } from "./pragtip.ts";

describe(PragTip.name, () => {
  const sut = new PragTip();

  const testCases = pragTips.map((content, i) => [
    `!pragtip ${i + 1}`,
    content,
  ]);

  for (const [i, expected] of testCases) {
    it(`for '${i}' returns correct tip`, async () => {
      const message = new MessageMock(i);

      await sut.handle(message);

      expect(message.channel.messages).toEqual([expected]);
    });
  }

  it("calls next when it does not match", async () => {
    const remember = new RememberWhenCalled();
    const message = new MessageMock("foo");

    await linkChain(sut, remember).handle(message);

    expect(message.channel.messages).toEqual([]);
    assert(remember.called);
  });
});
