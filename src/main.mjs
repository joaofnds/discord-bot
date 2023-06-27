import { Client, Events, GatewayIntentBits } from "discord.js";
import { BotAuthorGuard } from "./bot-author-guard.mjs";
import { preflight } from "./preflight.mjs";
import { ReplyStupid } from "./reply-stupid.mjs";
import { Reply } from "./reply.mjs";
import { linkChain } from "./util.mjs";

preflight();

const handler = linkChain([
  new BotAuthorGuard(),
  new Reply(),
  new ReplyStupid(),
]);

new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})
  .on(Events.ClientReady, () => console.log("bot is ready"))
  .on(Events.MessageCreate, async (message) => await handler.handle(message))
  .login(process.env.TOKEN);
