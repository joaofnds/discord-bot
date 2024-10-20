import { Client, Events, GatewayIntentBits } from "discord.js";
import { Abbrev } from "./chain/abbrev.mjs";
import { BotAuthorGuard } from "./chain/bot-author-guard.mjs";
import { DeleteReply } from "./chain/delete-reply.mjs";
import { GitHubIssue } from "./chain/github-issue.mjs";
import { linkChain } from "./chain/link-chain.mjs";
import { PragTip } from "./chain/pragtip.mjs";
import { Reply } from "./chain/reply.mjs";
import { Send } from "./chain/send.mjs";
import { Timeout } from "./chain/timeout.mjs";
import { XKCD } from "./chain/xkcd.mjs";
import { Config } from "./config.mjs";
import { livefireTextChannelID, purpurinaTextChannelID } from "./const.mjs";
import { AccountantBot } from "./crons/accountant-bot.mjs";
import { DadJokeBot } from "./crons/dad-joke-bot.mjs";
import { DevDadJokeBot } from "./crons/dev-dad-joke-bot.mjs";
import { PragTipBot } from "./crons/prag-tip-bot.mjs";
import { RatesBot } from "./crons/rates-bot.mjs";
import { Stanley5pmCron } from "./crons/stanley-5pm.mjs";
import { SundayBot } from "./crons/sunday-bot.mjs";
import { Wed4pmCron } from "./crons/wed-4pm.mjs";
import { ClientWrapper } from "./discord/client-wrapper.mjs";
import { WebhookBot } from "./discord/webhook-bot.mjs";
import time from "./lib/time.mjs";
import { XKCDAPI } from "./lib/xkcd-api.mjs";

const config = Config.fromEnv();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

function exit(code) {
	client.destroy();
	process.exit(code);
}

const messageCreateChain = linkChain(
	new BotAuthorGuard(),
	new Abbrev(),
	new Timeout(10 * time.Minute),
	new Send(),
	new Reply({
		randomFolk: config.randomFolk,
		bunBot: new WebhookBot(config.bunBotURL),
	}),
	new PragTip(),
	new XKCD(new XKCDAPI()),
	new GitHubIssue("https://github.com/livefire-dev/lfapi/issues", [
		livefireTextChannelID,
		purpurinaTextChannelID,
	]),
);

const messageDeleteChain = linkChain(new BotAuthorGuard(), new DeleteReply());

const crons = [
	new PragTipBot(new WebhookBot(config.pragTipBotURL)),
	new RatesBot(
		new WebhookBot(config.richDadBotURL),
		new WebhookBot(config.poorDadBotURL),
		"http://api.exchangeratesapi.io/v1/latest",
		config.exchangeRatesAPIKey,
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

for (const signal of ["SIGINT", "SIGTERM", "SIGABRT"]) {
	process.on(signal, () => {
		console.log(`received ${signal}, exiting...`);
		exit(0);
	});
}
