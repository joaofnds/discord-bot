import { Chain } from "./chain.mjs";
import { stupid } from "./emojis.mjs";
import { allCaptures, normalize, stupidCase } from "./util.mjs";

export class ReplyStupid extends Chain {
  regexes = Object.freeze([
    /(deadline)/gi,
    /(decorator)/gi,
    /(firebase)/gi,
    /(legado)/gi,
    /(light mode)/gi,
    /(mape[ai]\w+)/gi,
    /(padra?o\w*)/gi,
    /(pattern)/gi,
    /(simples\b)/gi,

    /(Api)/g,
    /(Dto)/g,
    /(Http)/g,
    /(Json)/g,
    /(Url)/g,
    /(Uuid)/g,
  ]);

  async handle(message) {
    const str = normalize(message.content);
    const captures = allCaptures(this.regexes, str);
    if (captures.length === 0) return this.next?.handle(message);

    await message.reply(
      `${captures.map((w) => stupidCase(w)).join(", ")} ${stupid}`
    );
  }
}
