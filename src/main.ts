import { Client, Events, GatewayIntentBits } from "discord.js";
import { Abbrev } from "./chain/abbrev.ts";
import { BotAuthorGuard } from "./chain/bot-author-guard.ts";
import { DeleteReply } from "./chain/delete-reply.ts";
import { GitHubIssue } from "./chain/github-issue.ts";
import { linkChain } from "./chain/link-chain.ts";
import { PragTip } from "./chain/pragtip.ts";
import { Reply } from "./chain/reply.ts";
import { Send } from "./chain/send.ts";
import { Timeout } from "./chain/timeout.ts";
import { XKCD } from "./chain/xkcd.ts";
import { Config } from "./config.ts";
import { livefireTextChannelID, purpurinaTextChannelID } from "./const.ts";
import { AccountantBot } from "./crons/accountant-bot.ts";
import { DadJokeBot } from "./crons/dad-joke-bot.ts";
import { DevDadJokeBot } from "./crons/dev-dad-joke-bot.ts";
import { PragTipBot } from "./crons/prag-tip-bot.ts";
import { RatesBot } from "./crons/rates-bot.ts";
import { Stanley5pmCron } from "./crons/stanley-5pm.ts";
import { SundayBot } from "./crons/sunday-bot.ts";
import { Wed4pmCron } from "./crons/wed-4pm.ts";
import { ClientWrapper } from "./discord/client-wrapper.ts";
import { WebhookBot } from "./discord/webhook-bot.ts";
import { ExchangeRates } from "./lib/exchange-rates.ts";
import { MathRandom } from "./lib/random.ts";
import time from "./lib/time.ts";
import { XKCDAPI } from "./lib/xkcd-api.ts";

const config = Config.fromEnv();
const random = new MathRandom();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const messageCreateChain = linkChain(
  new BotAuthorGuard(),
  new Abbrev(),
  new Timeout(10 * time.Minute),
  new Send(),
  new Reply({
    random,
    randomFolk: config.randomFolk,
    bunBot: new WebhookBot(config.bunBotURL),
  }),
  new PragTip(),
  new XKCD(new XKCDAPI(random)),
  new GitHubIssue("https://github.com/livefire-dev/lfapi/issues", [
    livefireTextChannelID,
    purpurinaTextChannelID,
  ]),
);

const messageDeleteChain = linkChain(new BotAuthorGuard(), new DeleteReply());

const crons = [
  new PragTipBot(new WebhookBot(config.pragTipBotURL), random),
  new RatesBot(
    new WebhookBot(config.richDadBotURL),
    new WebhookBot(config.poorDadBotURL),
    new ExchangeRates(config.openExchangeRatesAppID),
  ),
  new DadJokeBot(
    new WebhookBot(config.dadBotURL),
    config.rapidAPIURL,
    config.rapidAPIKey,
  ),
  new DevDadJokeBot(
    new WebhookBot(config.dadBotURL),
    "https://v2.jokeapi.dev/joke/Programming",
  ),
  new SundayBot(new WebhookBot(config.sundayBotURL)),
  new Stanley5pmCron(
    new ClientWrapper(client),
    new WebhookBot(config.stanleyBotURL),
  ),
  new Wed4pmCron(new WebhookBot(config.wed4pmBot)),
  new AccountantBot(new WebhookBot(config.accountantBotURL)),
];

function exit(code: number) {
  crons.forEach((cron) => cron.stop());
  client.destroy();
  Deno.exit(code);
}

await client
  .on(Events.ClientReady, () => {
    crons.forEach((cron) => cron.start());
    console.log("bot is ready");
  })
  .on(Events.MessageCreate, async (m) => await messageCreateChain.handle(m))
  .on(Events.MessageDelete, async (m) => await messageDeleteChain.handle(m))
  .on(Events.ShardDisconnect, () => {
    console.error("received shard disconnect, exiting...");
    exit(1);
  })
  .login(config.token);

for (const signal of ["SIGINT", "SIGTERM", "SIGABRT"] as const) {
  Deno.addSignalListener(signal, () => {
    console.log(`received ${signal}, exiting...`);
    exit(0);
  });
}
