import { Client, Events, GatewayIntentBits } from "discord.js";
import { ReplyStupid } from "./reply-stupid.mjs";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  await new ReplyStupid().perform(message);
});

client.login(process.env.TOKEN);
