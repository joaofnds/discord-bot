import { Client, Events, GatewayIntentBits } from "discord.js";
import { Abbrev } from "./chain/abbrev.mjs";
import { BotAuthorGuard } from "./chain/bot-author-guard.mjs";
import { linkChain } from "./chain/link-chain.mjs";
import { Reply } from "./chain/reply.mjs";
import { Timeout } from "./chain/timeout.mjs";
import { Config } from "./config.mjs";
import * as time from "./lib/time.mjs";

const config = Config.fromEnv();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const handler = linkChain(
  new BotAuthorGuard(),
  new Abbrev(),
  new Timeout(10 * time.Minute),
  new Reply(config.randomFolk)
);

await client
  .on(Events.ClientReady, () => console.log("bot is ready"))
  .on(Events.MessageCreate, async (m) => await handler.handle(m))
  .login(config.token);
