import { Buffer } from "node:buffer";
import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { Interaction } from "../discord/types.ts";
import { MyinstantsClient, MyinstantsResult } from "../lib/myinstants-api.ts";
import { SoundCloudAPI, SoundCloudTrack } from "../lib/soundcloud-api.ts";

let cachedTracks: SoundCloudTrack[] = [];
let soundcloudApi: SoundCloudAPI | null = null;
let myinstantsApi: MyinstantsClient | null = null;
let lastSyncTime: Date | null = null;
let recentInstantResults = new Map<string, MyinstantsResult>();

const DISCORD_MAX_CHOICES = 25;
const DISCORD_UPLOAD_LIMIT_BYTES = 8 * 1024 * 1024;
const MAX_RECENT_INSTANT_RESULTS = 100;
const SYNC_THROTTLE_MS = 10 * 60 * 1000;

export function initializeSoundCloud(api: SoundCloudAPI) {
  soundcloudApi = api;
}

export function initializeMyinstants(api: MyinstantsClient) {
  myinstantsApi = api;
}

export function resetMp3State() {
  cachedTracks = [];
  soundcloudApi = null;
  myinstantsApi = null;
  lastSyncTime = null;
  recentInstantResults = new Map<string, MyinstantsResult>();
}

export async function loadSoundCloudTracks() {
  if (!soundcloudApi) {
    return [];
  }

  cachedTracks = await soundcloudApi.fetchTracks();
  lastSyncTime = new Date();
  return cachedTracks;
}

export const mp3Command = new SlashCommandBuilder()
  .setName("mp3")
  .setDescription("Audio provider commands")
  .addSubcommandGroup((group) =>
    group
      .setName("soundcloud")
      .setDescription("SoundCloud audio commands")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("play")
          .setDescription("Play a SoundCloud audio")
          .addStringOption((option) =>
            option
              .setName("audio")
              .setDescription(
                "The audio name (e.g., belezaaa, por-favor-me-ajuda)",
              )
              .setRequired(true)
              .setAutocomplete(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("sync")
          .setDescription("Refresh the SoundCloud tracks list")
      )
  )
  .addSubcommandGroup((group) =>
    group
      .setName("instant")
      .setDescription("Myinstants audio commands")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("play")
          .setDescription("Search Myinstants and send the audio file")
          .addStringOption((option) =>
            option
              .setName("audio")
              .setDescription("The audio name to search on Myinstants")
              .setRequired(true)
              .setAutocomplete(true)
          )
      )
  );

export async function handleMp3Autocomplete(interaction: Interaction) {
  if (!interaction.isAutocomplete()) return;

  try {
    const group = interaction.options.getSubcommandGroup(false);
    const subcommand = interaction.options.getSubcommand(false);

    if (subcommand !== "play") {
      await interaction.respond([]);
      return;
    }

    const focused = interaction.options.getFocused().trim();

    if (group === "soundcloud") {
      const filtered = cachedTracks
        .filter((track) =>
          track.title.toLowerCase().includes(focused.toLowerCase())
        )
        .slice(0, DISCORD_MAX_CHOICES);

      await interaction.respond(
        filtered.map((track) => ({
          name: track.title,
          value: track.permalink,
        })),
      );
      return;
    }

    if (group === "instant") {
      if (!myinstantsApi || focused.length < 2) {
        await interaction.respond([]);
        return;
      }

      const results = (await myinstantsApi.search(focused)).slice(
        0,
        DISCORD_MAX_CHOICES,
      );

      for (const result of results) {
        rememberInstantResult(result);
      }

      await interaction.respond(
        results.map((result) => ({
          name: truncateChoiceName(result.title),
          value: result.path,
        })),
      );
      return;
    }

    await interaction.respond([]);
  } catch (error) {
    console.error("Autocomplete error:", error);

    try {
      await interaction.respond([]);
    } catch {
      // Discord only allows a single autocomplete response.
    }
  }
}

export async function handleMp3Command(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;

  const group = interaction.options.getSubcommandGroup();
  const subcommand = interaction.options.getSubcommand();

  if (group === "soundcloud" && subcommand === "sync") {
    await handleSoundCloudSync(interaction);
    return;
  }

  if (group === "soundcloud" && subcommand === "play") {
    await handleSoundCloudPlay(interaction);
    return;
  }

  if (group === "instant" && subcommand === "play") {
    await handleInstantPlay(interaction);
  }
}

async function handleSoundCloudSync(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    if (!soundcloudApi) {
      await interaction.editReply("❌ SoundCloud API not initialized");
      return;
    }

    if (lastSyncTime) {
      const elapsed = Date.now() - lastSyncTime.getTime();
      if (elapsed < SYNC_THROTTLE_MS) {
        const remainingMs = SYNC_THROTTLE_MS - elapsed;
        const remainingMins = Math.ceil(remainingMs / 60000);
        await interaction.editReply(
          `⏳ Sync was already run at <t:${
            Math.floor(lastSyncTime.getTime() / 1000)
          }:T>. Try again in ${remainingMins} minute${
            remainingMins === 1 ? "" : "s"
          }.`,
        );
        return;
      }
    }

    const tracks = await loadSoundCloudTracks();
    await interaction.editReply(`✅ Synced ${tracks.length} tracks!`);
  } catch (error) {
    console.error("Sync error:", error);
    await interaction.editReply("❌ Failed to sync SoundCloud tracks");
  }
}

