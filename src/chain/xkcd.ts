import { stupidID } from "../const.ts";
import { Msg } from "../discord/types.ts";
import { normalize } from "../lib/normalize.ts";
import { Chain } from "./chain.ts";

type Comic = { title: string; img: string };

type API = {
  comic(number: number): Promise<Comic>;
  random(): Promise<Comic>;
};

export class XKCD extends Chain {
  command = /^!xkcd/gi;

  constructor(private readonly api: API) {
    super();
  }

  override async handle(message: Msg) {
    const str = normalize(message.content);

    if (!this.command.test(str)) return this.next?.handle(message);

    const input = str.replace(this.command, "").trim();

    if (input === "random") {
      const comic = await this.api.random();
      await message.channel.send({ content: comic.title, files: [comic.img] });
      return;
    }

    const number = parseInt(input);
    if (Number.isNaN(number)) {
      message.react(stupidID);
      return;
    }

    const comic = await this.api.comic(number);
    await message.channel.send({ content: comic.title, files: [comic.img] });
  }
}
