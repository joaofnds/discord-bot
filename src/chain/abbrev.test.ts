import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { MessageMock } from "../../test/message-mock.ts";
import { RememberWhenCalled } from "../../test/remember-when-called.ts";
import { Abbrev } from "./abbrev.ts";
import { linkChain } from "./link-chain.ts";

describe(Abbrev.name, () => {
  const testCases = [
    ["!abbrev random", "rndm"],
    ["!abbrev user", "usr"],
    ["!abbrev order", "ordr"],
    ["!abbrev random user order", "rndm usr ordr"],
    ["!abbrev doctor", "dctr"],
    ["!abbrev appointment", "apntmnt"],
    ["!abbrev doctor appointment", "dctr apntmnt"],
  ];

  for (const [input, expected] of testCases) {
    it(`for '${input}' returns '${expected}'`, async () => {
      const message = new MessageMock(input);

      await new Abbrev().handle(message);

      expect(message.replies).toEqual([expected]);
    });
  }

  it("calls next when it does not match", async () => {
    const abbrev = new Abbrev();
    const remember = new RememberWhenCalled();
    const message = new MessageMock("foo");

    await linkChain(abbrev, remember).handle(message);

    expect(message.replies).toEqual([]);
    expect(remember.called).toBe(true);
  });

  it("ends chain if no message to abbreviate", async () => {
    const abbrev = new Abbrev();
    const remember = new RememberWhenCalled();
    const message = new MessageMock("!abbrev");

    await linkChain(abbrev, remember).handle(message);

    expect(message.replies).toEqual([]);
    expect(remember.called).toBe(false);
  });
});
