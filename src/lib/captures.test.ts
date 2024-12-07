import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { captures } from "./captures.ts";

describe("captures", () => {
  describe("when matches", () => {
    it("returns matches for single group", () => {
      expect(captures(/(\d+)/, "123")).toEqual(["123"]);
    });

    it("returns matches for multiple groups", () => {
      expect(captures(/(\d+)(\w+)/, "123abc")).toEqual(["123", "abc"]);
    });
  });

  describe("when does not match", () => {
    it("returns empty array when does not match", () => {
      expect(captures(/(\d+)(\w+)/, "foo")).toEqual([]);
    });
  });
});
