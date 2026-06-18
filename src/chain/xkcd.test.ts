import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { MessageMock } from "../../test/message-mock.ts";
import { RememberWhenCalled } from "../../test/remember-when-called.ts";
import { stupidID } from "../const.ts";
import { Slicer } from "../lib/slicer.ts";
import { linkChain } from "./link-chain.ts";
import { XKCD } from "./xkcd.ts";

class FakeSlicer implements Slicer {
  calls: { bytes: Uint8Array; order: number[] }[] = [];
  result = new Uint8Array([9, 8, 7]);

  reslice(bytes: Uint8Array, order: number[]) {
    this.calls.push({ bytes, order });
    return Promise.resolve(this.result);
  }
}

describe(XKCD.name, () => {
  const random = {
    title: "Random Number",
    img: "https://imgs.xkcd.com/comics/random_number.png",
  };
  const comic = (n: number) => ({
    title: `Duty Calls - ${n}`,
    img: "https://imgs.xkcd.com/comics/duty_calls.png",
  });

  class FakeAPI {
    imageCalls: string[] = [];
    imageBytes = new Uint8Array([1, 2, 3]);

    random() {
      return Promise.resolve(random);
    }

    comic(n: number) {
      return Promise.resolve(comic(n));
    }

    image(url: string) {
      this.imageCalls.push(url);
      return Promise.resolve(this.imageBytes);
    }
  }

  const build = () => {
    const slicer = new FakeSlicer();
    const api = new FakeAPI();
    const xkcd = new XKCD(api, slicer);
    return { slicer, api, xkcd };
  };

  const orderedTestCases = [
    ["!xkcd random", { content: random.title, files: [random.img] }],
    ["!xkcd 221", { content: comic(221).title, files: [comic(221).img] }],
    ["!xkcd 386", { content: comic(386).title, files: [comic(386).img] }],
    ["!xkcd 2.1", { content: comic(2).title, files: [comic(2).img] }],
  ] as const;

  for (const [input, expected] of orderedTestCases) {
    it(`for '${input}' sends the comic unaltered`, async () => {
      const { slicer, api, xkcd } = build();
      const message = new MessageMock(input);

      await xkcd.handle(message);

      expect(message.channel.messages).toEqual([expected]);
      expect(api.imageCalls).toEqual([]);
      expect(slicer.calls).toEqual([]);
    });
  }

  it("reslices the comic quadrants for a scrambled command", async () => {
    const { slicer, api, xkcd } = build();
    const message = new MessageMock("!ckxd 386");

    await xkcd.handle(message);

    expect(api.imageCalls).toEqual([comic(386).img]);
    expect(slicer.calls).toEqual([
      { bytes: api.imageBytes, order: [2, 1, 0, 3] },
    ]);
    expect(message.channel.messages).toEqual([
      {
        content: comic(386).title,
        files: [{ attachment: slicer.result, name: "xkcd.png" }],
      },
    ]);
  });

  it("reslices a random comic for a scrambled command", async () => {
    const { slicer, api, xkcd } = build();
    const message = new MessageMock("!dkxc random");

    await xkcd.handle(message);

    expect(api.imageCalls).toEqual([random.img]);
    expect(slicer.calls).toEqual([
      { bytes: api.imageBytes, order: [3, 1, 0, 2] },
    ]);
    expect(message.channel.messages).toEqual([
      {
        content: random.title,
        files: [{ attachment: slicer.result, name: "xkcd.png" }],
      },
    ]);
  });

  it("reacts with stupidID when a scrambled command has no number", async () => {
    const { slicer, api, xkcd } = build();
    const message = new MessageMock("!ckxd foo");

    await xkcd.handle(message);

    expect(message.channel.messages).toEqual([]);
    expect(api.imageCalls).toEqual([]);
    expect(slicer.calls).toEqual([]);
    expect(message.reacts).toEqual([stupidID]);
  });

  it("calls next when it does not match", async () => {
    const { xkcd } = build();
    const remember = new RememberWhenCalled();
    const message = new MessageMock("foo");

    await linkChain(xkcd, remember).handle(message);

    expect(message.channel.messages).toEqual([]);
    expect(remember.called).toEqual(true);
  });

  it("calls next for a four letter word that is not an xkcd anagram", async () => {
    const { xkcd } = build();
    const remember = new RememberWhenCalled();
    const message = new MessageMock("!test 386");

    await linkChain(xkcd, remember).handle(message);

    expect(message.channel.messages).toEqual([]);
    expect(remember.called).toEqual(true);
  });

  it("reacts with stupidID when input is not a number", async () => {
    const { xkcd } = build();
    const message = new MessageMock("!xkcd foo");

    await xkcd.handle(message);

    expect(message.channel.messages).toEqual([]);
    expect(message.reacts).toEqual([stupidID]);
  });
});
