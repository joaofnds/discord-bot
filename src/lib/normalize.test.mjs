import assert from "node:assert";
import { describe, it } from "node:test";
import { normalize } from "./normalize.mjs";

describe("normalize", async () => {
  const testCases = [
    ["não", "nao"],
    ["café", "cafe"],
    ["maçã", "maca"],
    ["lingüiça", "linguica"],
    ["metrô", "metro"],
  ];

  for (const [input, expected] of testCases) {
    it(`for '${input}' returns '${expected}'`, () => {
      assert.equal(normalize(input), expected);
    });
  }
});
