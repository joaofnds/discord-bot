import { expect, it } from "bun:test";
import {
  handleMp3Autocomplete,
  handleMp3Command,
  initializeMyinstants,
  initializeSoundCloud,
  loadSoundCloudTracks,
  resetMp3State,
} from "./mp3.ts";
import { Interaction } from "../discord/types.ts";
import { MyinstantsClient } from "../lib/myinstants-api.ts";
import { SoundCloudAPI } from "../lib/soundcloud-api.ts";

it("initializeSoundCloud does not fetch tracks until sync", async () => {
  const tracks = [
    {
      id: 1,
      title: "belezaaa",
      permalink: "belezaaa",
      permalink_url: "https://soundcloud.com/joaofnds/belezaaa",
    },
  ];
  let fetchCalls = 0;

  resetMp3State();
  initializeSoundCloud({
    fetchTracks: () => {
      fetchCalls += 1;
      return Promise.resolve(tracks);
    },
  } as SoundCloudAPI);

  expect(fetchCalls).toStrictEqual(0);
  expect(await loadSoundCloudTracks()).toStrictEqual(tracks);
  expect(fetchCalls).toStrictEqual(1);
  resetMp3State();
});

it("soundcloud autocomplete uses the grouped play command", async () => {
  resetMp3State();
  initializeSoundCloud({
    fetchTracks: () => {
      return Promise.resolve([
        {
          id: 1,
          title: "belezaaa",
          permalink: "belezaaa",
          permalink_url: "https://soundcloud.com/joaofnds/belezaaa",
        },
        {
          id: 2,
          title: "outra coisa",
          permalink: "outra-coisa",
          permalink_url: "https://soundcloud.com/joaofnds/outra-coisa",
        },
      ]);
    },
  } as SoundCloudAPI);
  await loadSoundCloudTracks();

  const responses: { name: string; value: string }[][] = [];
  const interaction = {
    commandName: "mp3",
    options: {
      getFocused: () => "bel",
      getSubcommand: () => "play",
      getSubcommandGroup: () => "soundcloud",
    },
    isAutocomplete: () => true,
    isChatInputCommand: () => false,
    respond: (choices: { name: string; value: string }[]) => {
      responses.push(choices);
      return Promise.resolve();
    },
  } as unknown as Interaction;

  await handleMp3Autocomplete(interaction);

  expect(responses).toStrictEqual([[{ name: "belezaaa", value: "belezaaa" }]]);
  resetMp3State();
});

it("instant autocomplete searches Myinstants live", async () => {
  resetMp3State();
  initializeMyinstants({
    search: () => {
      return Promise.resolve([
        {
          title: "BRUH",
          path: "/en/instant/bruh/",
          instantUrl: "https://www.myinstants.com/en/instant/bruh/",
          audioUrl: "https://www.myinstants.com/media/sounds/movie_1.mp3",
        },
      ]);
    },
    getInstant: () => Promise.resolve(null),
  } as MyinstantsClient);

  const responses: { name: string; value: string }[][] = [];
  const interaction = {
    commandName: "mp3",
    options: {
      getFocused: () => "br",
      getSubcommand: () => "play",
      getSubcommandGroup: () => "instant",
    },
    isAutocomplete: () => true,
    isChatInputCommand: () => false,
    respond: (choices: { name: string; value: string }[]) => {
      responses.push(choices);
      return Promise.resolve();
    },
  } as unknown as Interaction;

  await handleMp3Autocomplete(interaction);

  expect(responses).toStrictEqual([
    [
      {
        name: "BRUH",
        value: "/en/instant/bruh/",
      },
    ],
  ]);
  resetMp3State();
});

it("grouped soundcloud play still replies with the track url", async () => {
  resetMp3State();
  initializeSoundCloud({
    fetchTracks: () => {
      return Promise.resolve([
        {
          id: 1,
          title: "belezaaa",
          permalink: "belezaaa",
          permalink_url: "https://soundcloud.com/joaofnds/belezaaa",
        },
      ]);
    },
  } as SoundCloudAPI);
  await loadSoundCloudTracks();

  const replies: unknown[] = [];
  const interaction = {
    commandName: "mp3",
    options: {
      getString: () => "belezaaa",
      getSubcommand: () => "play",
      getSubcommandGroup: () => "soundcloud",
    },
    replied: false,
    deferred: false,
    isAutocomplete: () => false,
    isChatInputCommand: () => true,
    reply: (payload: unknown) => {
      replies.push(payload);
      return Promise.resolve(payload);
    },
  } as unknown as Interaction;

  await handleMp3Command(interaction);

  expect(replies).toStrictEqual(["https://soundcloud.com/joaofnds/belezaaa"]);
  resetMp3State();
});

