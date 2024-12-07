import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { allCaptures } from "./all-captures.ts";

describe("allCaptures", () => {
  describe("when no captures", () => {
    it("returns empty array", () => {
      expect(allCaptures([/foo/], "bar")).toEqual([]);
    });
  });

  describe("when matches", () => {
    it("returns all matches", () => {
      expect(allCaptures([/(123)/, /(321)/, /(abc)/, /(cba)/], "123abc"))
        .toEqual([
          "123",
          "abc",
        ]);
    });
  });
});
