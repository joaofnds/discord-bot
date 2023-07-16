import { test } from "node:test";
import { mustGetEnv } from "./must-get-env.mjs";
import assert from "node:assert";

test("mustGetEnv", async (t) => {
  t.before(() => {
    process.env.EXISTING = "existing";
    process.env.EMPTY = "";
  });

  t.after(() => {
    delete process.env.EXISTING;
    delete process.env.EMPTY;
  });

  await t.test("throws when environment variable is set", (t) => {
    assert.equal(mustGetEnv("EXISTING"), "existing");
  });

  await t.test("throws when environment variable is not set", (t) => {
    assert.throws(() => {
      mustGetEnv("MISSING");
    }, /MISSING environment variable is required/);
  });

  await t.test("throws when environment variable is empty", (t) => {
    assert.throws(() => {
      mustGetEnv("EMPTY");
    }, /EMPTY environment variable is required/);
  });
});
