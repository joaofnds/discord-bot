import { stupid } from "./emojis.mjs";
import { allCaptures, normalize, stupidCase } from "./util.mjs";

export class ReplyStupid {
  regexes = [
    /(padrao)/gi,
    /(padroes)/gi,
    /(pattern)/gi,
    /(firebase)/gi,
    /(simples)/gi,
    /(Json)/g,
    /(Http)/g,
    /(Api)/g,
    /(Dto)/g,
  ];

  async perform(message) {
    const captures = allCaptures(this.regexes, normalize(message.content));
    if (captures.length === 0) return;

    await message.reply(
      `${captures.map((w) => stupidCase(w)).join(", ")}  ${stupid}`
    );
  }
}
