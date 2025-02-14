import {
  anonymous,
  bun,
  cLigaMeu,
  devops,
  eopt,
  feijoada,
  firebase,
  jose,
  linus,
  linux,
  nani,
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

  constructor(
    { random, randomFolk, bunBot }: {
      random: Pick<Random, "chance">;
      randomFolk: string;
      bunBot: Bot;
    },
  ) {
    super();
    this.responses = [
      new PlainReplier("Barros!", /e o pedro/gi),
      new PlainReplier(eopt, /bolsonaro/gi, /e [oa] .* hein/gi),
      new PlainReplier(randomFolk, /citando aleatoriamente/gi),
      new PlainReplier(devops, / (e|sou|os) devops/gi, /contrat\w* devops/gi),
      new PlainReplier(anonymous, /anonymous/gi, /anonimo/gi),
      new PlainReplier(nani, /(^|[^\?])\?{3}$/),
      new PlainReplier(feijoada, /feij\w+/gi, /nada acontece/gi),
      new PlainReplier(cLigaMeu, /c liga meu/gi, /agencia do nubank/gi),
      new PlainReplier(jose, /\bjose\b/gi),
      new PlainReplier(firebase, /^firebase$/gi),
      new PlainReplier(nothingStill, /e.o.pix(?!\.mp3)/i),
      new PlainReplier(rules, /!regras/),
      new PlainReplier(linus, /!linus/),
      new PlainReplier("💀", /olavo/i),
      new PlainReplier(pqPraCuba, /(pq|(por que)) .* cara\?\!/i, /cuba/i),
      new PlainReplier(
        yourCodeIsGarbageIMG,
        /code.*garbage/i,
        /garbage.*code/i,
      ),
      new PlainReplier(thomasMP3, /release[-\s]train/i),
      new ProbPlainReplier(random, 0.1, linux, /(?<!\/)linux/gi),
      new ProbPlainReplier(random, 0.01, firebase, /firebase/gi),
      new StupidReplier(
        /(deadline)/gi,
        /(entregar valor)/gi,
        /(estima\w+)/gi,
        /(legado)/gi,
        /(light mode)/gi,
        /(padron\w+)/gi,
        /(seguranca)/gi,
        /(Api)/g,
        /(Dto)/g,
        /(Http)/g,
        /(Json)/g,
        /(Url)/g,
        /(Uuid)/g,
        /(Uspsa)/g,
        /(Idpa)/g,
        /(.*eu nunca (?:disse|falei) isso.*)/gi,
      ),
      new WebhookBotPlanReplier(bunBot, bun, /\bbun\b/gi),
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
