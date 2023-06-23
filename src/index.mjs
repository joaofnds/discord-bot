import { Client, Events, GatewayIntentBits } from "discord.js";
import { preflight } from "./preflight.mjs";
import { ReplyStupid } from "./reply-stupid.mjs";

preflight();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on(Events.ClientReady, () => {
  console.log("Bot is ready");
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  await new ReplyStupid().perform(message);
});

client.login(process.env.TOKEN);