import {
  anonymous,
  bun,
  cLigaMeu,
  definitionOfEngineering,
  devops,
  eopt,
  feijoada,
  firebase,
  jose,
  linus,
  linux,
  nani,
  neverSaidThis,
  nothingStill,
  pqPraCuba,
  rules,
  thomasMP3,
  yourCodeIsGarbageIMG,
} from "../const.ts";
import { Bot } from "../discord/bot.ts";
import { Msg } from "../discord/types.ts";
import { normalize } from "../lib/normalize.ts";
import { Random } from "../lib/random.ts";
import { PlainReplier } from "../replier/plain-replier.ts";
import { ProbPlainReplier } from "../replier/prob-plain-replier.ts";
import { Replier } from "../replier/replier.ts";
import { SoundCloudReplier } from "../replier/soundcloud-replier.ts";
import { StupidReplier } from "../replier/stupid-replier.ts";
import { WebhookBotPlanReplier } from "../replier/webhook-bot-plain-replier.ts";
import { Chain } from "./chain.ts";

export class Reply extends Chain {
  private readonly responses: Replier[];

  constructor({
    random,
    randomFolk,
    bunBot,
  }: {
    random: Pick<Random, "chance">;
    randomFolk: string;
    bunBot: Bot;
  }) {
    super();
    this.responses = [
      new PlainReplier("Barros!", /e o pedro/i),
      new PlainReplier(eopt, /bolsonaro/i, /e [oa] .* hein/i),
      new PlainReplier(randomFolk, /citando aleatoriamente/i),
      new PlainReplier(devops, / (e|sou|os) devops/i, /contrat\w* devops/i),
      new PlainReplier(anonymous, /anonymous/i, /anonimo/i),
      new PlainReplier(nani, /(^|[^\?])\?{3}$/),
      new PlainReplier(feijoada, /feij\w+/i, /nada acontece/i),
      new PlainReplier(cLigaMeu, /c liga meu/i, /agencia do nubank/i),
      new PlainReplier(jose, /\bjose\b/i),
      new PlainReplier(firebase, /^firebase$/i),
      new PlainReplier(nothingStill, /e.o.pix(?!\.mp3)/i),
      new PlainReplier(rules, /!regras/),
      new PlainReplier(linus, /!linus/),
      new PlainReplier(definitionOfEngineering, /!engineering/),
      new PlainReplier("💀", /olavo/i),
      new PlainReplier(pqPraCuba, /(pq|(por que)) .* cara\?\!/i, /cuba/i),
      new PlainReplier(
        yourCodeIsGarbageIMG,
        /code.*garbage/i,
        /garbage.*code/i,
      ),
      new PlainReplier(neverSaidThis, /nunca (disse|falei)/i),
      new PlainReplier(thomasMP3, /release[-\s]train/i),
      new ProbPlainReplier(random, 0.1, linux, /(?<!\/)linux/i),
      new ProbPlainReplier(random, 0.01, firebase, /firebase/i),
      new StupidReplier(
        /(deadline)/i,
        /(entregar valor)/i,
        /(estima\w+)/i,
        /(legado)/i,
        /(light mode)/i,
        /(padron\w+)/i,
        /(seguranca)/i,
        /(code freeze)/i,
        /(Api)/,
        /(Dto)/,
        /(Http)/,
        /(Json)/,
        /(Url)/,
        /(Uuid)/,
        /(Uspsa)/,
        /(Idpa)/,
      ),
      new WebhookBotPlanReplier(bunBot, bun, /\bbun\b/i),
      new SoundCloudReplier(),
    ];
  }

  override async handle(message: Msg) {
    const str = normalize(message.content);

    for (const response of this.responses) {
      const reply = response.reply(str);
      if (reply) return await message.reply(reply);
    }

    this.next?.handle(message);
  }
}
