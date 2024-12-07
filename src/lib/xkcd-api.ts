import { Random } from "./random.ts";

export class XKCDAPI {
  #url = "https://xkcd.com";

  constructor(private readonly rand: Random) {}

  async comic(number: number) {
    return await fetch(`${this.#url}/${number}/info.0.json`).then((response) =>
      response.json()
    );
  }

  async random() {
    return await fetch(`${this.#url}/info.0.json`)
      .then((response) => response.json())
      .then((data) => this.comic(this.rand.intBetween(0, data.num)));
  }
}
