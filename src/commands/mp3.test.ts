import { assertEquals } from "@std/assert";
import { initializeSoundCloud, loadSoundCloudTracks } from "./mp3.ts";
import { SoundCloudAPI } from "../lib/soundcloud-api.ts";

Deno.test("initializeSoundCloud does not fetch tracks until sync", async () => {
  const tracks = [
    {
      id: 1,
      title: "belezaaa",
      permalink: "belezaaa",
      permalink_url: "https://soundcloud.com/joaofnds/belezaaa",
    },
  ];
  let fetchCalls = 0;

  initializeSoundCloud({
    fetchTracks: () => {
      fetchCalls += 1;
      return Promise.resolve(tracks);
    },
  } as SoundCloudAPI);

  assertEquals(fetchCalls, 0);
  assertEquals(await loadSoundCloudTracks(), tracks);
  assertEquals(fetchCalls, 1);
});
