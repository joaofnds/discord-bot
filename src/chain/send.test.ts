import { expect } from "@std/expect";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { MessageMock } from "../../test/message-mock.ts";
import { RememberWhenCalled } from "../../test/remember-when-called.ts";
import { linkChain } from "./link-chain.ts";
import { Send } from "./send.ts";

describe(Send.name, () => {
  let sut: Send;

  beforeEach(() => {
    sut = new Send();
  });

  describe("when matches", () => {
    const testCases = [
      ["channel errado", "channel errado"],
      ["CHANNEL ERRADO", "channel errado"],
      ["ChAnNeL eRrAdO", "channel errado"],
      [" channel errado", "channel errado"],
      ["channel errado ", "channel errado"],
      [" channel errado ", "channel errado"],

      ["canal errado", "canal errado"],
      ["CANAL ERRADO", "canal errado"],
      ["CaNaL eRrAdO", "canal errado"],
      [" canal errado", "canal errado"],
      ["canal errado ", "canal errado"],
      [" canal errado ", "canal errado"],
    ];

    for (const [input, expected] of testCases) {
      it(`for '${input}' replies with '${expected}'`, async () => {
        const message = new MessageMock(input);

        await sut.handle(message);

        expect(message.channel.messages).toEqual([expected]);
      });
    }
  });

  describe("when does not match", () => {
    const testCases = [
      "channel certo",
      "something channel errado",
      "channel errado something",
      "canal certo",
      "something canal errado",
      "canal errado something",
    ];

    for (const input of testCases) {
      it(`does not reply: ${input}`, async () => {
        const remember = new RememberWhenCalled();
        const message = new MessageMock(input);

        await linkChain(sut, remember).handle(message);

        expect(message.channel.messages).toEqual([]);
        expect(remember.called).toBe(true);
      });
    }
  });
});
