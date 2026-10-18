import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mustGetEnv } from "./must-get-env.ts";

describe("mustGetEnv", () => {
  beforeAll(() => {
    process.env.EXISTING = "existing";
    process.env.EMPTY = "";
  });

  afterAll(() => {
    delete process.env.EXISTING;
    delete process.env.EMPTY;
  });

  it("throws when environment variable is set", () => {
    expect(mustGetEnv("EXISTING")).toBe("existing");
  });

  it("throws when environment variable is not set", () => {
    expect(() => {
      mustGetEnv("MISSING");
    }).toThrow(/missing environment variable: MISSING/);
  });

  it("throws when environment variable is empty", () => {
    expect(() => {
      mustGetEnv("EMPTY");
    }).toThrow(/missing environment variable: EMPTY/);
  });
});
