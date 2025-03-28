import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { toMillis } from "./to-millis.ts";

describe("toMillis", () => {
  const testCases = [
    [1, "ms", 1],
    [1, "millisecond", 1],
    [2, "milliseconds", 2],
    [123, "milliseconds", 123],

    [1, "s", 1000],
    [1, "sec", 1000],
    [1, "second", 1000],
    [2, "seconds", 2000],
    [123, "seconds", 123000],

    [1, "m", 60000],
    [1, "min", 60000],
    [1, "minute", 60000],
    [2, "minutes", 120000],
    [123, "minutes", 7380000],
  ] as const;

  for (const [amount, unit, expected] of testCases) {
    it(`${amount} ${unit} = ${expected}ms`, () => {
      expect(toMillis(amount, unit)).toBe(expected);
    });
  }
});
