import assert from "node:assert";
import { describe, it } from "node:test";
import { stupidCase } from "./stupid-case.mjs";

describe("stupidCase", async () => {
	const testCases = [
		["http", "HtTp"],
		["json", "JsOn"],
		["xml", "XmL"],
		["html", "HtMl"],
	];

	for (const [input, expected] of testCases) {
		it(`for '${input}' returns '${expected}'`, () => {
			assert.equal(stupidCase(input), expected);
		});
	}
});
