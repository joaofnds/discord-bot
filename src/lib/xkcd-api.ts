import { z } from "zod";
import { Random } from "./random.ts";

const comicSchema = z
  .object({
    num: z.number(),
    title: z.string(),
    img: z.string(),
  })
  .passthrough();

export class XKCDAPI {
  #url = "https://xkcd.com";

  constructor(private readonly rand: Random) {}

  async comic(number: number) {
    return await fetch(`${this.#url}/${number}/info.0.json`).then(
      async (response) => comicSchema.parse(await response.json()),
    );
  }

  async random() {
    return await fetch(`${this.#url}/info.0.json`)
      .then(async (response) => comicSchema.parse(await response.json()))
      .then((data) => this.comic(this.rand.intBetween(0, data.num)));
  }

  async image(url: string): Promise<Uint8Array> {
    return await fetch(url)
      .then((response) => response.arrayBuffer())
      .then((buffer) => new Uint8Array(buffer));
  }
}
