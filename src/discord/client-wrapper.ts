import { Client } from "discord.js";

export class ClientWrapper {
  constructor(private readonly client: Client) {}

  async voiceDisconnect(channelID: string, userID: string) {
    const channel = await this.client.channels.fetch(channelID);
    if (!channel?.isVoiceBased()) return;

    const member = channel?.members.find((m) => m.id === userID);
    if (!member) return;

    await member.voice.disconnect();
  }
}
