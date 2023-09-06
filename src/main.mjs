import { Client, Events, GatewayIntentBits } from "discord.js";
import { Abbrev } from "./chain/abbrev.mjs";
import { BotAuthorGuard } from "./chain/bot-author-guard.mjs";
import { linkChain } from "./chain/link-chain.mjs";
import { Reply } from "./chain/reply.mjs";
import { Timeout } from "./chain/timeout.mjs";
import { Config } from "./config.mjs";
import { Stanley5pmCron } from "./crons/stanley-5pm.mjs";
import { ClientWrapper } from "./discord/client-wrapper.mjs";
import { WebhookBot } from "./discord/webhook-bot.mjs";
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

const crons = [
  new Stanley5pmCron(
    new ClientWrapper(client),
    new WebhookBot(config.stanleyBotURL)
  ),
];

await client
  .on(Events.ClientReady, () => {
    crons.forEach((cron) => cron.start());
    console.log("bot is ready");
  })
  .on(Events.MessageCreate, async (m) => await handler.handle(m))
  .login(config.token);
