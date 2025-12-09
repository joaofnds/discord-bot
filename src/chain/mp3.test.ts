import { MP3 } from "./mp3.ts";
import { assert } from "@std/assert";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { RememberWhenCalled } from "../../test/remember-when-called.ts";
import { linkChain } from "./link-chain.ts";
import { MessageMock } from "../../test/message-mock.ts";
import { Interaction } from "../discord/types.ts";

describe(MP3.name, () => {
  const testCases: {
    case: string;
    interaction: Interaction;
    wantMp3AutocompleteCalled?: boolean;
    wantMp3CommandCalled?: boolean;
  }[] = [
    {
      case: "mp3 autocomplete",
      interaction: {
        commandName: "mp3",
        isAutocomplete: () => true,
        isChatInputCommand: () => false,
      } as unknown as Interaction,
      wantMp3AutocompleteCalled: true,
      wantMp3CommandCalled: false,
    },
    {
      case: "mp3 chat input command",
      interaction: {
        commandName: "mp3",
        isAutocomplete: () => false,
        isChatInputCommand: () => true,
      } as unknown as Interaction,
      wantMp3AutocompleteCalled: false,
      wantMp3CommandCalled: true,
    },
    {
      case: "other autocomplete",
      interaction: {
        commandName: "other",
        isAutocomplete: () => true,
        isChatInputCommand: () => false,
      } as unknown as Interaction,
      wantMp3AutocompleteCalled: false,
      wantMp3CommandCalled: false,
    },
    {
      case: "other chat input command",
      interaction: {
        commandName: "other",
        isAutocomplete: () => false,
        isChatInputCommand: () => true,
      } as unknown as Interaction,
      wantMp3AutocompleteCalled: false,
      wantMp3CommandCalled: false,
    },
  ];

  for (const testCase of testCases) {
    it(`for '${testCase.case}' calls correct handlers`, async () => {
      let mp3AutocompleteCalled = false;
      let mp3CommandCalled = false;

      const sut = new MP3(
        async () => {
          await Promise.resolve();
          mp3AutocompleteCalled = true;
        },
        async () => {
          await Promise.resolve();
          mp3CommandCalled = true;
        },
      );

      await sut.handle(testCase.interaction);

      expect(mp3AutocompleteCalled).toBe(!!testCase.wantMp3AutocompleteCalled);
      expect(mp3CommandCalled).toBe(!!testCase.wantMp3CommandCalled);
    });
  }

  it("calls next when it does not match", async () => {
    const sut = new MP3(
      async () => {},
      async () => {},
    );
    const remember = new RememberWhenCalled();
    const message = new MessageMock("foo");

    await linkChain(sut, remember).handle(message);

    expect(message.channel.messages).toEqual([]);
    assert(remember.called);
  });
});
