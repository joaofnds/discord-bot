import assert from "node:assert";
import { test } from "node:test";
import { allCaptures } from "./all-captures.mjs";

test("allCaptures", () => {
  assert.deepEqual(
    allCaptures([/(123)/, /(321)/, /(abc)/, /(cba)/], "123abc"),
    ["123", "abc"],
  );
});
