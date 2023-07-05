import assert from "node:assert";
import { test } from "node:test";
import {
  allCaptures,
  captures,
  fromASCII,
  normalize,
  stupidCase,
  toASCII,
} from "./util.mjs";

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

test("captures", () => {
  assert.deepEqual(captures(/(\d+)(\w+)/, "123abc"), ["123", "abc"]);
});

test("allCaptures", () => {
  assert.deepEqual(
    allCaptures([/(123)/, /(321)/, /(abc)/, /(cba)/], "123abc"),
    ["123", "abc"]
  );
});

test("toASCII", () => {
  assert.deepEqual(toASCII("abc"), [97, 98, 99]);
});

test("fromASCII", () => {
  assert.deepEqual(fromASCII([97, 98, 99]), "abc");
});

test("to and from ASCII", () => {
  assert.equal(fromASCII(toASCII("abc")), "abc");
});
