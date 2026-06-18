import { stupidID } from "../const.ts";
import { Msg } from "../discord/types.ts";
import { normalize } from "../lib/normalize.ts";
import { Slicer } from "../lib/slicer.ts";
import { Chain } from "./chain.ts";

type Comic = { title: string; img: string };

type API = {
  comic(number: number): Promise<Comic>;
  random(): Promise<Comic>;
  image(url: string): Promise<Uint8Array>;
};

export class XKCD extends Chain {
  command = /^!([a-z]{4})/i;
  private readonly canonical = "xkcd";

  constructor(
    private readonly api: API,
    private readonly slicer: Slicer,
  ) {
    super();
  }

  override async handle(message: Msg) {
    const str = normalize(message.content);
    const match = str.match(this.command);

    if (!match) return this.next?.handle(message);

    const token = match[1].toLowerCase();
    if (!this.isAnagram(token)) return this.next?.handle(message);

    const input = str.slice(match[0].length).trim();

    let comic: Comic;
    if (input === "random") {
      comic = await this.api.random();
    } else {
      const number = parseInt(input);
      if (Number.isNaN(number)) {
        message.react(stupidID);
        return;
      }
      comic = await this.api.comic(number);
    }

    const order = this.sliceOrder(token);
    if (this.isIdentity(order)) {
      await message.channel.send({ content: comic.title, files: [comic.img] });
      return;
    }

    const bytes = await this.api.image(comic.img);
    const resliced = await this.slicer.reslice(bytes, order);
    await message.channel.send({
      content: comic.title,
      files: [{ attachment: resliced, name: "xkcd.png" }],
    });
  }

  private isAnagram(token: string): boolean {
    return this.sorted(token) === this.sorted(this.canonical);
  }

  private sliceOrder(token: string): number[] {
    return [...token].map((letter) => this.canonical.indexOf(letter));
  }

  private isIdentity(order: number[]): boolean {
    return order.every((slice, index) => slice === index);
  }

  private sorted(text: string): string {
    return [...text].sort().join("");
  }
}
