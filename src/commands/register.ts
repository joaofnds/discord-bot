import { REST, Routes } from "discord.js";
import { mp3Command } from "./mp3.ts";

const commands = [mp3Command.toJSON()];

export async function registerCommands(
  token: string,
  applicationId: string,
  guildId?: string,
) {
  const rest = new REST({ version: "10" }).setToken(token);

  console.log("Registering slash commands...");

  try {
    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(applicationId, guildId), {
        body: commands,
      });
      await rest.put(Routes.applicationCommands(applicationId), { body: [] });
      console.log("Slash commands registered for guild");
      return;
    }

    await rest.put(Routes.applicationCommands(applicationId), {
      body: commands,
    });
    console.log("Slash commands registered globally");
  } catch (error) {
    console.error("Failed to register slash commands:", error);
  }
}
