import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { AllMatchReplier } from "./all-match-replier.ts";

describe(AllMatchReplier.name, () => {
  it("replies when all regexes match", () => {
    const replier = new AllMatchReplier("bar", /foo/, /baz/);

    expect(replier.reply("foo baz")).toEqual("bar");
  });

  it("replies regardless of order", () => {
    const replier = new AllMatchReplier("bar", /foo/, /baz/);

    expect(replier.reply("baz foo")).toEqual("bar");
  });

  it("does not reply when only some regexes match", () => {
    const replier = new AllMatchReplier("bar", /foo/, /baz/);

    expect(replier.reply("foo")).toEqual(undefined);
  });

  it("does not reply when no regexes match", () => {
    const replier = new AllMatchReplier("bar", /foo/, /baz/);

    expect(replier.reply("nope")).toEqual(undefined);
  });
});
