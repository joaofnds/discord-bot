import assert from "node:assert";
import { describe, it } from "node:test";
import { ReturnWhenEqual } from "../../test/return-when-equal.mjs";
import { Chain } from "./chain.mjs";
import { linkChain } from "./link-chain.mjs";

describe(Chain.name, async () => {
  it("handle", async () => {
    const chain = linkChain(
      new ReturnWhenEqual({ match: "first", value: "from first" }),
      new ReturnWhenEqual({ match: "second", value: "from second" }),
    );

    assert.equal(await chain.handle("first"), "from first");
    assert.equal(await chain.handle("second"), "from second");
    assert.equal(await chain.handle("third"), null);
  });
});
