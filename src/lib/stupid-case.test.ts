import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { stupidCase } from "./stupid-case.ts";

describe("stupidCase", () => {
  const testCases = [
    ["http", "HtTp"],
    ["json", "JsOn"],
    ["xml", "XmL"],
    ["html", "HtMl"],
  ];

  for (const [input, expected] of testCases) {
    it(`for '${input}' returns '${expected}'`, () => {
      expect(stupidCase(input)).toBe(expected);
    });
  }
});