it("instant play uploads the audio file with the title", async () => {
  const originalFetch = globalThis.fetch;

  try {
    resetMp3State();
    initializeMyinstants({
      search: () => {
        return Promise.resolve([
          {
            title: "BRUH",
            path: "/en/instant/bruh/",
            instantUrl: "https://www.myinstants.com/en/instant/bruh/",
            audioUrl: "https://www.myinstants.com/media/sounds/movie_1.mp3",
          },
        ]);
      },
      getInstant: () => Promise.resolve(null),
    } as MyinstantsClient);

    globalThis.fetch = (() => {
      return Promise.resolve(
        new Response(new Uint8Array([1, 2, 3, 4]), {
          status: 200,
          headers: { "content-length": "4", "content-type": "audio/mpeg" },
        }),
      );
    }) as unknown as typeof fetch;

    const autocomplete = createAutocompleteInteraction("instant", "play", "br");
    await handleMp3Autocomplete(autocomplete.interaction);

    const command = createChatInteraction(
      "instant",
      "play",
      "/en/instant/bruh/",
    );
    await handleMp3Command(command.interaction);

    expect(command.calls.length).toStrictEqual(2);
    expect(command.calls[0]).toStrictEqual({
      type: "defer",
      payload: undefined,
    });
    expect(command.calls[1].type).toStrictEqual("edit");
    const payload = command.calls[1].payload as {
      content: string;
      files: unknown[];
    };
    expect(payload.content).toStrictEqual("BRUH");
    expect(payload.files.length).toStrictEqual(1);
  } finally {
    globalThis.fetch = originalFetch;
    resetMp3State();
  }
});

it("instant play falls back to the instant url when the file is too large", async () => {
  const originalFetch = globalThis.fetch;

  try {
    resetMp3State();
    initializeMyinstants({
      search: () => {
        return Promise.resolve([
          {
            title: "BRUH",
            path: "/en/instant/bruh/",
            instantUrl: "https://www.myinstants.com/en/instant/bruh/",
            audioUrl: "https://www.myinstants.com/media/sounds/movie_1.mp3",
          },
        ]);
      },
      getInstant: () => Promise.resolve(null),
    } as MyinstantsClient);

    globalThis.fetch = (() => {
      return Promise.resolve(
        new Response(null, {
          status: 200,
          headers: { "content-length": `${9 * 1024 * 1024}` },
        }),
      );
    }) as unknown as typeof fetch;

    const command = createChatInteraction("instant", "play", "bruh");
    await handleMp3Command(command.interaction);

    expect(command.calls.length).toStrictEqual(2);
    expect(command.calls[1]).toStrictEqual({
      type: "edit",
      payload: "BRUH\nhttps://www.myinstants.com/en/instant/bruh/",
    });
  } finally {
    globalThis.fetch = originalFetch;
    resetMp3State();
  }
});

function createAutocompleteInteraction(
  group: string,
  subcommand: string,
  focused: string,
) {
  const responses: { name: string; value: string }[][] = [];

  return {
    responses,
    interaction: {
      commandName: "mp3",
      options: {
        getFocused: () => focused,
        getSubcommand: () => subcommand,
        getSubcommandGroup: () => group,
      },
      isAutocomplete: () => true,
      isChatInputCommand: () => false,
      respond: (choices: { name: string; value: string }[]) => {
        responses.push(choices);
        return Promise.resolve();
      },
    } as unknown as Interaction,
  };
}

function createChatInteraction(
  group: string,
  subcommand: string,
  audio: string,
) {
  const calls: ChatInteractionCall[] = [];

  const interaction = {
    commandName: "mp3",
    deferred: false,
    replied: false,
    options: {
      getString: () => audio,
      getSubcommand: () => subcommand,
      getSubcommandGroup: () => group,
    },
    isAutocomplete: () => false,
    isChatInputCommand: () => true,
    deferReply: (payload?: unknown) => {
      interaction.deferred = true;
      calls.push({ type: "defer", payload });
      return Promise.resolve();
    },
    editReply: (payload: unknown) => {
      interaction.replied = true;
      calls.push({ type: "edit", payload });
      return Promise.resolve(payload);
    },
    reply: (payload: unknown) => {
      interaction.replied = true;
      calls.push({ type: "reply", payload });
      return Promise.resolve(payload);
    },
  };

  return {
    calls,
    interaction: interaction as unknown as Interaction,
  };
}

interface ChatInteractionCall {
  type: string;
  payload: unknown;
}
