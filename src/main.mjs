import { Client, Events, GatewayIntentBits } from "discord.js";
import { Abbrev } from "./chain/abbrev.mjs";
import { BotAuthorGuard } from "./chain/bot-author-guard.mjs";
import { linkChain } from "./chain/link-chain.mjs";
import { Reply } from "./chain/reply.mjs";
import { Timeout } from "./chain/timeout.mjs";
import { Config } from "./config.mjs";
import * as time from "./lib/time.mjs";

const config = Config.fromEnv();

const handler = linkChain(
  new BotAuthorGuard(),
  new Abbrev(),
  new Timeout(10 * time.Minute),
  new Reply(config.randomFolk)
);

new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})
  .on(Events.ClientReady, () => console.log("bot is ready"))
  .on(Events.MessageCreate, async (message) => await handler.handle(message))
  .login(config.token);