async function handleSoundCloudPlay(interaction: ChatInputCommandInteraction) {
  try {
    const audio = interaction.options.getString("audio", true);

    const track = cachedTracks.find(
      (candidate) =>
        candidate.permalink.toLowerCase() === audio.toLowerCase() ||
        candidate.title.toLowerCase() === audio.toLowerCase(),
    );

    if (track) {
      await interaction.reply(track.permalink_url);
      return;
    }

    const sanitized = audio
      .replace(/\.mp3$/i, "")
      .replace(/[^\w-]/g, "")
      .toLowerCase();

    if (!sanitized) {
      await interaction.reply({
        content: "Invalid audio name",
        ephemeral: true,
      });
      return;
    }

    await interaction.reply(`https://soundcloud.com/joaofnds/${sanitized}`);
  } catch (error) {
    console.error("Play error:", error);
    if (!interaction.replied) {
      await interaction.reply({
        content: "An error occurred",
        ephemeral: true,
      });
    }
  }
}

async function handleInstantPlay(interaction: ChatInputCommandInteraction) {
  let result: MyinstantsResult | null = null;

  try {
    await interaction.deferReply();

    if (!myinstantsApi) {
      await interaction.editReply("❌ Myinstants API not initialized");
      return;
    }

    const audio = interaction.options.getString("audio", true).trim();
    result = await resolveInstant(audio);

    if (!result) {
      await interaction.editReply(
        `No Myinstants result found for "${audio}"\n${
          buildMyinstantsSearchUrl(audio)
        }`,
      );
      return;
    }

    const audioResponse = await fetch(result.audioUrl);

    if (!audioResponse.ok) {
      throw new Error(
        `Myinstants audio download failed: ${audioResponse.status} ${audioResponse.statusText}`,
      );
    }

    const contentLength = Number(audioResponse.headers.get("content-length"));
    if (
      Number.isFinite(contentLength) &&
      contentLength > DISCORD_UPLOAD_LIMIT_BYTES
    ) {
      await interaction.editReply(`${result.title}\n${result.instantUrl}`);
      return;
    }

    const bytes = new Uint8Array(await audioResponse.arrayBuffer());
    if (bytes.byteLength > DISCORD_UPLOAD_LIMIT_BYTES) {
      await interaction.editReply(`${result.title}\n${result.instantUrl}`);
      return;
    }

    await interaction.editReply({
      content: result.title,
      files: [
        new AttachmentBuilder(Buffer.from(bytes), {
          name: toAudioFileName(result.title),
        }),
      ],
    });
  } catch (error) {
    console.error("Myinstants play error:", error);

    if (interaction.deferred || interaction.replied) {
      if (result) {
        await interaction.editReply(`${result.title}\n${result.instantUrl}`);
        return;
      }

      await interaction.editReply("❌ Failed to fetch Myinstants audio");
      return;
    }

    await interaction.reply({
      content: "❌ Failed to fetch Myinstants audio",
      ephemeral: true,
    });
  }
}

async function resolveInstant(audio: string): Promise<MyinstantsResult | null> {
  if (!myinstantsApi) {
    return null;
  }

  const cached = recentInstantResults.get(audio);
  if (cached) {
    return cached;
  }

  if (isInstantPathOrUrl(audio)) {
    const instant = await myinstantsApi.getInstant(audio);
    if (instant) {
      rememberInstantResult(instant);
    }
    return instant;
  }

  const results = await myinstantsApi.search(audio);
  const instant = results[0] ?? null;

  if (instant) {
    rememberInstantResult(instant);
  }

  return instant;
}

function rememberInstantResult(result: MyinstantsResult) {
  recentInstantResults.set(result.path, result);
  recentInstantResults.set(result.instantUrl, result);

  while (recentInstantResults.size > MAX_RECENT_INSTANT_RESULTS) {
    const oldestKey = recentInstantResults.keys().next().value;
    if (!oldestKey) {
      return;
    }
    recentInstantResults.delete(oldestKey);
  }
}

function isInstantPathOrUrl(value: string) {
  return value.startsWith("/") || value.includes("myinstants.com/");
}

function buildMyinstantsSearchUrl(query: string) {
  return `https://www.myinstants.com/en/search/?name=${
    encodeURIComponent(query)
  }`;
}

function truncateChoiceName(value: string) {
  return value.length <= 100 ? value : `${value.slice(0, 97)}...`;
}

function toAudioFileName(title: string) {
  const fileName = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${fileName || "instant"}.mp3`;
}
