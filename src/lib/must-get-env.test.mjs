import assert from "node:assert";
import { after, before, describe, it } from "node:test";
import { mustGetEnv } from "./must-get-env.mjs";

describe("mustGetEnv", async () => {
	before(() => {
		process.env.EXISTING = "existing";
		process.env.EMPTY = "";
	});

	after(() => {
		process.env.EXISTING = undefined;
		process.env.EMPTY = undefined;
	});

	it("throws when environment variable is set", () => {
		assert.equal(mustGetEnv("EXISTING"), "existing");
	});

	it("throws when environment variable is not set", () => {
		assert.throws(() => {
			mustGetEnv("MISSING");
		}, /MISSING environment variable is required/);
	});

	it("throws when environment variable is empty", () => {
		assert.throws(() => {
			mustGetEnv("EMPTY");
		}, /EMPTY environment variable is required/);
	});
});
