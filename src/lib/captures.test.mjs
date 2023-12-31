import assert from "node:assert";
import { describe, it } from "node:test";
import { captures } from "./captures.mjs";

describe("captures", () => {
	describe("when matches", () => {
		it("returns matches for single group", () => {
			assert.deepEqual(captures(/(\d+)/, "123"), ["123"]);
		});

		it("returns matches for multiple groups", () => {
			assert.deepEqual(captures(/(\d+)(\w+)/, "123abc"), ["123", "abc"]);
		});
	});

	describe("when does not match", () => {
		it("returns empty array when does not match", () => {
			assert.deepEqual(captures(/(\d+)(\w+)/, "foo"), []);
		});
	});
});
