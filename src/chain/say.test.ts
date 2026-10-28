import { describe, expect, it } from "bun:test";
import { SayCommand, SayInteraction } from "../commands/say.ts";
import { fishVoices } from "../lib/fish-voices.ts";
import { SpeechGenerator } from "../lib/speech-generator.ts";
import { Chain } from "./chain.ts";
import { linkChain } from "./link-chain.ts";
import { MP3 } from "./mp3.ts";
import { Say } from "./say.ts";

class FakeInteraction implements SayInteraction {
  attachmentSizeLimit = 1024;
  choices: { name: string; value: string }[] = [];
  options = {
    getFocused: (): string => "eneas",
    getString: (name: string): string => {
      if (name === "voice") return "eneas";
      return "Hello";
    },
  };

  respond(choices: { name: string; value: string }[]): Promise<void> {
    this.choices = choices;
    return Promise.resolve();
  }

  constructor(
    readonly commandName: string,
    private readonly kind: string,
  ) {}

  isChatInputCommand(): boolean {
    return this.kind === "chat";
  }

  isAutocomplete(): boolean {
    return this.kind === "autocomplete";
  }

  deferReply(): Promise<void> {
    return Promise.resolve();
  }

  reply(): Promise<void> {
    return Promise.resolve();
  }

  editReply(): Promise<void> {
    return Promise.resolve();
  }
}

class FakeSpeechGenerator implements SpeechGenerator {
  requests: { text: string; voiceId: string }[] = [];

  generate(text: string, voiceId: string): Promise<Uint8Array> {
    this.requests.push({ text, voiceId });
    return Promise.resolve(new Uint8Array([73, 68, 51]));
  }
}

class FakeNext extends Chain {
  interactions: unknown[] = [];

  override handle(interaction: unknown): Promise<void> {
    this.interactions.push(interaction);
    return Promise.resolve();
  }
}

function setup() {
  const speech = new FakeSpeechGenerator();
  const say = new SayCommand(speech);
  const next = new FakeNext();
  const autocomplete: unknown[] = [];
  const mp3: unknown[] = [];
  const chain = linkChain(
    new MP3(
      (interaction) => {
        autocomplete.push(interaction);
        return Promise.resolve();
      },
      (interaction) => {
        mp3.push(interaction);
        return Promise.resolve();
      },
    ),
    new Say(say),
    next,
  );
  return { chain, speech, next, autocomplete, mp3 };
}

describe("interaction chain", () => {
  it("forwards /say past MP3 and handles it once", async () => {
    const { chain, speech, next, autocomplete, mp3 } = setup();
    const interaction = new FakeInteraction("say", "chat");

    await chain.handle(interaction);

    expect(speech.requests).toEqual([
      { text: "Hello", voiceId: fishVoices.eneas.id },
    ]);
    expect({ autocomplete, mp3, next: next.interactions }).toEqual({
      autocomplete: [],
      mp3: [],
      next: [],
    });
  });

  it("keeps /mp3 command routing unchanged", async () => {
    const { chain, speech, next, autocomplete, mp3 } = setup();
    const interaction = new FakeInteraction("mp3", "chat");

    await chain.handle(interaction);

    expect(mp3).toEqual([interaction]);
    expect({
      autocomplete,
      say: speech.requests,
      next: next.interactions,
    }).toEqual({ autocomplete: [], say: [], next: [] });
  });

  it("keeps /mp3 autocomplete routing unchanged", async () => {
    const { chain, speech, next, autocomplete, mp3 } = setup();
    const interaction = new FakeInteraction("mp3", "autocomplete");

    await chain.handle(interaction);

    expect(autocomplete).toEqual([interaction]);
    expect({ mp3, say: speech.requests, next: next.interactions }).toEqual({
      mp3: [],
      say: [],
      next: [],
    });
  });

  it("routes /say autocomplete past MP3 without generating speech", async () => {
    const { chain, speech, next, autocomplete, mp3 } = setup();
    const interaction = new FakeInteraction("say", "autocomplete");
    await chain.handle(interaction);
    expect(interaction.choices).toEqual([
      { name: "Eneas (eneas)", value: "eneas" },
    ]);
    expect({
      speech: speech.requests,
      next: next.interactions,
      autocomplete,
      mp3,
    }).toEqual({ speech: [], next: [], autocomplete: [], mp3: [] });
  });

  describe("owned non-chat interactions", () => {
    for (const kind of ["button"]) {
      it(`stops say ${kind} without generating speech`, async () => {
        const { chain, speech, next, autocomplete, mp3 } = setup();

        await chain.handle(new FakeInteraction("say", kind));

        expect({
          speech: speech.requests,
          next: next.interactions,
          autocomplete,
          mp3,
        }).toEqual({
          speech: [],
          next: [],
          autocomplete: [],
          mp3: [],
        });
      });
    }
  });

  describe("unhandled interactions", () => {
    for (const [name, kind] of [
      ["other", "chat"],
      ["other", "autocomplete"],
      ["mp3", "button"],
    ]) {
      it(`forwards ${name} ${kind} to the next link`, async () => {
        const { chain, speech, next, autocomplete, mp3 } = setup();
        const interaction = new FakeInteraction(name, kind);

        await chain.handle(interaction);

        expect(next.interactions).toEqual([interaction]);
        expect({ autocomplete, mp3, say: speech.requests }).toEqual({
          autocomplete: [],
          mp3: [],
          say: [],
        });
      });
    }
  });
});
