import { expect } from "@std/expect";
import { after, before, describe, it } from "@std/testing/bdd";
import { mustGetEnv } from "./must-get-env.ts";

describe("mustGetEnv", () => {
  before(() => {
    Deno.env.set("EXISTING", "existing");
    Deno.env.set("EMPTY", "");
  });

  after(() => {
    Deno.env.delete("EXISTING");
    Deno.env.delete("EMPTY");
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
