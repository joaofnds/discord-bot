import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { normalize } from "./normalize.ts";

describe("normalize", () => {
  const testCases = [
    ["não", "nao"],
    ["café", "cafe"],
    ["maçã", "maca"],
    ["lingüiça", "linguica"],
    ["metrô", "metro"],
  ];

  for (const [input, expected] of testCases) {
    it(`for '${input}' returns '${expected}'`, () => {
      expect(normalize(input)).toBe(expected);
    });
  }
});
