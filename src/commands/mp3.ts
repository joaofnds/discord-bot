import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SoundCloudAPI, SoundCloudTrack } from "../lib/soundcloud-api.ts";
import { Interaction } from "../discord/types.ts";

let cachedTracks: SoundCloudTrack[] = [];
let soundcloudApi: SoundCloudAPI | null = null;
let lastSyncTime: Date | null = null;
const SYNC_THROTTLE_MS = 10 * 60 * 1000; // 10 minutes

export async function loadSoundCloudTracks(api: SoundCloudAPI) {
  soundcloudApi = api;
  cachedTracks = await api.fetchTracks();
  lastSyncTime = new Date();
}

export const mp3Command = new SlashCommandBuilder()
  .setName("mp3")
  .setDescription("SoundCloud audio commands")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("play")
      .setDescription("Play a SoundCloud audio")
      .addStringOption((option) =>
        option
          .setName("audio")
          .setDescription("The audio name (e.g., belezaaa, por-favor-me-ajuda)")
          .setRequired(true)
          .setAutocomplete(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("sync")
      .setDescription("Refresh the SoundCloud tracks list")
  );

export async function handleMp3Autocomplete(
  interaction: Interaction,
) {
  if (!interaction.isAutocomplete()) return;

  try {
    const focused = interaction.options.getFocused().toLowerCase();

    const filtered = cachedTracks
      .filter((track) => track.title.toLowerCase().includes(focused))
      .slice(0, 25); // Discord limits to 25 choices

    await interaction.respond(
      filtered.map((track) => ({ name: track.title, value: track.permalink })),
    );
  } catch (error) {
    console.error("Autocomplete error:", error);
  }
}

export async function handleMp3Command(
  interaction: Interaction,
) {
  if (!interaction.isChatInputCommand()) return;

  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "sync") {
    await handleSync(interaction);
  } else if (subcommand === "play") {
    await handlePlay(interaction);
  }
}

async function handleSync(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    if (!soundcloudApi) {
      await interaction.editReply("❌ SoundCloud API not initialized");
      return;
    }

    // Check throttle
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

    await loadSoundCloudTracks(soundcloudApi);
    await interaction.editReply(`✅ Synced ${cachedTracks.length} tracks!`);
  } catch (error) {
    console.error("Sync error:", error);
    await interaction.editReply("❌ Failed to sync SoundCloud tracks");
  }
}

async function handlePlay(interaction: ChatInputCommandInteraction) {
  try {
    const audio = interaction.options.getString("audio", true);

    const track = cachedTracks.find(
      (t) =>
        t.permalink.toLowerCase() === audio.toLowerCase() ||
        t.title.toLowerCase() === audio.toLowerCase(),
    );

    if (track) {
      await interaction.reply(track.permalink_url);
      return;
    }

    // Fallback: try to construct URL from input
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
