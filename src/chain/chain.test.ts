import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { MessageMock } from "../../test/message-mock.ts";
import { ReturnWhenEqual } from "../../test/return-when-equal.ts";
import { Chain } from "./chain.ts";
import { linkChain } from "./link-chain.ts";

describe(Chain.name, () => {
  it("handle", async () => {
    const chain = linkChain(
      new ReturnWhenEqual("first", "from first"),
      new ReturnWhenEqual("second", "from second"),
    );

    expect(await chain.handle(new MessageMock("first"))).toBe("from first");
    expect(await chain.handle(new MessageMock("second"))).toBe("from second");
    expect(await chain.handle(new MessageMock("third"))).toBeUndefined();
  });
});
