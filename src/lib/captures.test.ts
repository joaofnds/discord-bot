import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { captures } from "./captures.ts";

describe("captures", () => {
  describe("when matches", () => {
    it("returns matches for single group", () => {
      expect(captures(/(\d+)/, "123")).toEqual(["123"]);
    });

    it("returns matches for multiple groups", () => {
      expect(captures(/(\d+)(\w+)/, "123abc 456dec")).toEqual(["123", "abc"]);
    });

    it("returns all matches in the string", () => {
      expect(captures(/(\d+)(\w+)/g, "123abc 456dec")).toEqual([
        "123",
        "abc",
        "456",
        "dec",
      ]);
    });
  });

  describe("when does not match", () => {
    it("returns empty array when does not match", () => {
      expect(captures(/(\d+)(\w+)/, "foo")).toEqual([]);
    });

    describe("with global flag", () => {
      it("returns empty array when does not match", () => {
        expect(captures(/(\d+)/g, "foo")).toEqual([]);
      });
    });
  });
});
