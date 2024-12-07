import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { MessageMock } from "../../test/message-mock.ts";
import { RememberWhenCalled } from "../../test/remember-when-called.ts";
import { stupidID } from "../const.ts";
import { linkChain } from "./link-chain.ts";
import { XKCD } from "./xkcd.ts";

describe(XKCD.name, () => {
  const random = {
    title: "Random Number",
    img: "https://imgs.xkcd.com/comics/random_number.png",
  };
  const comic = (n: number) => ({
    title: `Duty Calls - ${n}`,
    img: "https://imgs.xkcd.com/comics/duty_calls.png",
  });
  const api = {
    random: () => Promise.resolve(random),
    comic: (n: number) => Promise.resolve(comic(n)),
  };

  const xkcd = new XKCD(api);

  const testCases = [
    ["!xkcd random", { content: random.title, files: [random.img] }],
    ["!xkcd 221", { content: comic(221).title, files: [comic(221).img] }],
    ["!xkcd 386", { content: comic(386).title, files: [comic(386).img] }],
    ["!xkcd 2.1", { content: comic(2).title, files: [comic(2).img] }],
  ] as const;

  for (const [input, expected] of testCases) {
    it(`for '${input}' returns '${expected}'`, async () => {
      const message = new MessageMock(input);

      await xkcd.handle(message);

      expect(message.channel.messages).toEqual([expected]);
    });
  }

  it("calls next when it does not match", async () => {
    const remember = new RememberWhenCalled();
    const message = new MessageMock("foo");

    await linkChain(xkcd, remember).handle(message);

    expect(message.channel.messages).toEqual([]);
    expect(remember.called).toEqual(true);
  });

  it("reacts with stupidID when input is not a number", async () => {
    const message = new MessageMock("!xkcd foo");

    await xkcd.handle(message);

    expect(message.channel.messages).toEqual([]);
    expect(message.reacts).toEqual([stupidID]);
  });
});
