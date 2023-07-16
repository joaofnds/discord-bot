import assert from "node:assert";
import { test } from "node:test";
import { normalize } from "./normalize.mjs";

test("normalize", async (t) => {
  const testCases = [
    ["não", "nao"],
    ["café", "cafe"],
    ["maçã", "maca"],
    ["lingüiça", "linguica"],
    ["metrô", "metro"],
  ];

  for (const [input, expected] of testCases) {
    await t.test(`for '${input}' returns '${expected}'`, () => {
      assert.equal(normalize(input), expected);
    });
  }
});
