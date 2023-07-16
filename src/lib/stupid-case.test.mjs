import assert from "node:assert";
import { test } from "node:test";
import { stupidCase } from "./stupid-case.mjs";

test("stupidCase", async (t) => {
  const testCases = [
    ["http", "HtTp"],
    ["json", "JsOn"],
    ["xml", "XmL"],
    ["html", "HtMl"],
  ];

  for (const [input, expected] of testCases) {
    await t.test(`for '${input}' returns '${expected}'`, () => {
      assert.equal(stupidCase(input), expected);
    });
  }
});
