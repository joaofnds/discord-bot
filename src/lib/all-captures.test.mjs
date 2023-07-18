import assert from "node:assert";
import { describe, it } from "node:test";
import { allCaptures } from "./all-captures.mjs";

describe("allCaptures", () => {
  describe("when no captures", () => {
    it("returns empty array", () => {
      assert.deepEqual(allCaptures([/foo/], "bar"), []);
    });
  });

  describe("when matches", () => {
    it("returns all matches", () => {
      assert.deepEqual(
        allCaptures([/(123)/, /(321)/, /(abc)/, /(cba)/], "123abc"),
        ["123", "abc"],
      );
    });
  });
});
