import { describe, expect, it } from "bun:test";
import { mp3Command } from "./mp3.ts";
import { commands } from "./register.ts";
import { sayCommand } from "./say.ts";

describe("registered commands", () => {
  it("includes speech alongside the unchanged audio command", () => {
    expect(commands).toEqual([mp3Command.toJSON(), sayCommand.toJSON()]);
    expect(commands.map((command) => command.name)).toEqual(["mp3", "say"]);
  });
});
