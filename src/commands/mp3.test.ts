import { AttachmentBuilder, ChatInputCommandInteraction } from "discord.js";
import { handlePlay, loadSoundCloudTracks } from "./mp3.ts";
import { SoundCloudAPI, SoundCloudTrack } from "../lib/soundcloud-api.ts";
import type { DownloadResult } from "../lib/soundcloud-downloader.ts";

declare const Deno: {
  test(name: string, fn: () => void | Promise<void>): void;
};

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEquals<T>(actual: T, expected: T, message = "Values are not equal"): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`);
  }
}

class FakeSoundCloudApi extends SoundCloudAPI {
  constructor(private readonly tracks: SoundCloudTrack[]) {
    super("user", "client");
  }

  override fetchTracks(): Promise<SoundCloudTrack[]> {
    return Promise.resolve(this.tracks);
  }
}

type ReplyPayload = string | { content: string; ephemeral: true };
type EditPayload = string | { files: AttachmentBuilder[] };

interface MockInteractionState {
  replied: boolean;
  deferred: boolean;
}

function createInteraction(audio: string, throwOnEditReply = false) {
  const calls = {
    deferReply: 0,
    reply: [] as ReplyPayload[],
    editReply: [] as EditPayload[],
  };

  const state: MockInteractionState = {
    replied: false,
    deferred: false,
  };

  const interaction = {
    options: {
      getString(name: string, required: boolean): string {
        if (name !== "audio" || !required) {
          throw new Error("Unexpected getString call");
        }
        return audio;
      },
    },
    get replied() {
      return state.replied;
    },
    set replied(value: boolean) {
      state.replied = value;
    },
    get deferred() {
      return state.deferred;
    },
    set deferred(value: boolean) {
      state.deferred = value;
    },
    deferReply(): Promise<void> {
      calls.deferReply += 1;
      state.deferred = true;
      return Promise.resolve();
    },
    editReply(payload: EditPayload): Promise<void> {
      calls.editReply.push(payload);
      state.replied = true;
      if (throwOnEditReply) {
        return Promise.reject(new Error("editReply failed"));
      }
      return Promise.resolve();
    },
    reply(payload: ReplyPayload): Promise<void> {
      calls.reply.push(payload);
      state.replied = true;
      return Promise.resolve();
    },
  };

  return {
    calls,
    interaction: interaction as unknown as ChatInputCommandInteraction,
  };
}

const knownTrack: SoundCloudTrack = {
  id: 1,
  title: "Belezaaa",
  permalink: "belezaaa",
  permalink_url: "https://soundcloud.com/joaofnds/belezaaa",
};

async function setCachedTracks(tracks: SoundCloudTrack[]): Promise<void> {
  await loadSoundCloudTracks(new FakeSoundCloudApi(tracks));
}

Deno.test("track found: download succeeds within size limit and sends attachment", async () => {
  await setCachedTracks([knownTrack]);
  const { interaction, calls } = createInteraction("belezaaa");
  const cleanupCalls: string[] = [];

  const downloadFn = (): Promise<DownloadResult> => Promise.resolve({
    ok: true as const,
    filePath: "/tmp/track.mp3",
    fileName: "track.mp3",
    fileSize: 1024,
  });
  const cleanupFn = (filePath: string): Promise<void> => {
    cleanupCalls.push(filePath);
    return Promise.resolve();
  };

  await handlePlay(interaction, downloadFn, cleanupFn);

  assertEquals(calls.deferReply, 1);
  assertEquals(calls.reply.length, 0);
  assertEquals(calls.editReply.length, 1);
  const payload = calls.editReply[0];
  if (typeof payload === "string") {
    throw new Error("Expected attachment payload");
  }
  assertEquals(payload.files.length, 1);
  assert(payload.files[0] instanceof AttachmentBuilder, "Expected AttachmentBuilder file");
  assertEquals(cleanupCalls, ["/tmp/track.mp3"]);
});

Deno.test("track found: download failure falls back to track URL", async () => {
  await setCachedTracks([knownTrack]);
  const { interaction, calls } = createInteraction("belezaaa");
  let cleanupCalled = false;

  const downloadFn = (): Promise<DownloadResult> => Promise.resolve({
    ok: false as const,
    error: "failed",
  });
  const cleanupFn = (): Promise<void> => {
    cleanupCalled = true;
    return Promise.resolve();
  };

  await handlePlay(interaction, downloadFn, cleanupFn);

  assertEquals(calls.deferReply, 1);
  assertEquals(calls.editReply, [knownTrack.permalink_url]);
  assertEquals(cleanupCalled, false);
});

Deno.test("track found: oversized download falls back to URL and cleans up", async () => {
  await setCachedTracks([knownTrack]);
  const { interaction, calls } = createInteraction("belezaaa");
  const cleanupCalls: string[] = [];

  const downloadFn = (): Promise<DownloadResult> => Promise.resolve({
    ok: true as const,
    filePath: "/tmp/too-large.mp3",
    fileName: "too-large.mp3",
    fileSize: 26 * 1024 * 1024,
  });
  const cleanupFn = (filePath: string): Promise<void> => {
    cleanupCalls.push(filePath);
    return Promise.resolve();
  };

  await handlePlay(interaction, downloadFn, cleanupFn);

  assertEquals(calls.deferReply, 1);
  assertEquals(calls.editReply, [knownTrack.permalink_url]);
  assertEquals(cleanupCalls, ["/tmp/too-large.mp3"]);
});

Deno.test("unknown track: replies with sanitized fallback URL", async () => {
  await setCachedTracks([knownTrack]);
  const { interaction, calls } = createInteraction("New Song!!.mp3");
  let downloadCalled = false;

  const downloadFn = (): Promise<DownloadResult> => {
    downloadCalled = true;
    return Promise.resolve({ ok: false as const, error: "should not be called" });
  };

  await handlePlay(interaction, downloadFn);

  assertEquals(downloadCalled, false);
  assertEquals(calls.deferReply, 0);
  assertEquals(calls.reply, ["https://soundcloud.com/joaofnds/newsong"]);
  assertEquals(calls.editReply.length, 0);
});

Deno.test("unknown track: invalid audio name returns ephemeral error", async () => {
  await setCachedTracks([knownTrack]);
  const { interaction, calls } = createInteraction("!!!.mp3");

  await handlePlay(interaction);

  assertEquals(calls.deferReply, 0);
  assertEquals(calls.editReply.length, 0);
  assertEquals(calls.reply, [{ content: "Invalid audio name", ephemeral: true }]);
});

Deno.test("track found: cleanup runs even if sending attachment fails", async () => {
  await setCachedTracks([knownTrack]);
  const { interaction, calls } = createInteraction("belezaaa", true);
  const cleanupCalls: string[] = [];

  const downloadFn = (): Promise<DownloadResult> => Promise.resolve({
    ok: true as const,
    filePath: "/tmp/cleanup-finally.mp3",
    fileName: "cleanup-finally.mp3",
    fileSize: 1024,
  });
  const cleanupFn = (filePath: string): Promise<void> => {
    cleanupCalls.push(filePath);
    return Promise.resolve();
  };

  await handlePlay(interaction, downloadFn, cleanupFn);

  assertEquals(calls.deferReply, 1);
  assertEquals(cleanupCalls, ["/tmp/cleanup-finally.mp3"]);
  assert(calls.editReply.length >= 1, "Expected at least one editReply call");
  assertEquals(calls.reply.length, 0);
});
