import { Chain } from "./chain.mjs";
import { stupid } from "./emojis.mjs";
import { allCaptures, normalize, stupidCase } from "./util.mjs";

export class ReplyStupid extends Chain {
  regexes = Object.freeze([
    /(padrao)/gi,
    /(padroes)/gi,
    /(pattern)/gi,
    /(firebase)/gi,
    /(simples\b)/gi,
    /(deadline)/gi,
    /(light mode)/gi,
    /(Json)/g,
    /(Http)/g,
    /(Api)/g,
    /(Dto)/g,
    /(Url)/g,
    /(Uuid)/g,
    /(decorator)/g,
  ]);

  async handle(message) {
    const str = normalize(message.content);
    const captures = allCaptures(this.regexes, str);
    if (captures.length === 0) return this.next?.handle(message);

    await message.reply(
      `${captures.map((w) => stupidCase(w)).join(", ")} ${stupid}`,
    );
  }
}
