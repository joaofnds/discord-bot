import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { parseDuration } from "./parse-duration.ts";

describe("parseDuration", () => {
  const testCases = [
    ["1ms", 1],
    ["1 millisecond", 1],
    ["2 milliseconds", 2],

    ["1s", 1_000],
    ["1 second", 1_000],
    ["2 seconds", 2_000],

    ["1m", 60_000],
    ["1 minute", 60_000],
    ["2 minutes", 120_000],

    ["1.5 minute", undefined],
    ["1h", undefined],
    ["123 foo", undefined],
    ["foo bar minute", undefined],
    ["bar 1 minute", undefined],
    ["bar minute 2", undefined],
  ] as const;

  for (const [input, expected] of testCases) {
    it(`parseDuration('${input}') == ${expected}`, () => {
      expect(parseDuration(input)).toBe(expected);
    });
  }
});
