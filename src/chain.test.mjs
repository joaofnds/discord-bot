import assert from "node:assert";
import { test } from "node:test";
import { ReturnWhenEqual } from "../test/return-when-equal.mjs";
import { Chain } from "./chain.mjs";

test(Chain.name, async (t) => {
  await t.test("handle", async (t) => {
    const chain = Chain.fromArray([
      new ReturnWhenEqual({ match: "first", value: "from first" }),
      new ReturnWhenEqual({ match: "second", value: "from second" }),
    ]);

    assert.equal(await chain.handle("first"), "from first");
    assert.equal(await chain.handle("second"), "from second");
    assert.equal(await chain.handle("third"), null);
  });
});
