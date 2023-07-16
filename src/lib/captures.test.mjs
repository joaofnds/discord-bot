import assert from "node:assert";
import { test } from "node:test";
import { captures } from "./captures.mjs";

test("captures", () => {
  assert.deepEqual(captures(/(\d+)(\w+)/, "123abc"), ["123", "abc"]);
});
